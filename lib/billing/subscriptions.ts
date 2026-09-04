import { getStripe } from "@/lib/stripe/server";
import {
  getPlanBySlug,
  getStripePriceId,
  type BillingInterval,
} from "@/config/stripe";
import { createClient } from "@/lib/supabase/server";
import { requireBillingPermission, BillingError } from "./context";
import { getOrganizationSubscription } from "./queries";
import { createCheckoutSession } from "./checkout";
import { revalidatePath } from "next/cache";

/**
 * Cancel the organization's subscription at the end of the current billing period.
 * Stripe is the source of truth — the webhook will sync the updated state.
 */
export async function cancelSubscriptionAtPeriodEnd(): Promise<void> {
  const ctx = await requireBillingPermission();

  const sub = await getOrganizationSubscription(ctx.organization.id);
  if (!sub || !sub.stripe_subscription_id) {
    throw new BillingError(
      "NO_SUBSCRIPTION",
      "Your organization does not have an active subscription to cancel."
    );
  }

  const stripe = getStripe();
  await stripe.subscriptions.update(sub.stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  // Optimistically update local state — webhook will confirm.
  const supabase = await createClient();
  await supabase
    .from("subscriptions")
    .update({ cancel_at_period_end: true })
    .eq("id", sub.id);

  revalidatePath("/dashboard/billing");
}

/**
 * Reactivate a subscription that was scheduled for cancellation at period end.
 */
export async function reactivateSubscription(): Promise<void> {
  const ctx = await requireBillingPermission();

  const supabase = await createClient();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .eq("cancel_at_period_end", true)
    .in("status", ["active", "trialing", "past_due"])
    .maybeSingle();

  if (!sub || !sub.stripe_subscription_id) {
    throw new BillingError(
      "NO_SUBSCRIPTION",
      "No subscription scheduled for cancellation was found."
    );
  }

  const stripe = getStripe();
  await stripe.subscriptions.update(sub.stripe_subscription_id, {
    cancel_at_period_end: false,
  });

  await supabase
    .from("subscriptions")
    .update({ cancel_at_period_end: false })
    .eq("id", sub.id);

  revalidatePath("/dashboard/billing");
}

/**
 * Change the organization's plan.
 *
 * If the org has no subscription: create a Checkout Session (initial upgrade).
 * If the org has a subscription: update the subscription item's price via Stripe API.
 *   - Proration is handled by Stripe.
 *   - The webhook (customer.subscription.updated) will sync the local DB.
 *
 * Never trusts client-provided Stripe IDs. Price is resolved server-side.
 */
export async function changePlan(
  planSlug: string,
  interval: BillingInterval
): Promise<{ url?: string; message?: string }> {
  const ctx = await requireBillingPermission();

  // Validate the target plan.
  const plan = getPlanBySlug(planSlug);
  if (!plan) {
    throw new BillingError("INVALID_PLAN", "The selected plan does not exist.");
  }
  if (plan.isFree) {
    throw new BillingError(
      "INVALID_PLAN",
      "To downgrade to Free, please cancel your current subscription."
    );
  }

  const priceId = getStripePriceId(planSlug, interval);
  if (!priceId) {
    throw new BillingError(
      "STRIPE_NOT_CONFIGURED",
      `Stripe pricing for ${plan.name} (${interval}ly) is not configured.`
    );
  }

  // Check if the org already has a subscription.
  const existing = await getOrganizationSubscription(ctx.organization.id);

  if (!existing || !existing.stripe_subscription_id) {
    // No active subscription — go through Checkout.
    return createCheckoutSession({ planSlug, interval });
  }

  // Already subscribed — update the subscription item's price.
  const stripe = getStripe();

  // Retrieve the full subscription to get the item ID.
  const subscription = await stripe.subscriptions.retrieve(
    existing.stripe_subscription_id
  );

  const itemId = subscription.items.data[0]?.id;
  if (!itemId) {
    throw new BillingError(
      "STRIPE_ERROR",
      "Could not resolve subscription item. Please contact support."
    );
  }

  await stripe.subscriptions.update(existing.stripe_subscription_id, {
    items: [{ id: itemId, price: priceId }],
    proration_behavior: "create_prorations",
    metadata: {
      organization_id: ctx.organization.id,
      plan_slug: planSlug,
    },
  });

  revalidatePath("/dashboard/billing");

  return {
    message: `Your plan has been updated to ${plan.name} (${interval}ly). Changes take effect immediately with proration.`,
  };
}
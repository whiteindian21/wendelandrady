/**
 * Subscription synchronization logic used by the Stripe webhook.
 *
 * All DB operations use the service-role admin client because Stripe
 * webhooks are not authenticated as application users. Signature
 * verification is done BEFORE any function here is called.
 */

import type Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPlanByPriceId } from "@/config/stripe";

function toISO(seconds: number | null | undefined): string | null {
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

function getCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer): string {
  if (typeof customer === "string") return customer;
  return customer.id;
}

/**
 * Resolve the organization ID for a Stripe subscription.
 *
 * Strategy (in order):
 * 1. subscription.metadata.organization_id
 * 2. organizations table lookup by stripe_customer_id
 * 3. subscriptions table lookup by stripe_subscription_id
 *
 * Returns null if no organization can be safely identified.
 */
async function resolveOrganizationId(
  subscription: Stripe.Subscription
): Promise<string | null> {
  const admin = getSupabaseAdmin();

  // 1. Metadata.
  if (subscription.metadata?.organization_id) {
    return subscription.metadata.organization_id;
  }

  // 2. Lookup by stripe_customer_id.
  const customerId = getCustomerId(subscription.customer);
  if (customerId) {
    const { data: org } = await admin
      .from("organizations")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    if (org) return org.id;
  }

  // 3. Lookup by stripe_subscription_id in existing subscriptions.
  const { data: existing } = await admin
    .from("subscriptions")
    .select("organization_id")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();
  if (existing) return existing.organization_id;

  return null;
}

/**
 * Resolve the plan_id from a Stripe price ID.
 */
async function resolvePlanId(priceId: string | undefined): Promise<string | null> {
  if (!priceId) return null;
  const planInfo = getPlanByPriceId(priceId);
  if (!planInfo) return null;

  const admin = getSupabaseAdmin();
  const { data: plan } = await admin
    .from("plans")
    .select("id")
    .eq("slug", planInfo.plan.slug)
    .maybeSingle();

  return plan?.id ?? null;
}

/**
 * Synchronize a Stripe Subscription into the local database.
 *
 * - Resolves the organization via metadata, customer ID, or existing record.
 * - Prevents cross-org subscription assignment.
 * - Manually checks for existence to avoid Postgres partial index inference issues with upsert.
 */
export async function syncSubscription(
  subscription: Stripe.Subscription
): Promise<void> {
  const admin = getSupabaseAdmin();

  const organizationId = await resolveOrganizationId(subscription);

  if (!organizationId) {
    console.error(
      `[stripe-sync] Could not resolve organization for subscription ${subscription.id} — skipping.`
    );
    return;
  }

  // Prevent cross-org assignment.
  const { data: existingSub } = await admin
    .from("subscriptions")
    .select("id, organization_id")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  if (existingSub && existingSub.organization_id !== organizationId) {
    console.error(
      `[stripe-sync] Subscription ${subscription.id} belongs to org ${existingSub.organization_id} but event resolved to org ${organizationId} — refusing to reassign.`
    );
    return;
  }

  // Resolve plan.
  const priceId = subscription.items.data[0]?.price?.id;
  const planInfo = priceId ? getPlanByPriceId(priceId) : null;
  const planId = await resolvePlanId(priceId);

  const customerId = getCustomerId(subscription.customer);

  const subscriptionData = {
    organization_id: organizationId,
    plan_id: planId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId ?? null,
    status: subscription.status,
    interval: planInfo?.interval ?? null,
    current_period_start: toISO(subscription.current_period_start),
    current_period_end: toISO(subscription.current_period_end),
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: toISO(subscription.canceled_at),
    trial_start: toISO(subscription.trial_start),
    trial_end: toISO(subscription.trial_end),
    metadata: subscription.metadata ?? {},
  };

  let error;
  if (existingSub) {
    // Update existing record
    const { error: updateError } = await admin
      .from("subscriptions")
      .update(subscriptionData)
      .eq("id", existingSub.id);
    error = updateError;
  } else {
    // Insert new record
    const { error: insertError } = await admin
      .from("subscriptions")
      .insert(subscriptionData);
    error = insertError;
  }

  if (error) {
    console.error(
      `[stripe-sync] Failed to upsert subscription ${subscription.id}:`,
      error
    );
    throw error;
  }

  // Ensure the org's stripe_customer_id is stored.
  if (customerId) {
    await admin
      .from("organizations")
      .update({ stripe_customer_id: customerId })
      .eq("id", organizationId)
      .is("stripe_customer_id", null);
  }
}

/**
 * Handle subscription deletion — mark as canceled, preserve the record.
 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const admin = getSupabaseAdmin();

  const { error } = await admin
    .from("subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
      cancel_at_period_end: false,
      current_period_end: toISO(subscription.current_period_end),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error(
      `[stripe-sync] Failed to mark subscription ${subscription.id} as canceled:`,
      error
    );
    throw error;
  }
}

/**
 * Handle checkout.session.completed — sync subscription and ensure
 * the org's stripe_customer_id is set.
 */
export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const admin = getSupabaseAdmin();

  const organizationId = session.metadata?.organization_id;

  // Store the customer ID on the org if not already set.
  if (organizationId && session.customer) {
    const customerId = getCustomerId(session.customer);
    await admin
      .from("organizations")
      .update({ stripe_customer_id: customerId })
      .eq("id", organizationId)
      .is("stripe_customer_id", null);
  }

  // Sync the subscription if present.
  if (session.subscription) {
    const { getStripe } = await import("@/lib/stripe/server");
    const stripe = getStripe();
    const subId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;
    const subscription = await stripe.subscriptions.retrieve(subId);
    await syncSubscription(subscription);
  }
}

/**
 * Handle invoice.paid — sync the subscription to update billing period.
 */
export async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  if (!invoice.subscription) return;

  const { getStripe } = await import("@/lib/stripe/server");
  const stripe = getStripe();
  const subId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription.id;
  const subscription = await stripe.subscriptions.retrieve(subId);
  await syncSubscription(subscription);
}

/**
 * Handle invoice.payment_failed — update subscription status.
 * Stripe is the source of truth; we set past_due as a reasonable local
 * representation. The subsequent customer.subscription.updated event
 * will also sync the authoritative status.
 */
export async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
): Promise<void> {
  if (!invoice.subscription) return;

  const admin = getSupabaseAdmin();
  const subId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription.id;

  const { error } = await admin
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("stripe_subscription_id", subId);

  if (error) {
    console.error(
      `[stripe-sync] Failed to update subscription ${subId} after payment failure:`,
      error
    );
    throw error;
  }
}
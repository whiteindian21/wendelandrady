import { getStripe } from "@/lib/stripe/server";
import { getAppUrl, getPlanBySlug, getStripePriceId, type BillingInterval } from "@/config/stripe";
import { getOrCreateStripeCustomer } from "./customers";
import { requireBillingPermission, BillingError } from "./context";

export interface CheckoutParams {
  planSlug: string;
  interval: BillingInterval;
}

/**
 * Create a Stripe Checkout Session for subscribing to a paid plan.
 *
 * Security:
 * - Authenticates the user (requireBillingPermission).
 * - Verifies org membership and billing permission (owner/admin only).
 * - Resolves the Stripe Price ID server-side — never from the browser.
 * - Uses the org's Stripe customer (creates if needed).
 * - Embeds organization_id + plan_slug in metadata for webhook reconciliation.
 *
 * Returns the Checkout Session URL for client-side redirect.
 */
export async function createCheckoutSession(
  params: CheckoutParams
): Promise<{ url: string }> {
  const ctx = await requireBillingPermission();

  const { planSlug, interval } = params;

  // Validate the plan exists and is not free.
  const plan = getPlanBySlug(planSlug);
  if (!plan) {
    throw new BillingError("INVALID_PLAN", "The selected plan does not exist.");
  }
  if (plan.isFree) {
    throw new BillingError(
      "INVALID_PLAN",
      "The Free plan does not require checkout."
    );
  }

  // Resolve the Stripe Price ID server-side.
  const priceId = getStripePriceId(planSlug, interval);
  if (!priceId) {
    throw new BillingError(
      "STRIPE_NOT_CONFIGURED",
      `Stripe pricing for ${plan.name} (${interval}ly) is not configured. Please contact support.`
    );
  }

  // Get or create the Stripe Customer for this organization.
  const customerId = await getOrCreateStripeCustomer(ctx);

  // Create the Checkout Session.
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${getAppUrl()}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getAppUrl()}/dashboard/billing/cancel`,
    metadata: {
      organization_id: ctx.organization.id,
      plan_slug: planSlug,
    },
    subscription_data: {
      metadata: {
        organization_id: ctx.organization.id,
        plan_slug: planSlug,
      },
    },
    allow_promotion_codes: true,
  });

  if (!session.url) {
    throw new BillingError(
      "STRIPE_ERROR",
      "Stripe did not return a checkout URL. Please try again."
    );
  }

  return { url: session.url };
}
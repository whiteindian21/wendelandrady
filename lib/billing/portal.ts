import { getStripe } from "@/lib/stripe/server";
import { getAppUrl } from "@/config/stripe";
import { getOrCreateStripeCustomer } from "./customers";
import { requireBillingPermission } from "./context";

/**
 * Create a Stripe Customer Portal session for the organization.
 *
 * Security:
 * - Authenticates user and verifies billing permission (owner/admin).
 * - Resolves the customer ID server-side — never from the browser.
 * - Returns a portal URL for client-side redirect.
 */
export async function createPortalSession(): Promise<{ url: string }> {
  const ctx = await requireBillingPermission();

  const customerId = await getOrCreateStripeCustomer(ctx);

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${getAppUrl()}/dashboard/billing`,
  });

  return { url: session.url };
}
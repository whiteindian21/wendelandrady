import { getStripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import type { BillingContext } from "./context";

/**
 * Get or create a Stripe Customer for an organization.
 *
 * - Reuses `stripe_customer_id` if already stored on the organization.
 * - Creates a new Stripe Customer if none exists.
 * - Stores the customer ID on the organization.
 * - Associates `organization_id` in customer metadata for webhook reconciliation.
 *
 * Never trusts a client-provided customer ID. The customer is always
 * resolved server-side from the authenticated organization context.
 */
export async function getOrCreateStripeCustomer(
  ctx: BillingContext
): Promise<string> {
  // 1. Reuse existing customer if already stored.
  if (ctx.organization.stripe_customer_id) {
    return ctx.organization.stripe_customer_id;
  }

  // 2. Create a new Stripe Customer.
  const stripe = getStripe();
  const customer = await stripe.customers.create({
    name: ctx.organization.name,
    metadata: {
      organization_id: ctx.organization.id,
      organization_name: ctx.organization.name,
    },
  });

  // 3. Store the customer ID on the organization.
  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ stripe_customer_id: customer.id })
    .eq("id", ctx.organization.id);

  if (error) {
    console.error(
      `[billing] Failed to store stripe_customer_id for org ${ctx.organization.id}:`,
      error
    );
  }

  return customer.id;
}
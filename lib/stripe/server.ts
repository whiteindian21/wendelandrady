import Stripe from "stripe";
import { isStripeConfigured } from "@/config/stripe";

/**
 * Server-only Stripe SDK instance.
 *
 * SECURITY: This module MUST NEVER be imported from a client component.
 * It is only safe to import from:
 *   - Server Actions ("use server" files)
 *   - Route Handlers (app/api directory)
 *   - Server Components
 *
 * The Stripe secret key is read from STRIPE_SECRET_KEY and is never
 * exposed to the browser. Never create NEXT_PUBLIC_STRIPE_SECRET_KEY.
 */

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY in your environment variables."
    );
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
      typescript: true,
      maxNetworkRetries: 3,
    });
  }
  return _stripe;
}

export type { Stripe };
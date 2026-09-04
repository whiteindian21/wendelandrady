import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isStripeWebhookConfigured } from "@/config/stripe";
import {
  syncSubscription,
  handleSubscriptionDeleted,
  handleCheckoutCompleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
} from "@/lib/billing/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe Webhook Handler
 *
 * Critical requirements enforced:
 * 1. Raw request body used for signature verification (req.text(), NOT req.json()).
 * 2. STRIPE_WEBHOOK_SECRET verified via constructEvent — invalid signatures rejected.
 * 3. Idempotency via stripe_events table (unique on stripe_event_id).
 * 4. Service-role Supabase client used ONLY here (after signature verification).
 * 5. Cross-org subscription assignment prevented in sync logic.
 * 6. No secrets or raw Stripe errors exposed in responses.
 */
export async function POST(req: NextRequest) {
  // 1. Read the RAW body — do NOT parse JSON before verification.
  const body = await req.text();

  // 2. Read the Stripe signature header.
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  // 3. Verify the webhook secret is configured.
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !isStripeWebhookConfigured()) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json(
      { error: "Webhook not configured." },
      { status: 500 }
    );
  }

  // 4. Verify the signature — this throws if invalid.
  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature." },
      { status: 400 }
    );
  }

  // 5. Idempotency — try to insert the event record.
  //    If INSERT fails with 23505 (unique violation), it's a duplicate.
  const admin = getSupabaseAdmin();

  const { error: insertError } = await admin.from("stripe_events").insert({
    stripe_event_id: event.id,
    event_type: event.type, // FIXED: using event_type to match Stage 2 schema
    payload: event as unknown as Record<string, unknown>,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      // Duplicate event — already processed or being processed concurrently.
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("[stripe-webhook] Failed to record event:", insertError);
    return NextResponse.json(
      { error: "Failed to process event." },
      { status: 500 }
    );
  }

  // 6. Process the event.
  try {
    await processEvent(event);

    // Mark as processed.
    await admin
      .from("stripe_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("stripe_event_id", event.id);

    // Invalidate billing page cache.
    revalidatePath("/dashboard/billing");

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(
      `[stripe-webhook] Error processing event ${event.id} (${event.type}):`,
      err
    );

    // Record the error on the event for debugging.
    await admin
      .from("stripe_events")
      .update({
        error: err instanceof Error ? err.message : String(err),
      })
      .eq("stripe_event_id", event.id);

    // Return 500 so Stripe retries.
    return NextResponse.json(
      { error: "Event processing failed." },
      { status: 500 }
    );
  }
}

async function processEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }

    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscription(subscription);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscription(subscription);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaid(invoice);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaymentFailed(invoice);
      break;
    }

    default:
      // Unhandled event type — not an error, just log it.
      console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
  }
}
"use server";

import { createCheckoutSession } from "@/lib/billing/checkout";
import { createPortalSession } from "@/lib/billing/portal";
import {
  cancelSubscriptionAtPeriodEnd,
  reactivateSubscription,
  changePlan,
} from "@/lib/billing/subscriptions";
import { BillingError } from "@/lib/billing/context";
import type { BillingInterval } from "@/config/stripe";

export type ActionResult =
  | { ok: true; url?: string; message?: string }
  | { ok: false; error: string; code: string };

function handleError(err: unknown): ActionResult {
  if (err instanceof BillingError) {
    return { ok: false, error: err.message, code: err.code };
  }
  console.error("[billing-action] Unexpected error:", err);
  return {
    ok: false,
    error: "An unexpected error occurred. Please try again.",
    code: "INTERNAL",
  };
}

export async function startCheckoutAction(
  planSlug: string,
  interval: BillingInterval
): Promise<ActionResult> {
  try {
    const { url } = await createCheckoutSession({ planSlug, interval });
    return { ok: true, url };
  } catch (err) {
    return handleError(err);
  }
}

export async function openPortalAction(): Promise<ActionResult> {
  try {
    const { url } = await createPortalSession();
    return { ok: true, url };
  } catch (err) {
    return handleError(err);
  }
}

export async function cancelSubscriptionAction(): Promise<ActionResult> {
  try {
    await cancelSubscriptionAtPeriodEnd();
    return {
      ok: true,
      message:
        "Your subscription will cancel at the end of the current billing period.",
    };
  } catch (err) {
    return handleError(err);
  }
}

export async function reactivateSubscriptionAction(): Promise<ActionResult> {
  try {
    await reactivateSubscription();
    return {
      ok: true,
      message: "Your subscription has been reactivated.",
    };
  } catch (err) {
    return handleError(err);
  }
}

export async function changePlanAction(
  planSlug: string,
  interval: BillingInterval
): Promise<ActionResult> {
  try {
    const result = await changePlan(planSlug, interval);
    return { ok: true, url: result.url, message: result.message };
  } catch (err) {
    return handleError(err);
  }
}
import { createClient } from "@/lib/supabase/server";
import { getActiveOrganization } from "./context";
import { getPlanBySlug, getPlanByPriceId, FREE_PLAN_SLUG, type PlanConfig } from "@/config/stripe";
import type { Database } from "@/lib/database.types";

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
type Plan = Database["public"]["Tables"]["plans"]["Row"];

export interface BillingOverview {
  planSlug: string;
  planName: string;
  isFree: boolean;
  subscription: Subscription | null;
  status: string | null;
  interval: "month" | "year" | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
}

/**
 * Retrieve the active subscription for the current user's active organization.
 * Returns null if the organization has no paid subscription (i.e., is on Free).
 */
export async function getOrganizationSubscription(
  organizationId: string
): Promise<Subscription | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("organization_id", organizationId)
    .in("status", ["active", "trialing", "past_due", "unpaid"])
    .maybeSingle();

  return data;
}

/**
 * Retrieve the most recent subscription record for an organization,
 * including canceled ones. Useful for historical display.
 */
export async function getOrganizationSubscriptionHistory(
  organizationId: string
): Promise<Subscription[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

/**
 * Resolve the plan configuration for an organization.
 * Falls back to the Free plan if no active subscription exists.
 */
export async function getOrganizationPlan(
  organizationId: string
): Promise<{ config: PlanConfig; subscription: Subscription | null }> {
  const subscription = await getOrganizationSubscription(organizationId);

  if (!subscription || !subscription.stripe_price_id) {
    const freePlan = getPlanBySlug(FREE_PLAN_SLUG)!;
    return { config: freePlan, subscription: null };
  }

  const planInfo = getPlanByPriceId(subscription.stripe_price_id);
  if (planInfo) {
    return { config: planInfo.plan, subscription };
  }

  // Price ID didn't match any configured plan — fall back to Free
  // but preserve the subscription record for display.
  const freePlan = getPlanBySlug(FREE_PLAN_SLUG)!;
  return { config: freePlan, subscription };
}

/**
 * Does the organization have an active (or trialing) subscription?
 */
export async function hasActiveSubscription(
  organizationId: string
): Promise<boolean> {
  const sub = await getOrganizationSubscription(organizationId);
  if (!sub) return false;
  return sub.status === "active" || sub.status === "trialing";
}

/**
 * Can the organization access a paid feature?
 * True if they have an active subscription OR a past_due subscription
 * (Stripe gives a grace period).
 */
export async function canAccessPaidFeature(
  organizationId: string
): Promise<boolean> {
  const sub = await getOrganizationSubscription(organizationId);
  if (!sub) return false;
  return ["active", "trialing", "past_due"].includes(sub.status);
}

/**
 * Get a complete billing overview for the current user's active organization.
 * This is the primary data-fetching function for the billing page.
 */
export async function getBillingOverview(): Promise<BillingOverview | null> {
  const ctx = await getActiveOrganization();
  if (!ctx) return null;

  const { config, subscription } = await getOrganizationPlan(
    ctx.organization.id
  );

  return {
    planSlug: config.slug,
    planName: config.name,
    isFree: config.isFree,
    subscription,
    status: subscription?.status ?? null,
    interval: (subscription?.interval as "month" | "year" | null) ?? null,
    currentPeriodStart: subscription?.current_period_start ?? null,
    currentPeriodEnd: subscription?.current_period_end ?? null,
    cancelAtPeriodEnd: subscription?.cancel_at_period_end ?? false,
    canceledAt: subscription?.canceled_at ?? null,
  };
}

/**
 * Fetch all active plans from the database for display.
 */
export async function getAvailablePlans(): Promise<Plan[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return data ?? [];
}
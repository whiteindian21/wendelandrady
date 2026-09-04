/**
 * Centralized Stripe configuration.
 *
 * Stripe price IDs are read from environment variables so the boilerplate
 * buyer can configure their own Stripe account without editing source code.
 *
 * The `plans` table in the database mirrors this configuration and is the
 * source of truth for plan existence and metadata exposed at runtime.
 * Stripe price IDs, however, are ALWAYS resolved here (server-side) and
 * never accepted from the browser.
 */

export type BillingInterval = "month" | "year";

export interface PlanConfig {
  slug: string;
  name: string;
  description: string;
  isFree: boolean;
  monthlyPriceId: string | null;
  yearlyPriceId: string | null;
  /** Display price in USD cents (for marketing/UI only — Stripe is source of truth). */
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  features: string[];
  limits: Record<string, number | null>;
  highlight?: boolean;
  sortOrder: number;
}

function priceId(envVar: string | undefined): string | null {
  if (!envVar || envVar.trim() === "") return null;
  return envVar.trim();
}

export const PLANS: PlanConfig[] = [
  {
    slug: "free",
    name: "Free",
    description: "Everything you need to get started.",
    isFree: true,
    monthlyPriceId: null,
    yearlyPriceId: null,
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "1 organization",
      "Up to 5 members",
      "Community support",
    ],
    limits: {
      maxOrganizations: 1,
      maxMembersPerOrg: 5,
    },
    sortOrder: 0,
  },
  {
    slug: "pro",
    name: "Pro",
    description: "For growing teams that need more power.",
    isFree: false,
    monthlyPriceId: priceId(process.env.STRIPE_PRICE_PRO_MONTHLY),
    yearlyPriceId: priceId(process.env.STRIPE_PRICE_PRO_YEARLY),
    monthlyPrice: 2900,
    yearlyPrice: 29000,
    features: [
      "Unlimited organizations",
      "Up to 25 members per org",
      "Priority email support",
      "Advanced analytics",
    ],
    limits: {
      maxOrganizations: null,
      maxMembersPerOrg: 25,
    },
    highlight: true,
    sortOrder: 1,
  },
  {
    slug: "business",
    name: "Business",
    description: "For organizations that need scale and control.",
    isFree: false,
    monthlyPriceId: priceId(process.env.STRIPE_PRICE_BUSINESS_MONTHLY),
    yearlyPriceId: priceId(process.env.STRIPE_PRICE_BUSINESS_YEARLY),
    monthlyPrice: 9900,
    yearlyPrice: 99000,
    features: [
      "Unlimited organizations",
      "Unlimited members",
      "Dedicated support",
      "SSO & SAML",
      "Audit logs",
      "Custom integrations",
    ],
    limits: {
      maxOrganizations: null,
      maxMembersPerOrg: null,
    },
    sortOrder: 2,
  },
];

export const FREE_PLAN_SLUG = "free";

export function getPlanBySlug(slug: string): PlanConfig | undefined {
  return PLANS.find((p) => p.slug === slug);
}

export function getPlanByPriceId(
  priceId: string
): { plan: PlanConfig; interval: BillingInterval } | null {
  for (const plan of PLANS) {
    if (plan.monthlyPriceId === priceId)
      return { plan, interval: "month" };
    if (plan.yearlyPriceId === priceId)
      return { plan, interval: "year" };
  }
  return null;
}

/**
 * Resolve a Stripe Price ID server-side from plan slug + interval.
 * Returns null if the plan is free or the price ID is not configured.
 */
export function getStripePriceId(
  planSlug: string,
  interval: BillingInterval
): string | null {
  const plan = getPlanBySlug(planSlug);
  if (!plan) return null;
  if (plan.isFree) return null;
  return interval === "month" ? plan.monthlyPriceId : plan.yearlyPriceId;
}

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_SECRET_KEY.trim() !== ""
  );
}

export function isStripeWebhookConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_WEBHOOK_SECRET &&
      process.env.STRIPE_WEBHOOK_SECRET.trim() !== ""
  );
}

export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}
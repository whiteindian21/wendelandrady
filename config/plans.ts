// config/plans.ts (or integrate into config/stripe.ts)

// ============================================================
//  NEW: Subscription plans (for multi‑tenant SaaS billing)
// ============================================================

export interface PlanLimits {
  maxProjects: number | null; // null = unlimited
  maxMembers: number | null;
  maxApiRequests: number | null; // per month
}

export interface PlanConfig {
  slug: string;
  name: string;
  isFree: boolean;
  limits: PlanLimits;
  features: string[]; // e.g., ['sso', 'audit_logs']
  sortOrder: number;
}

export const PLANS: PlanConfig[] = [
  {
    slug: "free",
    name: "Free",
    isFree: true,
    limits: { maxProjects: 3, maxMembers: 5, maxApiRequests: 1000 },
    features: ["basic_analytics"],
    sortOrder: 0,
  },
  {
    slug: "pro",
    name: "Pro",
    isFree: false,
    limits: { maxProjects: 25, maxMembers: 25, maxApiRequests: 50000 },
    features: ["basic_analytics", "advanced_analytics", "audit_logs"],
    sortOrder: 1,
  },
  {
    slug: "business",
    name: "Business",
    isFree: false,
    limits: { maxProjects: null, maxMembers: null, maxApiRequests: null },
    features: ["basic_analytics", "advanced_analytics", "audit_logs", "sso", "custom_integrations"],
    sortOrder: 2,
  },
];

export function getPlanBySlug(slug: string): PlanConfig | undefined {
  return PLANS.find((p) => p.slug === slug);
}

// ============================================================
//  ORIGINAL: One‑time license purchase (kept as is)
// ============================================================

export const licensePlan = {
  name: "B2B SaaS OS",
  price: 249,
  priceDisplay: "$249",
  model: "One-time payment",
  summary:
    "Full source code, yours forever. One license, unlimited projects for you and your clients.",
  features: [
    "Full source code",
    "Multi-tenancy",
    "PostgreSQL RLS",
    "Authentication",
    "Organizations",
    "RBAC",
    "Team invitations",
    "Stripe billing",
    "API keys",
    "Audit logs",
    "Usage limits",
    "Documentation",
    "Updates",
  ],
} as const;

export type LicensePlan = typeof licensePlan;
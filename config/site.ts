export const siteConfig = {
  name: "B2B SaaS OS",
  tagline: "Build your B2B SaaS. Not the infrastructure behind it.",
  description:
    "Production-ready Next.js + Supabase infrastructure for authentication, multi-tenancy, RBAC, billing, API keys, usage limits, and more.",
  price: 249,
  priceDisplay: "$249",
  paymentModel: "One-time payment",
  url: "https://andrady.co",
  checkoutUrl: "https://andradyy.gumroad.com/l/b2b-saas-os",
  author: "Andrady",
  keywords: [
    "B2B SaaS boilerplate",
    "Next.js SaaS starter",
    "Supabase multi-tenancy",
    "Row Level Security",
    "Stripe billing",
    "SaaS source code",
  ],
} as const;

export type SiteConfig = typeof siteConfig;

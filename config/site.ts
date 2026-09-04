export const siteConfig = {
  name: "B2B SaaS OS",
  tagline: "Build B2B SaaS. Not SaaS infrastructure.",
  description:
    "The production-ready Next.js + Supabase foundation for developers and agencies building secure, multi-tenant B2B SaaS applications.",
  price: 249,
  priceDisplay: "$249",
  paymentModel: "One-time payment",
  url: "https://andrady.co",
  // Replace with your real checkout URL (Gumroad, Lemon Squeezy, Stripe payment link…)
  // when checkout goes live. Every CTA in the app reads from this single value.
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
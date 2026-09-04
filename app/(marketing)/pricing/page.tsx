import type { Metadata } from "next";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { PricingCard } from "@/components/marketing/pricing-card";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Pricing" };

const details: Record<string, string> = {
  "Full source code": "Every file, unminified — strict TypeScript, commented where it matters.",
  "Multi-tenancy": "Organizations as the root of the data model, from migration zero.",
  "PostgreSQL RLS": "Deny-by-default policies per table, shipped as SQL migrations.",
  Authentication: "Email & password, OAuth, magic links, password reset flows.",
  Organizations: "Create, switch, rename and delete organizations with clean state.",
  RBAC: "Owner / Admin / Billing / Member with a single permission map.",
  "Team invitations": "Tokened invite links with expiry and role pre-selection.",
  "Stripe billing": "Checkout, customer portal, webhooks, seats and plan limits.",
  "API keys": "Scoped, hashed at rest, with rotation and revocation.",
  "Audit logs": "Append-only trail of every sensitive action per organization.",
  "Usage limits": "Metered request counters compared against plan limits.",
  Documentation: "Setup, environment, customization, deployment and testing.",
  Updates: "Included — pull the latest improvements into your copy.",
};

const notIncluded = [
  "Reselling or redistributing the boilerplate",
  "Publishing the source or the repository",
  "Sublicensing to non-licensees",
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">Pricing</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          One price. Everything included.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          {siteConfig.name} is sold as source code — {siteConfig.priceDisplay.toLowerCase()} once,
          no subscription, no per-seat fees on the boilerplate itself.
        </p>
      </div>

      <div className="mt-12">
        <PricingCard />
      </div>

      <section className="mt-20">
        <h2 className="text-2xl font-semibold tracking-tight">What&apos;s included, in detail</h2>
        <dl className="mt-6 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(details).map(([feature, detail]) => (
            <div key={feature} className="bg-card p-5">
              <dt className="flex items-center gap-2 text-sm font-medium">
                <Check className="size-3.5 shrink-0 text-brand" aria-hidden="true" />
                {feature}
              </dt>
              <dd className="mt-1.5 pl-5.5 text-sm leading-6 text-muted-foreground">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-16 grid gap-8 rounded-xl border bg-card p-8 md:grid-cols-2">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Check className="size-4 text-brand" aria-hidden="true" /> You can
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Modify the code and make it yours</li>
            <li>Build and run commercial SaaS products</li>
            <li>Use it for unlimited client projects</li>
            <li>Deploy applications built on it, anywhere</li>
          </ul>
        </div>
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <X className="size-4 text-destructive" aria-hidden="true" /> You can&apos;t
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {notIncluded.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link
            href="/license"
            className="mt-4 inline-block text-sm font-medium underline-offset-4 hover:underline"
          >
            Read the full license →
          </Link>
        </div>
      </section>
    </div>
  );
}
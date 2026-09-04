import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "License" };

const allowed = [
  "Modify the code freely — rebrand it, extend it, rebuild it",
  "Use it commercially, in products you sell",
  "Build and operate SaaS applications on top of it",
  "Use it for client projects, for as many clients as you like",
  "Deploy applications based on it, on any infrastructure",
];

const notAllowed = [
  "Resell B2B SaaS OS itself, modified or not",
  "Redistribute the source code in any form",
  "Publish the repository or make the source public",
  "Sublicense the source to non-licensees",
  "Share the source with people outside your license",
  "Sell a competing boilerplate based substantially on it",
];

export default function LicensePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-24">
      <p className="font-mono text-xs uppercase tracking-widest text-brand">License</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
        Plain-language license
      </h1>

      <blockquote className="mt-8 rounded-xl border-l-4 border-brand bg-card p-6 text-lg font-medium leading-8">
        You are purchasing a license to use B2B SaaS OS, not ownership of the underlying
        intellectual property.
      </blockquote>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <section aria-labelledby="license-allowed">
          <h2 id="license-allowed" className="flex items-center gap-2 font-semibold">
            <Check className="size-4 text-brand" aria-hidden="true" /> What you can do
          </h2>
          <ul className="mt-4 space-y-3">
            {allowed.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-muted-foreground">
                <Check className="mt-1 size-3.5 shrink-0 text-brand" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="license-not-allowed">
          <h2 id="license-not-allowed" className="flex items-center gap-2 font-semibold">
            <X className="size-4 text-destructive" aria-hidden="true" /> What you can&apos;t do
          </h2>
          <ul className="mt-4 space-y-3">
            {notAllowed.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-muted-foreground">
                <X className="mt-1 size-3.5 shrink-0 text-destructive" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-14 space-y-10 text-sm leading-7 text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground">License grant</h2>
          <p className="mt-2">
            Upon purchase you receive a perpetual, non-exclusive, non-transferable license to use,
            modify and build upon B2B SaaS OS for your own products and for client work, per the
            terms on this page.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Ownership &amp; restrictions</h2>
          <p className="mt-2">
            The boilerplate remains the intellectual property of {siteConfig.author}. Applications
            you build with it are yours. The restrictions listed above protect the small number of
            things that keep this viable as a product.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Term &amp; termination</h2>
          <p className="mt-2">
            The license is perpetual unless terminated.{" "}
            <strong className="font-medium text-foreground">
              Unauthorized redistribution or resale may result in termination of the license and
              legal action.
            </strong>
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Disclaimer</h2>
          <p className="mt-2">
            This page describes the license in plain language. It is product copy — the agreement
            presented at checkout is the binding version, and this page is not legal advice.
          </p>
        </section>
      </div>
    </div>
  );
}
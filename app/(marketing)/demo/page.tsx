import type { Metadata } from "next";
import Link from "next/link";
import { DemoApp } from "@/components/marketing/demo-app";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Live demo" };

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">Live demo</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Click through the whole product.</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          This is the actual dashboard shell you get — organization switching, team, billing, usage,
          API keys, activity, projects and settings. Everything below runs locally in your browser.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 sm:items-center">
          <Badge className="mt-0.5 sm:mt-0">Demo data</Badge>
          <p className="text-sm text-muted-foreground">
            No backend, no secrets, nothing leaves this page.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href={siteConfig.checkoutUrl}>
            Get the source code — {siteConfig.priceDisplay}
          </Link>
        </Button>
      </div>

      <div className="mt-8">
        <DemoApp />
      </div>
    </div>
  );
}
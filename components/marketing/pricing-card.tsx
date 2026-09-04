import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { licensePlan } from "@/config/plans";
import { siteConfig } from "@/config/site";

export function PricingCard() {
  return (
    <div className="relative mx-auto w-full max-w-md rounded-xl border bg-card shadow-sm">
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{licensePlan.name}</h2>
          <Badge variant="brand">{licensePlan.model}</Badge>
        </div>
        <p className="mt-4 flex items-baseline gap-1.5">
          <span className="text-4xl font-semibold tracking-tight">{licensePlan.priceDisplay}</span>
          <span className="text-sm text-muted-foreground">once</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{licensePlan.summary}</p>
        <Button size="lg" className="mt-6 w-full" asChild>
          <a className="gumroad-button" href={siteConfig.checkoutUrl}>Get B2B SaaS OS</a>
        </Button>
        <p className="mt-3 text-center font-mono text-xs text-muted-foreground">
          Instant download via Gumroad
        </p>
      </div>
      <ul className="grid gap-3 p-6 sm:grid-cols-2">
        {licensePlan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm">
            <Check className="size-3.5 shrink-0 text-brand" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
      <div className="border-t px-6 py-3 text-center">
        <Link
          href="/license"
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Read the full license terms
        </Link>
      </div>
    </div>
  );
}
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getBillingOverview, getAvailablePlans } from "@/lib/billing/queries";
import { getActiveOrganization } from "@/lib/billing/context";
import { PLANS } from "@/config/stripe";
import { BillingClient } from "./billing-client";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  const ctx = await getActiveOrganization();

  if (!ctx) {
    redirect("/dashboard");
  }

  const [overview, dbPlans] = await Promise.all([
    getBillingOverview(),
    getAvailablePlans(),
  ]);

  // Merge DB plans with config for display (config has price IDs + display prices).
  const displayPlans = PLANS.map((config) => {
    const dbPlan = dbPlans.find((p) => p.slug === config.slug);
    return {
      slug: config.slug,
      name: dbPlan?.name ?? config.name,
      description: dbPlan?.description ?? config.description,
      isFree: config.isFree,
      monthlyPrice: config.monthlyPrice,
      yearlyPrice: config.yearlyPrice,
      features: config.features,
      highlight: config.highlight,
      sortOrder: config.sortOrder,
      hasMonthlyPrice: Boolean(config.monthlyPriceId),
      hasYearlyPrice: Boolean(config.yearlyPriceId),
    };
  }).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <BillingClient
      overview={overview}
      plans={displayPlans}
      role={ctx.role}
      orgName={ctx.organization.name}
    />
  );
}
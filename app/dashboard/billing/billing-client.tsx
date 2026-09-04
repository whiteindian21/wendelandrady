"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  startCheckoutAction,
  openPortalAction,
  cancelSubscriptionAction,
  reactivateSubscriptionAction,
  changePlanAction,
} from "./actions";
import type { BillingOverview } from "@/lib/billing/queries";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import type { Database } from "@/lib/database.types";

type OrganizationRole = Database["public"]["Enums"]["organization_role"];

interface DisplayPlan {
  slug: string;
  name: string;
  description: string;
  isFree: boolean;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  features: string[];
  highlight?: boolean;
  sortOrder: number;
  hasMonthlyPrice: boolean;
  hasYearlyPrice: boolean;
}

interface BillingClientProps {
  overview: BillingOverview | null;
  plans: DisplayPlan[];
  role: OrganizationRole;
  orgName: string;
}

function formatPrice(cents: number | null): string {
  if (cents === null) return "—";
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(0)}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const STATUS_LABELS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  active: { label: "Active", variant: "default" },
  trialing: { label: "Trial", variant: "secondary" },
  past_due: { label: "Past Due", variant: "destructive" },
  canceled: { label: "Canceled", variant: "outline" },
  unpaid: { label: "Unpaid", variant: "destructive" },
  incomplete: { label: "Incomplete", variant: "outline" },
  incomplete_expired: { label: "Expired", variant: "outline" },
};

export function BillingClient({
  overview,
  plans,
  role,
  orgName,
}: BillingClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [interval, setInternalInterval] = useState<"month" | "year">(
    overview?.interval ?? "month"
  );
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canManage = role === "owner" || role === "admin";

  const currentSlug = overview?.planSlug ?? "free";
  const status = overview?.status;
  const statusInfo = status
    ? STATUS_LABELS[status] ?? { label: status, variant: "outline" as const }
    : null;

  function handleRedirect(url: string) {
    window.location.href = url;
  }

  function handleCheckout(planSlug: string) {
    setError(null);
    setSuccessMessage(null);
    startTransition(async () => {
      const result = await startCheckoutAction(planSlug, interval);
      if (result.ok && result.url) {
        handleRedirect(result.url);
      } else if (!result.ok) {
        setError(result.error);
      }
    });
  }

  function handleChangePlan(planSlug: string) {
    setError(null);
    setSuccessMessage(null);
    startTransition(async () => {
      const result = await changePlanAction(planSlug, interval);
      if (result.ok) {
        if (result.url) {
          handleRedirect(result.url);
        } else {
          setSuccessMessage(result.message ?? "Plan updated.");
          router.refresh();
        }
      } else if (!result.ok) {
        setError(result.error);
      }
    });
  }

  function handlePortal() {
    setError(null);
    setSuccessMessage(null);
    startTransition(async () => {
      const result = await openPortalAction();
      if (result.ok && result.url) {
        handleRedirect(result.url);
      } else if (!result.ok) {
        setError(result.error);
      }
    });
  }

  function handleCancel() {
    setError(null);
    setSuccessMessage(null);
    startTransition(async () => {
      const result = await cancelSubscriptionAction();
      if (result.ok) {
        setSuccessMessage(
          result.message ?? "Subscription scheduled for cancellation."
        );
        router.refresh();
      } else if (!result.ok) {
        setError(result.error);
      }
    });
  }

  function handleReactivate() {
    setError(null);
    setSuccessMessage(null);
    startTransition(async () => {
      const result = await reactivateSubscriptionAction();
      if (result.ok) {
        setSuccessMessage(result.message ?? "Subscription reactivated.");
        router.refresh();
      } else if (!result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Billing"
        description={`Plan, payment method and invoices for ${orgName}.`}
        actions={
          statusInfo ? (
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          ) : undefined
        }
      />

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="flex items-start gap-2 rounded-lg border border-green-500/25 bg-green-500/5 p-4 text-sm text-green-700 dark:text-green-400">
          <Check className="mt-0.5 size-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <Card>
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">
              {overview?.planName ?? "Free"}{" "}
              {!overview?.isFree && (
                <span className="text-sm font-normal text-muted-foreground">
                  ·{" "}
                  {formatPrice(
                    interval === "month"
                      ? plans.find((p) => p.slug === currentSlug)?.monthlyPrice ??
                          null
                      : plans.find((p) => p.slug === currentSlug)?.yearlyPrice ??
                          null
                  )}
                  /{interval}
                </span>
              )}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {overview?.currentPeriodEnd
                ? overview?.cancelAtPeriodEnd
                  ? `Cancels on ${formatDate(overview.currentPeriodEnd)}`
                  : `Renews on ${formatDate(overview.currentPeriodEnd)}`
                : "No active subscription"}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            {canManage && !overview?.isFree && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={handlePortal} disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <ExternalLink className="mr-2 size-4" />
                  )}
                  Manage billing
                </Button>
                {!overview?.cancelAtPeriodEnd && (
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isPending}
                  >
                    Cancel subscription
                  </Button>
                )}
                {overview?.cancelAtPeriodEnd && (
                  <Button
                    variant="outline"
                    onClick={handleReactivate}
                    disabled={isPending}
                  >
                    Reactivate
                  </Button>
                )}
              </div>
            )}
            {!canManage && (
              <p className="text-xs text-muted-foreground">
                Only owners and admins can manage billing.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Billing interval:
        </span>
        <div className="inline-flex rounded-md border border-input">
          <button
            className={`rounded-l-md px-3 py-1.5 text-sm font-medium transition-colors ${
              interval === "month"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setInternalInterval("month")}
          >
            Monthly
          </button>
          <button
            className={`rounded-r-md px-3 py-1.5 text-sm font-medium transition-colors ${
              interval === "year"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setInternalInterval("year")}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.slug === currentSlug;
          const isUpgrade =
            plan.sortOrder >
            (plans.find((p) => p.slug === currentSlug)?.sortOrder ?? 0);

          return (
            <Card
              key={plan.slug}
              className={plan.highlight ? "border-primary shadow-lg" : ""}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.highlight && <Badge variant="brand">Popular</Badge>}
                  {isCurrent && <Badge variant="secondary">Current</Badge>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">
                    {plan.isFree
                      ? "Free"
                      : formatPrice(
                          interval === "month"
                            ? plan.monthlyPrice
                            : plan.yearlyPrice
                        )}
                  </span>
                  {!plan.isFree && (
                    <span className="text-sm text-muted-foreground">
                      /{interval === "month" ? "month" : "year"}
                    </span>
                  )}
                </div>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              {canManage && (
                <CardFooter>
                  {isCurrent ? (
                    <Button variant="outline" disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : plan.isFree ? (
                    <Button variant="outline" disabled className="w-full">
                      {overview?.isFree ? "Current Plan" : "Cancel to Downgrade"}
                    </Button>
                  ) : !overview?.isFree ? (
                    <Button
                      className="w-full"
                      variant={isUpgrade ? "default" : "outline"}
                      onClick={() => handleChangePlan(plan.slug)}
                      disabled={
                        isPending ||
                        (interval === "month" && !plan.hasMonthlyPrice) ||
                        (interval === "year" && !plan.hasYearlyPrice)
                      }
                    >
                      {isPending ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : null}
                      {isUpgrade ? "Upgrade plan" : "Switch plan"}
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleCheckout(plan.slug)}
                      disabled={
                        isPending ||
                        (interval === "month" && !plan.hasMonthlyPrice) ||
                        (interval === "year" && !plan.hasYearlyPrice)
                      }
                    >
                      {isPending ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : null}
                      Subscribe
                    </Button>
                  )}
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
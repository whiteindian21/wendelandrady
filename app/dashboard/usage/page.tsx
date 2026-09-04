import { getActiveOrganization } from "@/lib/billing/context";
import { getBillingOverview } from "@/lib/billing/queries";
import { checkUsageLimit } from "@/lib/usage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function UsagePage() {
  const ctx = await getActiveOrganization();
  if (!ctx) return <div>No organization</div>;

  const overview = await getBillingOverview();
  const planName = overview?.planName ?? "Free";

  const metrics = ["maxProjects", "maxMembers", "maxApiRequests"] as const;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Usage & Limits</h1>
      <p className="text-muted-foreground">Current Plan: <span className="font-medium text-foreground">{planName}</span></p>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map(async (metric) => {
          const usage = await checkUsageLimit(ctx.organization.id, metric);
          const percent = usage.limit ? (usage.current / usage.limit) * 100 : 0;
          
          return (
            <Card key={metric}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{metric.replace('max', '')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usage.current} / {usage.limit ?? "∞"}
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${percent > 90 ? 'bg-red-500' : 'bg-primary'}`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
                {usage.isExceeded && (
                  <p className="mt-2 text-xs text-red-500 font-medium">Limit exceeded</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
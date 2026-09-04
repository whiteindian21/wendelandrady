import type { Metadata } from "next";
import { getActiveOrganization } from "@/lib/billing/context";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Activity" };

export default async function ActivityPage() {
  const ctx = await getActiveOrganization();
  if (!ctx) return <div>No organization</div>;

  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Activity Log</h1>
      <Card className="divide-y">
        {logs?.map((log) => (
          <div key={log.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{log.action}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {log.metadata ? JSON.stringify(log.metadata) : ""}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(log.created_at).toLocaleString()}
            </div>
          </div>
        ))}
        {logs?.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No activity yet</div>
        )}
      </Card>
    </div>
  );
}
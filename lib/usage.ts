import { createClient } from "@/lib/supabase/server";
import { getOrganizationPlan } from "@/lib/billing/queries";

export async function recordUsage(orgId: string, metric: string, amount: number = 1) {
  const supabase = await createClient();
  const { config } = await getOrganizationPlan(orgId);
  const limit = config.limits[metric as keyof typeof config.limits] ?? null;

  // Use the atomic RPC to prevent race conditions
  const { data: success, error } = await supabase.rpc("check_and_record_usage", {
    p_org_id: orgId,
    p_metric: metric,
    p_limit: limit,
    p_amount: amount,
  });

  if (error || !success) {
    console.error(`[usage] Failed to record usage for ${metric}:`, error?.message || "Limit exceeded");
  }
}

export async function getUsageSummary(orgId: string, metric: string): Promise<number> {
  const supabase = await createClient();

  if (metric === "maxMembers") {
    const { count } = await supabase
      .from("organization_members")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId);
    return count || 0;
  }

  if (metric === "maxProjects") {
    const { count } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId);
    return count || 0;
  }

  const period = new Date().toISOString().substring(0, 7);
  const { data, error } = await supabase
    .from("usage_records")
    .select("amount")
    .eq("organization_id", orgId)
    .eq("metric", metric)
    .eq("period", period);

  if (error || !data) return 0;
  return data.reduce((sum, record) => sum + record.amount, 0);
}

export async function checkUsageLimit(
  orgId: string,
  metric: string
): Promise<{ limit: number | null; current: number; isExceeded: boolean }> {
  const { config } = await getOrganizationPlan(orgId);
  const limit = config.limits[metric] ?? null;
  const current = await getUsageSummary(orgId, metric);

  return {
    limit,
    current,
    isExceeded: limit !== null && current >= limit,
  };
}

/**
 * Enforces usage limit. Throws if exceeded.
 */
export async function enforceUsageLimit(orgId: string, metric: string): Promise<void> {
  const status = await checkUsageLimit(orgId, metric);
  if (status.isExceeded) {
    throw new Error(`LIMIT_EXCEEDED: You have reached your ${metric} limit.`);
  }
}
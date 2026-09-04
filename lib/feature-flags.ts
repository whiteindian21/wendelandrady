import { createClient } from "@/lib/supabase/server";
import { getOrganizationPlan } from "@/lib/billing/queries";

/**
 * Checks if a feature is enabled for the active organization.
 * Priority:
 * 1. Organization-specific feature_flag in DB
 * 2. Plan configuration (config/plans.ts)
 * 3. Global feature_flag in DB
 */
export async function isFeatureEnabled(orgId: string, featureKey: string): Promise<boolean> {
  const supabase = await createClient();

  // 1. Check org-specific flag
  const { data: orgFlag } = await supabase
    .from("feature_flags")
    .select("enabled")
    .eq("organization_id", orgId)
    .eq("feature_key", featureKey)
    .maybeSingle();

  if (orgFlag) return orgFlag.enabled;

  // 2. Check plan config
  const { config } = await getOrganizationPlan(orgId);
  if (config.features.includes(featureKey)) return true;

  // 3. Check global flag
  const { data: globalFlag } = await supabase
    .from("feature_flags")
    .select("enabled")
    .is("organization_id", null)
    .eq("feature_key", featureKey)
    .maybeSingle();

  return globalFlag?.enabled || false;
}

export async function setFeatureFlag(
  orgId: string,
  featureKey: string,
  enabled: boolean
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("feature_flags")
    .upsert({
      organization_id: orgId,
      feature_key: featureKey,
      enabled,
    })
    .eq("organization_id", orgId)
    .eq("feature_key", featureKey);

  if (error) throw new Error(error.message);
}
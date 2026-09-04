import { randomBytes, createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { recordUsage } from "@/lib/usage";
import type { BillingContext } from "@/lib/billing/context";
import type { Database } from "@/lib/database.types";

export type SafeApiKey = Omit<Database["public"]["Tables"]["api_keys"]["Row"], "hashed_key">;

function generateApiKey(): { rawKey: string; prefix: string; hashedKey: string } {
  const randomSecret = randomBytes(32).toString("hex");
  const rawKey = `bs_live_${randomSecret}`;
  const prefix = rawKey.substring(0, 12);
  const hashedKey = createHash("sha256").update(rawKey).digest("hex");
  return { rawKey, prefix, hashedKey };
}

export async function createApiKey(
  ctx: BillingContext,
  name: string,
  expiresAt?: string
): Promise<{ rawKey: string }> {
  if (ctx.role !== "owner" && ctx.role !== "admin") {
    throw new Error("FORBIDDEN: Only owners and admins can create API keys.");
  }

  const { rawKey, prefix, hashedKey } = generateApiKey();
  const supabase = await createClient();

  const { error } = await supabase.from("api_keys").insert({
    organization_id: ctx.organization.id,
    name,
    prefix,
    hashed_key: hashedKey,
    created_by: ctx.user.id,
    expires_at: expiresAt || null,
    status: "active",
  });

  if (error) throw new Error(`Failed to create API key: ${error.message}`);

  return { rawKey };
}

export async function listApiKeys(orgId: string): Promise<SafeApiKey[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, organization_id, name, prefix, created_by, created_at, last_used_at, expires_at, revoked_at, status")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as SafeApiKey[];
}

export async function revokeApiKey(ctx: BillingContext, keyId: string): Promise<void> {
  if (ctx.role !== "owner" && ctx.role !== "admin") {
    throw new Error("FORBIDDEN: Only owners and admins can revoke API keys.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("api_keys")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", keyId)
    .eq("organization_id", ctx.organization.id);

  if (error) throw new Error(error.message);
}

/**
 * Validate an API key. Used in API route middleware.
 * Returns the organization_id if valid, null otherwise.
 * Automatically records API request usage.
 */
export async function validateApiKey(rawKey: string): Promise<string | null> {
  if (!rawKey.startsWith("bs_live_")) return null;

  const hashedKey = createHash("sha256").update(rawKey).digest("hex");
  const admin = getSupabaseAdmin();

  const { data: apiKey, error } = await admin
    .from("api_keys")
    .select("id, organization_id, status, expires_at")
    .eq("hashed_key", hashedKey)
    .maybeSingle();

  if (error || !apiKey) return null;

  if (apiKey.status !== "active") return null;
  if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
    await admin.from("api_keys").update({ status: "expired" }).eq("id", apiKey.id);
    return null;
  }

  await admin.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", apiKey.id);

  // Record API request usage automatically
  await recordUsage(apiKey.organization_id, "maxApiRequests", 1);

  return apiKey.organization_id;
}
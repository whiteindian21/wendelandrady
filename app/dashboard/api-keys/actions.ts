"use server";

import { revalidatePath } from "next/cache";
import { getActiveOrganization } from "@/lib/billing/context";
import { createApiKey, revokeApiKey } from "@/lib/api-keys";
import { logAuditEvent } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";

export async function createApiKeyAction(name: string, expiresAt?: string) {
  const ctx = await getActiveOrganization();
  if (!ctx) return { ok: false, error: "No active organization." };
  if (ctx.role !== "owner" && ctx.role !== "admin") {
    return { ok: false, error: "Forbidden." };
  }

  try {
    const { rawKey } = await createApiKey(ctx, name, expiresAt);
    
    const supabase = await createClient();
    await logAuditEvent(supabase, {
      organizationId: ctx.organization.id,
      userId: ctx.user.id,
      action: "api_key.created",
      targetType: "api_key",
      targetId: name,
    });
    
    revalidatePath("/dashboard/api-keys");
    return { ok: true, rawKey };
  } catch (e) {
    const message = e instanceof Error ? e.message : "An unknown error occurred.";
    return { ok: false, error: message };
  }
}

export async function revokeApiKeyAction(keyId: string) {
  const ctx = await getActiveOrganization();
  if (!ctx) return { ok: false, error: "No active organization." };
  if (ctx.role !== "owner" && ctx.role !== "admin") {
    return { ok: false, error: "Forbidden." };
  }

  try {
    await revokeApiKey(ctx, keyId);
    
    const supabase = await createClient();
    await logAuditEvent(supabase, {
      organizationId: ctx.organization.id,
      userId: ctx.user.id,
      action: "api_key.revoked",
      targetType: "api_key",
      targetId: keyId,
    });
    
    revalidatePath("/dashboard/api-keys");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "An unknown error occurred.";
    return { ok: false, error: message };
  }
}
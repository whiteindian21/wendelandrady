import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export interface AuditEvent {
  organizationId: string;
  userId?: string | null;
  actorId?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  resourceType?: string | null; // Added to match Stage 4 code
  resourceId?: string | null;   // Added to match Stage 4 code
  metadata?: Record<string, unknown>;
}

/**
 * Log an audit event.
 * 
 * @param supabase - The Supabase client to use (must have insert perms to audit_logs).
 * @param event - The audit event details.
 */
export async function logAuditEvent(
  supabase: SupabaseClient<Database>,
  event: AuditEvent
) {
  const { error } = await supabase.from("audit_logs").insert({
    organization_id: event.organizationId,
    actor_id: event.userId || event.actorId || null,
    action: event.action,
    // Map both targetType/resourceType to target_type
    target_type: event.targetType || event.resourceType || null,
    // Map both targetId/resourceId to target_id
    target_id: event.targetId || event.resourceId || null,
    metadata: (event.metadata || {}) as Database["public"]["Tables"]["audit_logs"]["Insert"]["metadata"],
  });

  if (error) console.error("[audit] Failed to log event:", error);
}

/**
 * Alias for logAuditEvent to maintain backward compatibility with Stage 4 code.
 */
export const recordAuditEvent = logAuditEvent;
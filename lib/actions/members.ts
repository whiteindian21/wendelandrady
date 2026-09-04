"use server";

import { revalidatePath } from "next/cache";
import {
  getOrgActionContext,
  type MemberRow,
} from "@/lib/organizations";
import { memberMutationSchema, roleChangeSchema } from "@/lib/organizations/schemas";
import { recordAuditEvent } from "@/lib/audit";
import type { ActionResult } from "@/lib/actions/types";
import type { Enums } from "@/lib/database.types";

export async function changeMemberRoleAction(
  memberId: string,
  role: "admin" | "member"
): Promise<ActionResult> {
  const ctx = await getOrgActionContext();
  if (!ctx.ok) {
    return { ok: false, error: ctx.error };
  }
  const { supabase, userId, organization, role: callerRole } = ctx;

  if (callerRole === "member") {
    return { ok: false, error: "Members cannot change roles." };
  }

  const parsed = roleChangeSchema.safeParse({ memberId, role });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Resolve the target membership from the database, scoped to the ACTIVE
  // organization — the client-provided memberId is a lookup key, never an
  // instruction. Target user/role always come from the row.
  const { data: target } = await supabase
    .from("organization_members")
    .select("id, user_id, role")
    .eq("id", parsed.data.memberId)
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (!target) {
    return { ok: false, error: "Member not found in this organization." };
  }

  if (target.user_id === userId) {
    return { ok: false, error: "You cannot change your own role." };
  }

  if (target.role === "owner") {
    return { ok: false, error: "The owner's role cannot be changed." };
  }

  // Granting 'owner' is impossible by schema (Zod enum + RLS WITH CHECK) —
  // there is deliberately no ownership transfer in this stage.

  const { error } = await supabase
    .from("organization_members")
    .update({ role: parsed.data.role })
    .eq("id", target.id)
    .eq("organization_id", organization.id);

  if (error) {
    return { ok: false, error: "Could not update the member's role." };
  }

  await recordAuditEvent(supabase, {
    organizationId: organization.id,
    userId,
    action: "member.role_changed",
    resourceType: "organization_member",
    resourceId: target.id,
    metadata: {
      target_user_id: target.user_id,
      from: target.role,
      to: parsed.data.role,
    },
  });

  revalidatePath("/dashboard/team");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function removeMemberAction(
  memberId: string
): Promise<ActionResult> {
  const ctx = await getOrgActionContext();
  if (!ctx.ok) {
    return { ok: false, error: ctx.error };
  }
  const { supabase, userId, organization, role: callerRole } = ctx;

  if (callerRole === "member") {
    return { ok: false, error: "Members cannot remove other members." };
  }

  const parsed = memberMutationSchema.safeParse({ memberId });
  if (!parsed.success) {
    return { ok: false, error: "Invalid member." };
  }

  const { data: target } = await supabase
    .from("organization_members")
    .select("id, user_id, role")
    .eq("id", parsed.data.memberId)
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (!target) {
    return { ok: false, error: "Member not found in this organization." };
  }

  if (target.role === "owner") {
    return { ok: false, error: "The owner cannot be removed." };
  }

  if (target.user_id === userId) {
    return { ok: false, error: "You cannot remove yourself." };
  }

  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("id", target.id)
    .eq("organization_id", organization.id);

  if (error) {
    return { ok: false, error: "Could not remove the member." };
  }

  await recordAuditEvent(supabase, {
    organizationId: organization.id,
    userId,
    action: "member.removed",
    resourceType: "organization_member",
    resourceId: target.id,
    metadata: { target_user_id: target.user_id, previous_role: target.role },
  });

  revalidatePath("/dashboard/team");
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Read helper re-exported for the client components' prop shaping. */
export type MemberRole = Enums<"organization_role">;
export type { MemberRow };
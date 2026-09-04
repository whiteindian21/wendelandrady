"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  ACTIVE_ORG_COOKIE,
  clearActiveOrganizationCookie,
  getOrgActionContext,
  setActiveOrganizationCookie,
} from "@/lib/organizations";
import {
  createOrganizationSchema,
  deleteOrganizationSchema,
  switchOrganizationSchema,
  updateOrganizationSchema,
} from "@/lib/organizations/schemas";
import { recordAuditEvent } from "@/lib/audit";
import type { ActionResult } from "@/lib/actions/types";

function isUniqueViolation(error: { code?: string | null }): boolean {
  return error?.code === "23505";
}

export async function createOrganizationAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: "You must be signed in to do that." };
  }

  const parsed = createOrganizationSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // We generate the ID ourselves. CRITICAL: do NOT chain .select() on this
  // insert — that turns it into INSERT ... RETURNING, which applies the
  // SELECT policy (is_organization_member) to the new row. The owner
  // membership is created by the AFTER INSERT trigger, which fires AFTER
  // RETURNING is evaluated, so a chained .select() fails with 42501 even
  // though the insert itself is valid. With return=minimal (the default
  // without .select()), only the INSERT policy applies — which passes.
  const organizationId = randomUUID();

  const { error } = await supabase.from("organizations").insert({
    id: organizationId,
    name: parsed.data.name,
    slug: parsed.data.slug,
  });

  if (error) {
    console.error("[create-organization] insert failed:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    if (isUniqueViolation(error)) {
      return { ok: false, error: "That URL slug is already taken. Try another." };
    }
    return { ok: false, error: "Could not create the organization. Please try again." };
  }

  // The trigger has now made the creator the owner, so this audit insert
  // passes RLS.
  await recordAuditEvent(supabase, {
    organizationId,
    userId: user.id,
    action: "organization.created",
    resourceType: "organization",
    resourceId: organizationId,
    metadata: { name: parsed.data.name, slug: parsed.data.slug },
  });

  await setActiveOrganizationCookie(organizationId);
  revalidatePath("/dashboard", "layout");

  return { ok: true, data: { id: organizationId } };
}

export async function switchOrganizationAction(
  organizationId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: "You must be signed in to do that." };
  }

  const parsed = switchOrganizationSchema.safeParse({ organizationId });
  if (!parsed.success) {
    return { ok: false, error: "Invalid organization." };
  }

  // The client only sends an ID — membership is verified server-side before
  // the cookie is written. A forged cookie gains nothing (every read
  // re-validates), but we still refuse to set one for a non-member.
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", parsed.data.organizationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return { ok: false, error: "You don't have access to that organization." };
  }

  await setActiveOrganizationCookie(parsed.data.organizationId);
  revalidatePath("/dashboard", "layout");

  return { ok: true };
}

export async function updateOrganizationAction(
  formData: FormData
): Promise<ActionResult> {
  const ctx = await getOrgActionContext();
  if (!ctx.ok) {
    return { ok: false, error: ctx.error };
  }
  const { supabase, userId, organization, role } = ctx;

  if (role === "member") {
    return { ok: false, error: "Members cannot modify organization settings." };
  }

  const parsed = updateOrganizationSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    logoUrl: formData.get("logoUrl"),
    timezone: formData.get("timezone"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // .update() without .select() uses return=minimal — no SELECT policy is
  // applied to the modified row, so this is safe under RLS.
  const { error } = await supabase
    .from("organizations")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      logo_url: parsed.data.logoUrl,
      timezone: parsed.data.timezone,
    })
    .eq("id", organization.id);

  if (error) {
    console.error("[update-organization] update failed:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    if (isUniqueViolation(error)) {
      return { ok: false, error: "That URL slug is already taken. Try another." };
    }
    return { ok: false, error: "Could not save organization settings." };
  }

  await recordAuditEvent(supabase, {
    organizationId: organization.id,
    userId,
    action: "organization.updated",
    resourceType: "organization",
    resourceId: organization.id,
  });

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function deleteOrganizationAction(
  formData: FormData
): Promise<ActionResult> {
  const ctx = await getOrgActionContext();
  if (!ctx.ok) {
    return { ok: false, error: ctx.error };
  }
  const { supabase, organization, role } = ctx;

  // Owner-only (also enforced by the RLS delete policy — defense in depth
  // so the UI can show a clean error instead of a silent no-op).
  if (role !== "owner") {
    return { ok: false, error: "Only the organization owner can delete it." };
  }

  const parsed = deleteOrganizationSchema.safeParse({
    confirmName: formData.get("confirmName"),
  });

  if (!parsed.success || parsed.data.confirmName !== organization.name) {
    return { ok: false, error: "The typed name doesn't match this organization." };
  }

  const { error } = await supabase
    .from("organizations")
    .delete()
    .eq("id", organization.id);

  if (error) {
    console.error("[delete-organization] delete failed:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return { ok: false, error: "Could not delete the organization. Please try again." };
  }

  // Note: the audit trail for this organization is intentionally removed by
  // the CASCADE foreign key — deleting a tenant erases its data (documented
  // FK decision in the README).

  await clearActiveOrganizationCookie();
  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_ORG_COOKIE);

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
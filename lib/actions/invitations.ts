"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getOrgActionContext, setActiveOrganizationCookie } from "@/lib/organizations";
import { inviteSchema } from "@/lib/organizations/schemas";
import { recordAuditEvent } from "@/lib/audit";
import { sendInvitationEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site-url";
import type { ActionResult } from "@/lib/actions/types";

const INVITATION_TTL_DAYS = 7;

/**
 * Creates an invitation: 32 random bytes, base64url-encoded as the raw
 * token (sent in the URL) and stored ONLY as a SHA-256 hash.
 * Duplicate strategy: any previous pending invitation for the same
 * organization + email is invalidated (deleted) before inserting the new
 * one, so there is never more than one live invitation per address.
 *
 * NOTE: the invitations insert deliberately does NOT chain .select() —
 * chaining it would turn the insert into INSERT ... RETURNING, which applies
 * the SELECT policy (admin-only) to the new row in the same statement.
 * Without .select(), only the INSERT policy applies, which passes.
 */
export async function inviteMemberAction(
  formData: FormData
): Promise<ActionResult<{ inviteUrl?: string }>> {
  const ctx = await getOrgActionContext();
  if (!ctx.ok) {
    return { ok: false, error: ctx.error };
  }
  const { supabase, userId, organization, role: callerRole } = ctx;

  if (callerRole === "member") {
    return { ok: false, error: "Members cannot invite other members." };
  }

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const email = parsed.data.email.toLowerCase();

  // Block inviting someone who is already a member (compare via profiles).
  type MemberEmailRow = { profiles: { email: string | null } | null };

  const { data: memberRows } = await supabase
    .from("organization_members")
    .select("profiles(email)")
    .eq("organization_id", organization.id);

  const members = (memberRows ?? []) as MemberEmailRow[];

  const alreadyMember = members.some(
    (row) =>
      row.profiles?.email != null &&
      row.profiles.email.toLowerCase() === email
  );

  if (alreadyMember) {
    return { ok: false, error: "This person is already a member of the organization." };
  }

  // Invalidate previous pending invitations for this address (RLS: admins
  // may delete invitations for their organization).
  await supabase
    .from("invitations")
    .delete()
    .eq("organization_id", organization.id)
    .eq("email", email)
    .is("accepted_at", null)
    .is("declined_at", null);

  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  const expiresAt = new Date(
    Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  const { error } = await supabase.from("invitations").insert({
    organization_id: organization.id,
    email,
    role: parsed.data.role,
    token_hash: tokenHash,
    invited_by: userId,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    console.error("[invite-member] insert failed:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return { ok: false, error: "Could not create the invitation. Please try again." };
  }

  await recordAuditEvent(supabase, {
    organizationId: organization.id,
    userId,
    action: "member.invited",
    resourceType: "invitation",
    metadata: { email, role: parsed.data.role },
  });

  const delivered = await sendInvitationEmail({
    to: email,
    organizationName: organization.name,
    inviterName: "An administrator",
    role: parsed.data.role,
    token: rawToken,
    expiresAt,
  });

  revalidatePath("/dashboard/team");

  // In development (no email provider configured) the admin gets the link
  // directly — they are the legitimate issuer of the invitation.
  return {
    ok: true,
    data: delivered ? {} : { inviteUrl: `${getSiteUrl()}/invite/${rawToken}` },
  };
}

export async function acceptInvitationAction(
  token: string
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to accept an invitation." };
  }

  // The raw token lives only in the URL path; the database stores the hash.
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const supabase = await createClient();
  const { data: organizationId, error } = await supabase.rpc("accept_invitation", {
    p_token_hash: tokenHash,
  });

  if (error || !organizationId) {
    const reason = error?.message ?? "";
    console.error("[accept-invitation] rpc failed:", {
      code: error?.code,
      message: reason,
      details: error?.details,
      hint: error?.hint,
    });
    if (reason.includes("invitation_expired")) {
      return { ok: false, error: "This invitation has expired." };
    }
    if (reason.includes("invitation_email_mismatch")) {
      return {
        ok: false,
        error: "This invitation was sent to a different email address.",
      };
    }
    if (reason.includes("invitation_already_used")) {
      return { ok: false, error: "This invitation has already been used." };
    }
    return { ok: false, error: "This invitation is invalid." };
  }

  await setActiveOrganizationCookie(organizationId);

  // The accepter is now a member, so this audit insert passes RLS.
  await recordAuditEvent(supabase, {
    organizationId,
    userId: user.id,
    action: "member.joined",
    metadata: { via: "invitation" },
  });

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function declineInvitationAction(
  token: string
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to decline an invitation." };
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");

  const supabase = await createClient();
  const { error } = await supabase.rpc("decline_invitation", {
    p_token_hash: tokenHash,
  });

  if (error) {
    console.error("[decline-invitation] rpc failed:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return { ok: false, error: "This invitation is invalid or was already used." };
  }

  // No audit entry here on purpose: the decliner usually has no membership
  // yet, so an org-scoped audit insert would be blocked by RLS. The
  // invitation row itself carries the declined_at state.

  return { ok: true };
}
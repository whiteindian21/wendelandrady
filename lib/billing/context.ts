import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];
type OrganizationRole = Database["public"]["Enums"]["organization_role"];

export class BillingError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "BillingError";
  }
}

export interface BillingContext {
  user: { id: string; email: string | null };
  organization: Organization;
  role: OrganizationRole;
}

export async function getActiveOrganization(): Promise<BillingContext | null> {
  const user = await requireUser();
  const cookieStore = await cookies();
  const activeOrgId = cookieStore.get("b2b_active_org")?.value;

  const supabase = await createClient();

  let orgId = activeOrgId;

  if (!orgId) {
    const { data: firstMembership } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!firstMembership) return null;
    orgId = firstMembership.organization_id;
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (!membership) return null;

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .maybeSingle();

  if (!organization) return null;

  return {
    user: { id: user.id, email: user.email ?? null },
    organization,
    role: membership.role as OrganizationRole,
  };
}

export async function requireBillingPermission(): Promise<BillingContext> {
  const ctx = await getActiveOrganization();

  if (!ctx) {
    throw new BillingError(
      "NO_ORGANIZATION",
      "No active organization found for your account."
    );
  }

  if (ctx.role !== "owner" && ctx.role !== "admin") {
    throw new BillingError(
      "FORBIDDEN",
      "You do not have permission to manage billing for this organization. Only owners and admins can manage billing."
    );
  }

  return ctx;
}

export async function verifyOrganizationMembership(
  organizationId: string
): Promise<BillingContext> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!membership) {
    throw new BillingError(
      "NOT_MEMBER",
      "You are not a member of this organization."
    );
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", organizationId)
    .maybeSingle();

  if (!organization) {
    throw new BillingError("NOT_FOUND", "Organization not found.");
  }

  return {
    user: { id: user.id, email: user.email ?? null },
    organization,
    role: membership.role as OrganizationRole,
  };
}
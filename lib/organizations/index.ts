import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient, type TypedSupabaseClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/database.types";

/**
 * Server-only organization context helpers.
 *
 * SECURITY MODEL: the active organization is stored in a cookie, but the
 * cookie is NEVER trusted on its own — every read validates the user's
 * membership against the database through the authenticated Supabase client
 * (RLS applies). A forged or stale cookie simply resolves to no membership
 * and falls back to the user's first organization.
 */

export const ACTIVE_ORG_COOKIE = "b2b_active_org";

export type OrgRole = Enums<"organization_role">;

export type UserOrganization = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  timezone: string | null;
  role: OrgRole;
};

export type ActiveOrganization = UserOrganization;

export type MemberRow = {
  id: string;
  user_id: string;
  role: OrgRole;
  created_at: string;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
  } | null;
};

export type PendingInvitation = {
  id: string;
  email: string;
  role: Enums<"invitation_role">;
  created_at: string;
  expires_at: string;
};

/**
 * All organizations the authenticated user belongs to (with THEIR role).
 *
 * CRITICAL: the query must filter by user_id. RLS exposes every membership
 * row of the user's organizations (the team page needs that), so without the
 * filter this would return co-members' rows too — and the first row could be
 * an OWNER's membership, making this user resolve with someone else's role.
 */
export async function getUserOrganizations(): Promise<UserOrganization[]> {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_members")
    .select("role, organizations(id, name, slug, logo_url, timezone)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.flatMap((row) =>
    row.organizations
      ? [
          {
            id: row.organizations.id,
            name: row.organizations.name,
            slug: row.organizations.slug,
            logo_url: row.organizations.logo_url,
            timezone: row.organizations.timezone,
            role: row.role,
          },
        ]
      : []
  );
}

/**
 * Resolves the active organization: the cookie value if the user is a
 * member, otherwise the user's first organization. Returns null when the
 * user belongs to no organization.
 */
export async function getActiveOrganization(): Promise<ActiveOrganization | null> {
  const organizations = await getUserOrganizations();
  if (organizations.length === 0) {
    return null;
  }

  const cookieStore = await cookies();
  const preferred = cookieStore.get(ACTIVE_ORG_COOKIE)?.value ?? null;

  return (
    organizations.find((org) => org.id === preferred) ?? organizations[0]
  );
}

/** Page-level guard: redirects to organization creation when none exists. */
export async function requireActiveOrganization(): Promise<ActiveOrganization> {
  const org = await getActiveOrganization();
  if (!org) {
    redirect("/dashboard/create-organization");
  }
  return org;
}

/** The caller's role in a specific organization, or null if not a member. */
export async function getMembershipRole(
  organizationId: string
): Promise<OrgRole | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .maybeSingle();

  return data?.role ?? null;
}

export type OrgActionContext = {
  supabase: TypedSupabaseClient;
  userId: string;
  userEmail: string;
  organization: ActiveOrganization;
  role: OrgRole;
};

/**
 * Flattened discriminated union: on success, the context properties are
 * top-level, so callers can destructure directly after the `ok` check.
 */
export type OrgActionResult =
  | ({ ok: true } & OrgActionContext)
  | { ok: false; error: string };

/**
 * Resolves the full authorization context for a Server Action: the
 * authenticated user, the active organization (cookie validated against
 * memberships), and the user's role. Every mutating organization action
 * starts here — nothing is trusted from the client.
 */
export async function getOrgActionContext(): Promise<OrgActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to do that." };
  }

  const organization = await getActiveOrganization();
  if (!organization) {
    return { ok: false, error: "No active organization." };
  }

  const supabase = await createClient();

  return {
    ok: true,
    supabase,
    userId: user.id,
    userEmail: user.email ?? "",
    organization,
    role: organization.role,
  };
}

export async function getOrganizationMembers(
  organizationId: string,
  options: { descending?: boolean; limit?: number } = {}
): Promise<MemberRow[]> {
  const supabase = await createClient();

  let query = supabase
    .from("organization_members")
    .select("id, user_id, role, created_at, profiles(full_name, avatar_url, email)")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: !options.descending });

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data } = await query;
  return (data ?? []) as unknown as MemberRow[];
}

export async function getPendingInvitations(
  organizationId: string
): Promise<PendingInvitation[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("invitations")
    .select("id, email, role, created_at, expires_at")
    .eq("organization_id", organizationId)
    .is("accepted_at", null)
    .is("declined_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  return (data ?? []) as PendingInvitation[];
}

/** Server Action helper: persist the active-organization cookie. */
export async function setActiveOrganizationCookie(organizationId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, organizationId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

/** Server Action helper: clear the active-organization cookie. */
export async function clearActiveOrganizationCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_ORG_COOKIE);
}
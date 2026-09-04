import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth";
import { requireActiveOrganization } from "@/lib/organizations";
import { OrganizationSettingsForm } from "@/components/settings/organization-settings-form";
import { DeleteOrganizationCard } from "@/components/settings/delete-organization-card";

export const metadata: Metadata = { title: "Organization" };

export default async function OrganizationSettingsPage() {
  const user = await requireUser();
  const organization = await requireActiveOrganization();

  const canEdit = organization.role === "owner" || organization.role === "admin";
  const isOwner = organization.role === "owner";

  return (
    <section className="space-y-6">
      <PageHeader
        title="Organization settings"
        description={`Configuration for ${organization.name}. Changes are restricted by role and enforced by RLS.`}
      />

      {canEdit ? (
        <OrganizationSettingsForm
          organization={{
            name: organization.name,
            slug: organization.slug,
            logo_url: organization.logo_url,
            timezone: organization.timezone,
          }}
        />
      ) : (
        <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
          Members can view organization settings but not modify them. Ask an
          admin or the owner to make changes.
        </p>
      )}

      {isOwner && (
        <DeleteOrganizationCard
          organizationId={organization.id}
          organizationName={organization.name}
          currentUserEmail={user.email ?? ""}
        />
      )}
    </section>
  );
}
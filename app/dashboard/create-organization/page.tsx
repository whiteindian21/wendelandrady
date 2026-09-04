import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { CreateOrganizationForm } from "@/components/organizations/create-organization-form";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Create organization" };

export default async function CreateOrganizationPage() {
  await requireUser();

  return (
    <section className="space-y-6">
      <PageHeader
        title="Create organization"
        description="You'll be the owner. Every resource inside is scoped to this organization and protected by RLS."
      />
      <CreateOrganizationForm />
    </section>
  );
}
import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";
import { Stat } from "@/components/shared/stat-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { requireActiveOrganization, getOrganizationMembers } from "@/lib/organizations";
import { createClient } from "@/lib/supabase/server";
import { formatDate, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview" };

const roleVariant = {
  owner: "brand",
  admin: "default",
  member: "outline",
} as const;

export default async function DashboardPage() {
  const user = await requireUser();
  const organization = await requireActiveOrganization();
  const supabase = await createClient();

  const [membersResult, projectsResult, recentMembers] = await Promise.all([
    supabase
      .from("organization_members")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id),
    getOrganizationMembers(organization.id, { descending: true, limit: 5 }),
  ]);

  const memberCount = membersResult.count ?? 0;
  const projectCount = projectsResult.count ?? 0;

  return (
    <section className="space-y-6">
      <PageHeader
        title={organization.name}
        description={`Signed in as ${user.email ?? "member"}. All data below is scoped to this organization.`}
        actions={
          <Badge variant={roleVariant[organization.role]} className="capitalize">
            {organization.role}
          </Badge>
        }
      />

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border lg:grid-cols-4">
        <Stat label="Team members" value={String(memberCount)} hint="This organization only" />
        <Stat label="Projects" value={String(projectCount)} hint="Scoped to this organization" />
        <Stat label="Your role" value={<span className="capitalize">{organization.role}</span>} hint="Server-verified membership" />
        <Stat
          label="Billing"
          value="—"
          hint="Connects in the billing stage"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent members</CardTitle>
              <CardDescription>Newest members of {organization.name}.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/team">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {recentMembers.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No members yet.</p>
            ) : (
              recentMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-4">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-[11px]">
                      {initials(member.profile?.full_name || "Member")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {member.profile?.full_name || member.profile?.email || "Member"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {member.profile?.email ?? "—"}
                    </p>
                  </div>
                  <Badge variant={roleVariant[member.role]} className="capitalize">
                    {member.role}
                  </Badge>
                  <span className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:block">
                    {formatDate(member.created_at)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Organization-scoped projects.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/projects">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {projectCount === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="No projects yet"
                description="Project management connects to this organization architecture in a later stage. The Projects page currently shows reference data."
                className="border-none bg-transparent px-0 py-6"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {projectCount} project{projectCount === 1 ? "" : "s"} in this organization.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
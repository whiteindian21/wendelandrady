import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress";
import { Stat } from "@/components/shared/stat-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { roleLabels } from "@/config/permissions";
import { activity, getProject, projects } from "@/lib/mock-data";
import { formatNumber, initials } from "@/lib/utils";

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = getProject(id);
  return { title: project ? project.name : "Project" };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const projectActivity = activity.filter((a) => a.type === "projects").slice(0, 4);

  return (
    <section className="space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/dashboard/projects" className="transition-colors hover:text-foreground">
          Projects
        </Link>
        <ChevronRight className="size-3.5" aria-hidden="true" />
        <span className="font-medium text-foreground">{project.name}</span>
      </nav>

      <PageHeader
        title={project.name}
        description={project.description}
        actions={
          <>
            <Badge variant="outline">{project.status}</Badge>
            <Button variant="outline" disabled>
              Deploy
            </Button>
          </>
        }
      />

      <div className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Requests · 30d" value={formatNumber(project.requests30d)} hint="metered API calls" />
        <Stat label="Members" value={String(project.members.length)} hint="with project access" />
        <Stat label="Created" value={project.createdAt} hint="first migration" />
        <Stat label="Environment" value={project.environment} hint="deployment target" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Members</CardTitle>
                <CardDescription>People working on this project.</CardDescription>
              </div>
              <Button variant="outline" size="sm" disabled>
                Add member
              </Button>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {project.members.map((member) => (
                <div key={member.name} className="flex items-center gap-3 p-4">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-[11px]">{initials(member.name)}</AvatarFallback>
                  </Avatar>
                  <p className="flex-1 text-sm font-medium">{member.name}</p>
                  <Badge variant={member.role === "owner" ? "brand" : "outline"}>
                    {roleLabels[member.role]}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project activity</CardTitle>
              <CardDescription>Recent project-related events.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {projectActivity.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-3 p-4">
                  <p className="text-sm leading-6">
                    <span className="font-medium">{a.actor}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>
                  </p>
                  <time className="shrink-0 font-mono text-xs text-muted-foreground">{a.time}</time>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Configuration for this project.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Project ID</span>
              <code className="font-mono text-xs">{project.id}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Environment</span>
              <span>{project.environment}</span>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rollout progress</span>
                <span className="font-mono text-xs">{project.progress}%</span>
              </div>
              <ProgressBar
                value={project.progress}
                className="mt-2"
                label={`${project.name} rollout progress`}
              />
            </div>
            <div className="border-t pt-4">
              <Button variant="outline" size="sm" className="w-full" disabled>
                Manage environments
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Environment management activates in the backend stage.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
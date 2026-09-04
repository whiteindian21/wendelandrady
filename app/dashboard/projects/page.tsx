import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress";
import { NewProjectDialog } from "@/components/dashboard/new-project-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { projects } from "@/lib/mock-data";
import { formatNumber, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Projects" };

const statusVariant = {
  Active: "outline",
  Beta: "secondary",
  Archived: "secondary",
} as const;

export default function ProjectsPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        title="Projects"
        description="Workspaces inside Acme Inc. — each with its own members, traffic and settings."
        actions={<NewProjectDialog />}
      />

      <div className="space-y-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/dashboard/projects/${project.id}`}
            className="block rounded-lg border bg-card p-4 transition-colors hover:bg-accent/40"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-medium">{project.name}</h2>
                  <Badge variant={statusVariant[project.status]}>{project.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex -space-x-1.5">
                    {project.members.slice(0, 4).map((m) => (
                      <Avatar key={m.name} className="size-6 ring-2 ring-background">
                        <AvatarFallback className="text-[9px]">{initials(m.name)}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatNumber(project.requests30d)} req / 30d
                  </span>
                  <span className="hidden font-mono text-xs text-muted-foreground md:inline">
                    {project.environment}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:w-44">
                <div className="flex-1">
                  <ProgressBar value={project.progress} label={`${project.name} progress`} />
                  <p className="mt-1.5 font-mono text-xs text-muted-foreground">
                    {project.progress}% complete
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
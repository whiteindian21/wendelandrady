"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { switchOrganizationAction } from "@/lib/actions/organizations";
import { organizations as demoOrganizations } from "@/lib/mock-data";
import { cn, initials } from "@/lib/utils";
import type { UserOrganization } from "@/lib/organizations";

function OrgTile({ name }: { name: string }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded bg-brand/12 font-mono text-[11px] font-semibold text-brand">
      {initials(name)}
    </span>
  );
}

/**
 * Organization switcher with two modes:
 *  - Real mode (organizations prop provided): lists the user's actual
 *    memberships, persists the active organization through a Server Action
 *    that verifies membership server-side, and refreshes the dashboard.
 *  - Demo mode (no props): the Stage 1 public-demo behavior on mock data.
 */
export function OrgSwitcher({
  organizations,
  activeOrganizationId,
  className,
}: {
  organizations?: UserOrganization[];
  activeOrganizationId?: string | null;
  className?: string;
}) {
  const router = useRouter();
  const [switching, startTransition] = React.useTransition();

  const isRealMode = organizations !== undefined;
  const [demoId, setDemoId] = React.useState(demoOrganizations[0].id);

  const list: UserOrganization[] = isRealMode
    ? organizations
    : demoOrganizations.map((o) => ({
        id: o.id,
        name: o.name,
        slug: o.id,
        logo_url: null,
        timezone: null,
        role: "owner",
      }));
  const activeId = isRealMode ? activeOrganizationId : demoId;
  const current = list.find((o) => o.id === activeId) ?? list[0] ?? null;

  function switchTo(id: string) {
    if (isRealMode) {
      if (id === activeId || switching) return;
      startTransition(async () => {
        const result = await switchOrganizationAction(id);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        router.refresh();
      });
    } else {
      setDemoId(id);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-label={
            current
              ? `Switch organization, current: ${current.name}`
              : "Select organization"
          }
          className={cn("h-9 justify-start gap-2 px-2 font-normal", className ?? "w-52")}
          disabled={isRealMode && list.length === 0}
        >
          {switching ? (
            <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
          ) : current ? (
            <OrgTile name={current.name} />
          ) : (
            <Plus className="size-4 shrink-0" aria-hidden="true" />
          )}
          <span className="truncate">
            {current ? current.name : isRealMode ? "Create organization" : "No organization"}
          </span>
          <ChevronsUpDown className="ml-auto size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        {list.map((org) => (
          <DropdownMenuItem key={org.id} className="gap-2" onSelect={() => switchTo(org.id)}>
            <OrgTile name={org.name} />
            <span className="flex-1 truncate">
              {org.name}
              {isRealMode && (
                <span className="ml-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {org.role}
                </span>
              )}
            </span>
            <Check
              className={cn("size-4", org.id === activeId ? "opacity-100" : "opacity-0")}
              aria-hidden="true"
            />
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {isRealMode ? (
          <DropdownMenuItem asChild>
            <Link href="/dashboard/create-organization">
              <Plus aria-hidden="true" /> Create organization
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onSelect={() =>
              toast.info("Organization creation is wired to Supabase in the backend stage.")
            }
          >
            <Plus aria-hidden="true" /> Create organization
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
"use client";

import * as React from "react";
import {
  BarChart3,
  CreditCard,
  FolderKanban,
  KeyRound,
  LayoutDashboard,
  ScrollText,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/shared/logo";
import { OrgSwitcher } from "@/components/dashboard/org-switcher";
import { CopyButton } from "@/components/dashboard/copy-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProgressBar } from "@/components/shared/progress";
import {
  activity,
  apiKeys,
  currentUser,
  invoices,
  maskKey,
  organizations,
  projects,
  teamMembers,
  usageByProject,
  usageMonths,
} from "@/lib/mock-data";
import { cn, formatNumber, initials } from "@/lib/utils";

type View =
  | "overview"
  | "projects"
  | "team"
  | "billing"
  | "usage"
  | "api-keys"
  | "activity"
  | "settings";

const NAV: { id: View; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "team", label: "Team", icon: Users },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "usage", label: "Usage", icon: BarChart3 },
  { id: "api-keys", label: "API Keys", icon: KeyRound },
  { id: "activity", label: "Activity", icon: ScrollText },
  { id: "settings", label: "Settings", icon: Settings },
];

const typeIcons: Record<string, LucideIcon> = {
  members: Users,
  projects: FolderKanban,
  billing: CreditCard,
  keys: KeyRound,
  org: Settings,
};

function ViewTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground">{sub}</p>
    </div>
  );
}

function DemoStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-card p-3.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Row({
  icon: Icon,
  children,
  right,
}: {
  icon?: LucideIcon;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-3">
      {Icon && (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0 flex-1 text-sm">{children}</div>
      {right && <span className="shrink-0 font-mono text-xs text-muted-foreground">{right}</span>}
    </div>
  );
}

export function DemoApp() {
  const [view, setView] = React.useState<View>("overview");
  const [orgId]  = React.useState(organizations[0].id);
  const org = organizations.find((o) => o.id === orgId) ?? organizations[0];

  const content = () => {
    switch (view) {
      case "overview":
        return (
          <div className="space-y-5">
            <ViewTitle
              title={org.name}
              sub={`${org.plan} plan · ${org.members} members · ${org.projects} projects`}
            />
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border lg:grid-cols-4">
              <DemoStat label="Team members" value={String(org.members)} hint="8 active · 4 invited" />
              <DemoStat label="Current plan" value={org.plan} hint="Renews Apr 1, 2025" />
              <DemoStat label="Usage" value={`${org.usage}%`} hint="of included requests" />
              <DemoStat label="Projects" value={String(org.projects)} hint="3 shown below" />
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium">Recent activity</h4>
              <div className="divide-y rounded-lg border">
                {activity.slice(0, 5).map((a) => {
                  const Icon = typeIcons[a.type] ?? ScrollText;
                  return (
                    <Row key={a.id} icon={Icon} right={a.time}>
                      <span className="font-medium">{a.actor}</span>{" "}
                      <span className="text-muted-foreground">{a.action}</span>
                    </Row>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case "team":
        return (
          <div className="space-y-5">
            <ViewTitle title="Team" sub={`${org.members} members in ${org.name}`} />
            <div className="divide-y rounded-lg border">
              {teamMembers.slice(0, 6).map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3">
                  <Avatar className="size-7">
                    <AvatarFallback className="text-[10px]">{initials(m.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <Badge variant={m.role === "owner" ? "brand" : "outline"} className="capitalize">
                    {m.role}
                  </Badge>
                  <Badge variant={m.status === "Active" ? "secondary" : "secondary"}>
                    {m.status}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Full RBAC, invitations, and role management are built-in.
            </p>
          </div>
        );

      case "billing":
        return (
          <div className="space-y-5">
            <ViewTitle title="Billing" sub={`Plan and invoices for ${org.name}`} />
            <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current plan</p>
                <p className="text-xl font-semibold">
                  {org.plan} <span className="text-sm font-normal text-muted-foreground">· $79/mo</span>
                </p>
                <p className="text-xs text-muted-foreground">Renews Apr 1, 2025 · 12 of 15 seats</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" disabled>
                  Upgrade plan
                </Button>
                <Button size="sm" variant="outline" disabled>
                  Manage billing
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Stripe Checkout and the Customer Portal are fully integrated.
            </p>
            <div>
              <h4 className="mb-2 text-sm font-medium">Invoices</h4>
              <div className="divide-y rounded-lg border font-mono text-xs">
                {invoices.slice(0, 3).map((inv) => (
                  <div key={inv.id} className="flex items-center gap-3 p-3">
                    <span>{inv.id}</span>
                    <span className="text-muted-foreground">{inv.date}</span>
                    <span className="ml-auto">{inv.amount}</span>
                    <Badge variant="outline">{inv.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "usage": {
        const max = Math.max(...usageMonths.map((m) => m.value));
        return (
          <div className="space-y-5">
            <ViewTitle title="Usage" sub="API requests across the last 12 months" />
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border bg-border">
              <DemoStat label="This month" value={formatNumber(170318)} hint="68% of included" />
              <DemoStat label="Included" value={formatNumber(250000)} hint="requests / month" />
              <DemoStat label="Resets" value="Apr 1" hint="usage window" />
            </div>
            <div
              className="flex h-28 items-end gap-1.5"
              role="img"
              aria-label="Monthly API requests, rising trend over 12 months"
            >
              {usageMonths.map((m, i) => {
                const last = i === usageMonths.length - 1;
                return (
                  <div key={m.month} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                    <div
                      className={cn("w-full rounded-sm", last ? "bg-brand" : "bg-muted-foreground/25")}
                      style={{ height: `${(m.value / max) * 100}%` }}
                    />
                    <span className="text-[9px] text-muted-foreground">{m.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="divide-y rounded-lg border text-sm">
              {usageByProject.map((p) => (
                <div key={p.name} className="flex items-center gap-3 p-3">
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  <ProgressBar value={p.pct} className="hidden w-28 sm:block" />
                  <span className="w-10 text-right font-mono text-xs text-muted-foreground">
                    {p.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "api-keys":
        return (
          <div className="space-y-5">
            <ViewTitle title="API keys" sub="Scoped keys, hashed at rest" />
            <div className="divide-y rounded-lg border font-mono text-xs">
              {apiKeys.map((k) => (
                <div key={k.id} className="flex items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-sm font-medium">{k.name}</p>
                    <p className="truncate text-muted-foreground">{maskKey(k.key)}</p>
                  </div>
                  <CopyButton value={k.key} label={`Copy ${k.name} key`} />
                  <Badge variant={k.scope === "read-write" ? "default" : "secondary"}>
                    {k.scope}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" disabled>
                Create API key
              </Button>
              <p className="text-xs text-muted-foreground">Generated and hashed securely server-side.</p>
            </div>
          </div>
        );

      case "activity":
        return (
          <div className="space-y-5">
            <ViewTitle title="Activity" sub="Audit trail for this organization" />
            <div className="divide-y rounded-lg border">
              {activity.slice(0, 8).map((a) => {
                const Icon = typeIcons[a.type] ?? ScrollText;
                return (
                  <Row key={a.id} icon={Icon} right={a.time}>
                    <span className="font-medium">{a.actor}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>
                  </Row>
                );
              })}
            </div>
          </div>
        );

      case "projects":
        return (
          <div className="space-y-5">
            <ViewTitle title="Projects" sub={`${org.projects} projects · 3 recent`} />
            <div className="space-y-3">
              {projects.map((p) => (
                <div key={p.id} className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{p.name}</p>
                    <Badge variant="outline">{p.status}</Badge>
                    <span className="ml-auto hidden font-mono text-xs text-muted-foreground sm:block">
                      {formatNumber(p.requests30d)} req / 30d
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <ProgressBar value={p.progress} className="max-w-40" label={`${p.name} progress`} />
                    <span className="font-mono text-xs text-muted-foreground">{p.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-5">
            <ViewTitle title="Settings" sub={`Organization configuration for ${org.name}`} />
            <div className="grid max-w-md gap-4">
              <div className="grid gap-2">
                <Label htmlFor="demo-org-name">Organization name</Label>
                <Input id="demo-org-name" defaultValue={org.name} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="demo-org-slug">Slug</Label>
                <Input id="demo-org-slug" defaultValue={org.id} className="font-mono" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="demo-org-domain">Domain</Label>
                <Input id="demo-org-domain" placeholder={`${org.id}.com`} />
              </div>
              <div className="flex items-center gap-3">
                <Button size="sm" disabled>
                  Save changes
                </Button>
                <p className="text-xs text-muted-foreground">Persisted securely via Supabase.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex h-12 items-center justify-between gap-3 border-b px-3 sm:px-4">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className="hidden text-sm font-semibold sm:inline">B2B SaaS OS</span>
          <Badge variant="brand">Demo data</Badge>
        </div>
        <div className="flex items-center gap-2">
          <OrgSwitcher className="w-36 sm:w-52" />
          <Avatar className="size-7">
            <AvatarFallback className="text-[10px]">{initials(currentUser.name)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="flex">
        <nav
          aria-label="Demo sections"
          className="hidden w-44 shrink-0 flex-col gap-0.5 border-r p-2 md:flex"
        >
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              aria-current={view === item.id ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                view === item.id && "bg-accent font-medium text-foreground"
              )}
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </button>
          ))}
          <div className="mt-auto p-2">
            <Logo className="text-xs" />
          </div>
        </nav>
        <div className="min-w-0 flex-1">
          <div className="flex gap-1.5 overflow-x-auto border-b p-2 md:hidden" role="tablist">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                aria-current={view === item.id ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  view === item.id && "bg-accent font-medium text-foreground"
                )}
              >
                <item.icon className="size-3.5" aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </div>
          <div className="p-4 sm:p-6">{content()}</div>
        </div>
      </div>
    </div>
  );
}
"use client";

import * as React from "react";
import {
  Building2,
  CreditCard,
  FolderKanban,
  KeyRound,
  Search,
  Users,
  type LucideIcon,
} from "lucide-react";
import { EmptyState } from "@/components/shared/states";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { activity, type ActivityItem, type ActivityType } from "@/lib/mock-data";

const TABS: { value: "all" | ActivityType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "members", label: "Members" },
  { value: "projects", label: "Projects" },
  { value: "billing", label: "Billing" },
  { value: "keys", label: "Keys" },
  { value: "org", label: "Org" },
];

const typeIcons: Record<ActivityType, LucideIcon> = {
  members: Users,
  projects: FolderKanban,
  billing: CreditCard,
  keys: KeyRound,
  org: Building2,
};

const DAYS: ActivityItem["day"][] = ["Today", "Yesterday", "Earlier"];

export function ActivityFeed() {
  const [tab, setTab] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");

  const filtered = activity.filter(
    (a) =>
      (tab === "all" || a.type === tab) &&
      `${a.actor} ${a.action}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-9 w-full justify-start overflow-x-auto sm:w-auto">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="px-3">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search
            className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search activity"
            className="pl-8"
            aria-label="Search activity"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching activity"
          description="Nothing matches your filters. Try a different tab or search term."
        />
      ) : (
        DAYS.map((day) => {
          const items = filtered.filter((a) => a.day === day);
          if (items.length === 0) return null;
          return (
            <section key={day}>
              <h2 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {day}
              </h2>
              <div className="divide-y rounded-lg border bg-card">
                {items.map((a) => {
                  const Icon = typeIcons[a.type];
                  return (
                    <div key={a.id} className="flex items-start gap-3 p-3.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <p className="flex-1 text-sm leading-6">
                        <span className="font-medium">{a.actor}</span>{" "}
                        <span className="text-muted-foreground">{a.action}</span>
                      </p>
                      <time className="hidden font-mono text-xs text-muted-foreground sm:block">
                        {a.time}
                      </time>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
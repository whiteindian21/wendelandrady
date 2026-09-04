"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Profile", href: "/dashboard/settings/profile", icon: User },
  { title: "Organization", href: "/dashboard/settings/organization", icon: Building2 },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto md:flex-col">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              active && "bg-accent font-medium text-foreground"
            )}
          >
            <item.icon className="size-4" aria-hidden="true" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardSidebar } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-5 px-3" aria-label="Dashboard navigation">
      {dashboardSidebar.map((section, i) => (
        <div key={i} className="flex flex-col gap-0.5">
          {section.label && (
            <p className="px-2.5 pb-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground/80">
              {section.label}
            </p>
          )}
          {section.items.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.title}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
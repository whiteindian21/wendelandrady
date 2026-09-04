import { Logo } from "@/components/shared/logo";
import { SidebarNav } from "./sidebar-nav";

export function DashboardSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-4">
        <Logo href="/dashboard" />
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav />
      </div>
      <div className="shrink-0 border-t border-sidebar-border p-3">
        <p className="font-mono text-[11px] text-muted-foreground">v0.1.0 — frontend stage</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Backend stages connect Supabase + Stripe.
        </p>
      </div>
    </aside>
  );
}
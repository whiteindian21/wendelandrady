"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { OrgSwitcher } from "./org-switcher";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import { Notifications } from "./notifications";
import type { UserOrganization } from "@/lib/organizations";

export function DashboardHeader({
  userName,
  userEmail,
  avatarUrl,
  organizations,
  activeOrganizationId,
}: {
  userName: string;
  userEmail: string;
  avatarUrl?: string | null;
  organizations: UserOrganization[];
  activeOrganizationId: string | null;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 md:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
            <Menu className="size-4" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 gap-0 p-0">
          <SheetHeader className="flex h-14 flex-col justify-center rounded-none border-b px-4 text-left">
            <SheetTitle asChild>
              <Logo />
            </SheetTitle>
          </SheetHeader>
          <div className="border-b p-3">
            <OrgSwitcher
              className="w-full"
              organizations={organizations}
              activeOrganizationId={activeOrganizationId}
            />
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="md:hidden">
        <Logo />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />
        <Notifications />
        <Separator orientation="vertical" className="mx-1 hidden h-5 sm:block" />
        <div className="hidden md:block">
          <OrgSwitcher
            organizations={organizations}
            activeOrganizationId={activeOrganizationId}
          />
        </div>
        <UserMenu name={userName} email={userEmail} avatarUrl={avatarUrl} />
      </div>
    </header>
  );
}
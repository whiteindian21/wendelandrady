import { requireUser, getCurrentProfile } from "@/lib/auth";
import { getUserOrganizations, getActiveOrganization } from "@/lib/organizations";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { MockBanner } from "@/components/shared/mock-banner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const profile = await getCurrentProfile();

  // Organization context: real memberships + the validated active org.
  // Note: no redirect here when the user has no organizations — individual
  // pages use requireActiveOrganization() (which routes to the create page),
  // so this layout never traps the creation flow in a redirect loop.
  const organizations = await getUserOrganizations();
  const activeOrganization = await getActiveOrganization();

  const displayName = profile?.full_name?.trim() || user.email || "Account";
  const displayEmail = user.email ?? "";
  const avatarUrl = profile?.avatar_url ?? null;

  return (
    <div className="relative min-h-svh">
      <a
        href="#dashboard-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-1.5 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <DashboardSidebar />
      <div className="flex min-h-svh flex-col md:pl-60">
        <DashboardHeader
          userName={displayName}
          userEmail={displayEmail}
          avatarUrl={avatarUrl}
          organizations={organizations}
          activeOrganizationId={activeOrganization?.id ?? null}
        />
        <MockBanner />
        <main id="dashboard-content" className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
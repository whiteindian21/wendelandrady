import { PageHeader } from "@/components/shared/page-header";
import { SettingsNav } from "@/components/settings/settings-nav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your personal profile and organization configuration."
      />
      <div className="grid gap-6 md:grid-cols-[200px_1fr] md:gap-8">
        <SettingsNav />
        <div className="min-w-0 max-w-2xl space-y-6">{children}</div>
      </div>
    </section>
  );
}
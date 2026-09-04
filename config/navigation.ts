import {
  BarChart3,
  Building2,
  CreditCard,
  FolderKanban,
  KeyRound,
  LayoutDashboard,
  ScrollText,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { title: string; href: string };

export const marketingNav: NavItem[] = [
  { title: "Features", href: "/#features" },
  { title: "Pricing", href: "/pricing" },
  { title: "Demo", href: "/demo" },
  { title: "Docs", href: "/docs" },
  { title: "License", href: "/license" },
];

export type SidebarItem = { title: string; href: string; icon: LucideIcon };
export type SidebarSection = { label?: string; items: SidebarItem[] };

export const dashboardSidebar: SidebarSection[] = [
  {
    items: [{ title: "Overview", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Workspace",
    items: [
      { title: "Projects", href: "/dashboard/projects", icon: FolderKanban },
      { title: "Team", href: "/dashboard/team", icon: Users },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Billing", href: "/dashboard/billing", icon: CreditCard },
      { title: "Usage", href: "/dashboard/usage", icon: BarChart3 },
    ],
  },
  {
    label: "Developer",
    items: [
      { title: "API Keys", href: "/dashboard/api-keys", icon: KeyRound },
      { title: "Activity", href: "/dashboard/activity", icon: ScrollText },
    ],
  },
  {
    label: "Settings",
    items: [
      { title: "Profile", href: "/dashboard/settings/profile", icon: User },
      { title: "Organization", href: "/dashboard/settings/organization", icon: Building2 },
    ],
  },
];

export const docsSections: NavItem[] = [
  { title: "Getting Started", href: "#getting-started" },
  { title: "Installation", href: "#installation" },
  { title: "Environment Variables", href: "#environment-variables" },
  { title: "Supabase", href: "#supabase" },
  { title: "Authentication", href: "#authentication" },
  { title: "Organizations", href: "#organizations" },
  { title: "Multi-tenancy", href: "#multi-tenancy" },
  { title: "RLS", href: "#rls" },
  { title: "RBAC", href: "#rbac" },
  { title: "Stripe", href: "#stripe" },
  { title: "Team Invitations", href: "#invitations" },
  { title: "API Keys", href: "#api-keys" },
  { title: "Audit Logs", href: "#audit-logs" },
  { title: "Usage Limits", href: "#usage-limits" },
  { title: "Customization", href: "#customization" },
  { title: "Deployment", href: "#deployment" },
  { title: "Testing", href: "#testing" },
  { title: "Troubleshooting", href: "#troubleshooting" },
];
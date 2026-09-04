import type { Role } from "@/config/permissions";

/* ── Current user ─────────────────────────────────────────────────────── */
export const currentUser = {
  name: "Sarah Chen",
  email: "sarah@acme.inc",
  role: "owner" as Role,
};

/* ── Organizations ────────────────────────────────────────────────────── */
export type Organization = {
  id: string;
  name: string;
  plan: "Free" | "Pro" | "Scale";
  members: number;
  usage: number;
  projects: number;
};

export const organizations: Organization[] = [
  { id: "acme", name: "Acme Inc.", plan: "Pro", members: 12, usage: 68, projects: 8 },
  { id: "beta", name: "Beta Corp.", plan: "Scale", members: 34, usage: 41, projects: 19 },
  { id: "gamma", name: "Gamma Labs", plan: "Free", members: 4, usage: 12, projects: 2 },
];

/* ── Team members ─────────────────────────────────────────────────────── */
export type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Invited";
  lastActive: string;
};

export const teamMembers: Member[] = [
  { id: "m1", name: "Sarah Chen", email: "sarah@acme.inc", role: "owner", status: "Active", lastActive: "2 min ago" },
  { id: "m2", name: "Mike Torres", email: "mike@acme.inc", role: "admin", status: "Active", lastActive: "1 h ago" },
  { id: "m3", name: "Priya Sharma", email: "priya@acme.inc", role: "admin", status: "Active", lastActive: "3 h ago" },
  { id: "m4", name: "Lena Fischer", email: "lena@acme.inc", role: "billing", status: "Active", lastActive: "5 h ago" },
  { id: "m5", name: "David Kim", email: "david@acme.inc", role: "member", status: "Active", lastActive: "1 d ago" },
  { id: "m6", name: "Tomás Costa", email: "tomas@acme.inc", role: "member", status: "Active", lastActive: "2 d ago" },
  { id: "m7", name: "John Rivera", email: "john@acme.inc", role: "member", status: "Invited", lastActive: "Invited 2 d ago" },
  { id: "m8", name: "Aisha Bello", email: "aisha@acme.inc", role: "member", status: "Invited", lastActive: "Invited 5 h ago" },
];

/* ── Activity ─────────────────────────────────────────────────────────── */
export type ActivityType = "members" | "projects" | "billing" | "keys" | "org";

export type ActivityItem = {
  id: string;
  actor: string;
  action: string;
  time: string;
  day: "Today" | "Yesterday" | "Earlier";
  type: ActivityType;
};

export const activity: ActivityItem[] = [
  { id: "a1", actor: "Sarah Chen", action: "invited John Rivera to Acme Inc.", time: "24 min ago", day: "Today", type: "members" },
  { id: "a2", actor: "John Rivera", action: 'created the project "CRM Migration".', time: "1 h ago", day: "Today", type: "projects" },
  { id: "a3", actor: "Acme Inc.", action: "Pro plan renewed · $79.00 for 12 seats.", time: "3 h ago", day: "Today", type: "billing" },
  { id: "a4", actor: "Mike Torres", action: "updated organization settings.", time: "5 h ago", day: "Today", type: "org" },
  { id: "a5", actor: "Priya Sharma", action: 'created API key "production".', time: "6 h ago", day: "Today", type: "keys" },
  { id: "a6", actor: "Lena Fischer", action: "updated the billing email.", time: "11:02", day: "Yesterday", type: "billing" },
  { id: "a7", actor: "Aisha Bello", action: "accepted her invitation.", time: "09:41", day: "Yesterday", type: "members" },
  { id: "a8", actor: "Mike Torres", action: 'archived the project "Legacy Portal".', time: "08:15", day: "Yesterday", type: "projects" },
  { id: "a9", actor: "Acme Inc.", action: "usage alert — 68% of included requests consumed.", time: "17:30", day: "Yesterday", type: "billing" },
  { id: "a10", actor: "David Kim", action: 'rotated API key "staging".', time: "14:08", day: "Earlier", type: "keys" },
  { id: "a11", actor: "Sarah Chen", action: "changed Tomás Costa's role to Member.", time: "Tue", day: "Earlier", type: "members" },
  { id: "a12", actor: "Sarah Chen", action: "enabled two-factor requirement for all members.", time: "Mon", day: "Earlier", type: "org" },
];

/* ── Projects ─────────────────────────────────────────────────────────── */
export type Project = {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Beta" | "Archived";
  progress: number;
  members: { name: string; role: Role }[];
  requests30d: number;
  createdAt: string;
  environment: string;
};

export const projects: Project[] = [
  {
    id: "website-redesign",
    name: "Website Redesign",
    description: "Marketing site refresh with CMS-backed pages and A/B-tested hero.",
    status: "Active",
    progress: 72,
    members: [
      { name: "Sarah Chen", role: "owner" },
      { name: "Mike Torres", role: "admin" },
      { name: "Priya Sharma", role: "admin" },
      { name: "David Kim", role: "member" },
    ],
    requests30d: 44762,
    createdAt: "Mar 4, 2025",
    environment: "Production",
  },
  {
    id: "mobile-application",
    name: "Mobile Application",
    description: "React Native client against the public API, staged rollout behind flags.",
    status: "Beta",
    progress: 38,
    members: [
      { name: "Sarah Chen", role: "owner" },
      { name: "Lena Fischer", role: "billing" },
      { name: "Tomás Costa", role: "member" },
    ],
    requests30d: 82140,
    createdAt: "Feb 12, 2025",
    environment: "Staging",
  },
  {
    id: "crm-migration",
    name: "CRM Migration",
    description: "Import pipeline and dedupe rules for moving 40k contacts off the legacy CRM.",
    status: "Active",
    progress: 91,
    members: [
      { name: "Mike Torres", role: "admin" },
      { name: "Priya Sharma", role: "admin" },
      { name: "Aisha Bello", role: "member" },
      { name: "John Rivera", role: "member" },
    ],
    requests30d: 35914,
    createdAt: "Jan 28, 2025",
    environment: "Production",
  },
];

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

/* ── API keys ─────────────────────────────────────────────────────────── */
export type ApiKey = {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  scope: "read-only" | "read-write";
};

export const apiKeys: ApiKey[] = [
  { id: "k1", name: "production", key: "pk_live_a41f7c93b2d84e0fa19e", created: "Mar 2, 2025", lastUsed: "12 minutes ago", scope: "read-write" },
  { id: "k2", name: "staging", key: "pk_test_77b2e9104cda4f5eb3c2", created: "Feb 18, 2025", lastUsed: "2 hours ago", scope: "read-write" },
  { id: "k3", name: "ci-runner", key: "pk_test_5d08aa6f1e9c42d7b8a0", created: "Jan 9, 2025", lastUsed: "Never", scope: "read-only" },
];

export function maskKey(key: string): string {
  return `${key.slice(0, 11)}••••${key.slice(-4)}`;
}

/* ── Billing ──────────────────────────────────────────────────────────── */
export type Invoice = {
  id: string;
  date: string;
  amount: string;
  plan: string;
  status: "Paid";
};

export const invoices: Invoice[] = [
  { id: "INV-0042", date: "Mar 1, 2025", amount: "$79.00", plan: "Pro · monthly", status: "Paid" },
  { id: "INV-0035", date: "Feb 1, 2025", amount: "$79.00", plan: "Pro · monthly", status: "Paid" },
  { id: "INV-0028", date: "Jan 1, 2025", amount: "$79.00", plan: "Pro · monthly", status: "Paid" },
  { id: "INV-0021", date: "Dec 1, 2024", amount: "$79.00", plan: "Pro · monthly", status: "Paid" },
];

export const paymentMethod = {
  brand: "Visa",
  last4: "4242",
  expiry: "04/27",
};

/* ── Usage ────────────────────────────────────────────────────────────── */
export const usageSummary = {
  included: 250000,
  used: 170318,
  percent: 68,
  resets: "Apr 1, 2025",
};

export const usageMonths = [
  { month: "Apr", value: 96 },
  { month: "May", value: 104 },
  { month: "Jun", value: 112 },
  { month: "Jul", value: 108 },
  { month: "Aug", value: 121 },
  { month: "Sep", value: 133 },
  { month: "Oct", value: 128 },
  { month: "Nov", value: 141 },
  { month: "Dec", value: 149 },
  { month: "Jan", value: 156 },
  { month: "Feb", value: 162 },
  { month: "Mar", value: 170 },
];

export const usageByProject = [
  { name: "Mobile Application", requests: 82140, pct: 48 },
  { name: "Website Redesign", requests: 44762, pct: 26 },
  { name: "CRM Migration", requests: 35914, pct: 21 },
  { name: "Other", requests: 7502, pct: 4 },
];

/* ── Notifications ────────────────────────────────────────────────────── */
export type AppNotification = {
  id: string;
  title: string;
  time: string;
  unread: boolean;
};

export const notifications: AppNotification[] = [
  { id: "n1", title: "Aisha Bello accepted your invitation", time: "1 h ago", unread: true },
  { id: "n2", title: "Usage alert — 68% of included requests", time: "2 h ago", unread: true },
  { id: "n3", title: "Invoice INV-0042 was paid", time: "1 d ago", unread: false },
];
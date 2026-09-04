import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  Gauge,
  KeyRound,
  Mail,
  Minus,
  ScrollText,
} from "lucide-react";
import { CodeBlock } from "@/components/shared/code-block";
import { PricingCard } from "@/components/marketing/pricing-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { teamMembers } from "@/lib/mock-data";
import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-16 border-b py-16 md:py-24", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

function SectionHead({
  kicker,
  title,
  description,
  center,
}: {
  kicker: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <p className="font-mono text-xs uppercase tracking-widest text-brand">{kicker}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      {description && (
        <p className="mt-4 text-base leading-7 text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

function ProductFrame() {
  return (
    <div className="relative mx-auto mt-14 max-w-4xl">
      <div className="overflow-hidden rounded-xl border bg-card shadow-xl shadow-black/5">
        <div className="flex h-9 items-center border-b bg-muted/40 px-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-border" />
          </span>
          <span className="mx-auto rounded border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            app.yoursaas.com/dashboard
          </span>
        </div>
        <div className="flex text-[11px]">
          <div className="hidden w-40 shrink-0 flex-col gap-0.5 border-r p-2 sm:flex" aria-hidden="true">
            {["Overview", "Projects", "Team", "Billing", "Usage", "API Keys", "Activity"].map(
              (label, i) => (
                <span
                  key={label}
                  className={cn(
                    "rounded px-2 py-1 text-muted-foreground",
                    i === 0 && "bg-accent font-medium text-foreground"
                  )}
                >
                  {label}
                </span>
              )
            )}
          </div>
          <div className="min-w-0 flex-1 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overview</span>
              <span className="rounded bg-brand/12 px-1.5 py-0.5 font-mono text-[10px] text-brand">
                Pro
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border sm:grid-cols-4">
              {[
                ["Team members", "12"],
                ["Plan", "Pro"],
                ["Usage", "68%"],
                ["Projects", "8"],
              ].map(([label, value]) => (
                <div key={label} className="bg-card p-2.5">
                  <p className="text-muted-foreground">{label}</p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-md border" aria-hidden="true">
              {teamMembers.slice(0, 4).map((m, i) => (
                <div
                  key={m.id}
                  className={cn("flex items-center gap-2 px-2.5 py-1.5", i > 0 && "border-t")}
                >
                  <Avatar className="size-5">
                    <AvatarFallback className="text-[9px]">{initials(m.name)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{m.name}</span>
                  <span className="ml-auto capitalize text-muted-foreground">{m.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        The dashboard you ship on day one —{" "}
        <Link href="/demo" className="font-medium text-foreground underline-offset-4 hover:underline">
          explore the live demo
        </Link>
        .
      </p>
    </div>
  );
}

const problems = [
  {
    n: "01",
    title: "Authentication plumbing",
    body: "Email, OAuth, sessions, password resets — two weeks of glue code before you write a single feature.",
  },
  {
    n: "02",
    title: "The organization model",
    body: "Multi-tenancy touches every table, every query and every policy. Retrofitting it later is the most expensive refactor in SaaS.",
  },
  {
    n: "03",
    title: "Row Level Security",
    body: "One missing policy is a data breach. Getting Postgres RLS right across tenants is slow, careful work.",
  },
  {
    n: "04",
    title: "Stripe integration",
    body: "Webhooks, seat tracking, plan limits, customer portal — billing state that must stay exactly in sync with your database.",
  },
  {
    n: "05",
    title: "Everything after billing",
    body: "Invitations, roles, audit logs, API keys, usage metering. All expected by customers. None of it differentiating.",
  },
];

const solutionChecklist = [
  "Clone it, rename it, ship it — no license server, no phone-home",
  "Multi-tenant from migration zero, not retrofitted",
  "Policies enforced in the database, not just the app",
  "Stripe that survives real webhooks and proration",
  "Readable, strictly-typed code you fully own",
  "No runtime fees, no vendor lock-in",
];

const authMethods = [
  { name: "Email & password", detail: "Sign-up, verification, password reset — forms included" },
  { name: "Google OAuth", detail: "One-tap consent, account linking" },
  { name: "GitHub OAuth", detail: "Developer-first sign-in" },
  { name: "Magic link", detail: "Passwordless sessions via email" },
];

const webhookEvents = [
  { event: "checkout.session.completed", detail: "activate the subscription" },
  { event: "customer.subscription.updated", detail: "sync plan, seats & status" },
  { event: "invoice.paid", detail: "record the payment" },
  { event: "customer.subscription.deleted", detail: "downgrade at period end" },
];

const infraRows = [
  {
    icon: KeyRound,
    title: "API keys",
    body: "Scoped keys with live/test prefixes, hashed at rest, rotation and revocation built in.",
    tag: "api_keys",
  },
  {
    icon: ScrollText,
    title: "Audit log",
    body: "Append-only trail of every sensitive action — actor, target, metadata.",
    tag: "audit_log",
  },
  {
    icon: Gauge,
    title: "Usage limits",
    body: "Metered request counters compared against plan limits, with overage hooks.",
    tag: "usage",
  },
  {
    icon: Mail,
    title: "Invitations",
    body: "Tokened invite links with expiry, role pre-selection and an acceptance flow.",
    tag: "invitations",
  },
];

const architectureRows = [
  { k: "app/", v: "Next.js 15 App Router — server components by default, typed throughout" },
  { k: "auth/", v: "Supabase Auth sessions, OAuth callbacks, route guards" },
  { k: "db/", v: "PostgreSQL schema plus Row Level Security policies as migrations" },
  { k: "billing/", v: "Stripe checkout, customer portal, webhook handlers" },
  { k: "lib/", v: "Typed clients, RBAC helpers, usage metering, audit writer" },
];

const capabilities = [
  { label: "View projects & data", owner: true, admin: true, billing: true, member: true },
  { label: "Create projects", owner: true, admin: true, billing: false, member: true },
  { label: "Invite & manage members", owner: true, admin: true, billing: false, member: false },
  { label: "Manage API keys", owner: true, admin: true, billing: false, member: false },
  { label: "Manage billing & plan", owner: true, admin: false, billing: true, member: false },
  { label: "Delete organization", owner: true, admin: false, billing: false, member: false },
];

const faqs = [
  {
    q: "What exactly do I get for $249?",
    a: "A ZIP with the complete, unminified source: the Next.js application, Supabase migrations and RLS policies, Stripe webhook handlers, and documentation. No obfuscation, no license server, no phone-home.",
  },
  {
    q: "Is this a subscription?",
    a: "No. One payment of $249, yours forever, updates included. You keep building and shipping with it indefinitely.",
  },
  {
    q: "Can I use it for client projects?",
    a: "Yes. You can build and deploy unlimited projects for your own company or your clients. What you can't do is resell the boilerplate itself or redistribute the source.",
  },
  {
    q: "Which services do I need?",
    a: "You connect your own Supabase and Stripe accounts. Both have generous free tiers to get started, and you own the billing relationship with your customers end to end.",
  },
  {
    q: "How customizable is it?",
    a: "Everything is plain TypeScript, Tailwind tokens and shadcn/ui components. Rebrand in config/site.ts and app/globals.css, extend the schema with normal SQL migrations, and wire your own product features on top.",
  },
  {
    q: "Do I own the code I build with it?",
    a: "Your application code is yours. The boilerplate itself is licensed, not sold — see the license page for the short list of restrictions (no reselling or redistributing B2B SaaS OS itself).",
  },
];

function CheckMark({ ok }: { ok: boolean }) {
  return ok ? (
    <Check className="size-4 text-brand" aria-label="Included" />
  ) : (
    <Minus className="size-4 text-muted-foreground/40" aria-label="Not included" />
  );
}

export default function HomePage() {
  return (
    <>
      {/* 1 · Hero */}
      <section className="relative border-b">
        <div
          className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 md:pb-24 md:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 font-mono text-xs text-muted-foreground shadow-sm">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
              One-time purchase · {siteConfig.priceDisplay} · Full source code
            </p>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Build B2B SaaS.{" "}
              <span className="text-muted-foreground">Not SaaS infrastructure.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              {siteConfig.description}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <a className="gumroad-button" href={siteConfig.checkoutUrl}>Get B2B SaaS OS — {siteConfig.priceDisplay}</a>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/demo">
                  View live demo <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 font-mono text-xs text-muted-foreground">
              Next.js 15 · React 19 · Supabase · Stripe · TypeScript
            </p>
          </div>
          <ProductFrame />
        </div>
      </section>

      {/* 2 · Problem */}
      <Section id="problem">
        <SectionHead
          kicker="01 · The problem"
          title="Every B2B SaaS starts with the same six months."
          description="Before your actual product exists, you build the same foundation every competitor built. It's undifferentiated, error-prone, and it eats your runway."
        />
        <div className="mt-12">
          {problems.map((p) => (
            <div
              key={p.n}
              className="grid gap-2 border-t py-6 last:border-b md:grid-cols-[72px_1fr_1.3fr] md:items-baseline md:gap-8"
            >
              <span className="font-mono text-sm text-brand">{p.n}</span>
              <h3 className="font-medium">{p.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 3 · Solution */}
      <Section id="features">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHead
              kicker="02 · The solution"
              title="One purchase. The whole foundation."
              description="B2B SaaS OS is a source-code boilerplate: the multi-tenant data model, auth, billing, and developer infrastructure — already wired together, already deployed once, already reviewed."
            />
            <ul className="mt-8 space-y-3">
              {solutionChecklist.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:pt-14">
            <CodeBlock filename="b2b-saas-os/" lang="what you download">
              {`├── app/                  # routes: marketing, auth, dashboard
├── components/           # ui, dashboard, marketing, shared
├── config/               # site · navigation · plans · permissions
├── lib/                  # supabase clients · rbac · usage · audit
├── supabase/
│   ├── migrations/       # orgs, members, invitations, audit, usage
│   └── policies/         # row level security, per table
├── stripe/
│   ├── webhooks/         # subscription + invoice handlers
│   └── portal/           # customer portal session route
└── docs/                 # setup → deployment`}
            </CodeBlock>
          </div>
        </div>
      </Section>

      {/* 4 · Multi-tenancy */}
      <Section id="multi-tenancy">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <SectionHead
            kicker="03 · Multi-tenancy"
            title="Tenancy designed in, not bolted on."
            description="Organizations are the root of the data model. Members, roles, projects, API keys and usage all hang off an organization_id — and every query is scoped by policy, not by hope. Your customers' data stays partitioned from the first migration."
          />
          <div className="rounded-xl border bg-card p-5 font-mono text-xs">
            <div className="rounded-lg border bg-background p-4">
              <p className="font-semibold text-foreground">organization — Acme Inc.</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">members</p>
                  <p className="mt-2 text-foreground">12 rows</p>
                  <p className="text-muted-foreground">SC · MT · PS · +9</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">roles</p>
                  <p className="mt-2 text-foreground">owner</p>
                  <p className="text-muted-foreground">admin · billing · member</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">projects</p>
                  <p className="mt-2 text-foreground">8 rows</p>
                  <p className="text-muted-foreground">each with own keys</p>
                </div>
              </div>
              <p className="mt-4 border-t pt-3 text-muted-foreground">
                every row carries <span className="text-foreground">organization_id</span> — RLS
                scopes it automatically
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* 5 · Authentication */}
      <Section id="authentication">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <SectionHead
            kicker="04 · Authentication"
            title="Sessions done once, done right."
            description="Supabase Auth handles the hard parts — hashing, rotation, MFA-ready sessions — while the boilerplate supplies the flow: prebuilt sign-in, sign-up, forgot and reset pages, OAuth callbacks, and a dedicated route that exchanges codes for sessions."
          />
          <div className="rounded-xl border bg-card">
            {authMethods.map((method, i) => (
              <div
                key={method.name}
                className={cn(
                  "flex items-start justify-between gap-4 p-4",
                  i > 0 && "border-t"
                )}
              >
                <div>
                  <p className="text-sm font-medium">{method.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{method.detail}</p>
                </div>
                <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 6 · RLS */}
      <Section id="rls">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <SectionHead
            kicker="05 · Row Level Security"
            title="Policies live in SQL, not in your React code."
            description="Authorization that lives only in application code is one refactor away from a leak. B2B SaaS OS ships deny-by-default Postgres policies per table, so even a buggy query can't cross tenant boundaries."
          />
          <CodeBlock filename="supabase/policies/projects.sql" lang="sql">
            <span className="tok-c">{"-- deny by default: only org members read org rows"}</span>
            {"\n"}
            <span className="tok-k">create policy</span> &quot;members_read_org_projects&quot;{"\n"}
            <span className="tok-k">on</span> projects <span className="tok-k">for select</span>
            {"\n"}
            <span className="tok-k">using</span> ({"\n"}
            {"  "}
            <span className="tok-k">exists</span> ({"\n"}
            {"    "}
            <span className="tok-k">select</span> 1 <span className="tok-k">from</span> organization_members m
            {"\n"}
            {"    "}
            <span className="tok-k">where</span> m.organization_id = projects.organization_id{"\n"}
            {"      "}
            <span className="tok-k">and</span> m.user_id = <span className="tok-s">auth.uid()</span>
            {"\n"}
            {"  )"}{"\n"});
          </CodeBlock>
        </div>
      </Section>

      {/* 7 · RBAC */}
      <Section id="rbac">
        <SectionHead
          kicker="06 · RBAC"
          title="Four roles. One permission map. Zero guesswork."
          description="Owner, Admin, Billing and Member — declared once in config/permissions.ts, enforced by RLS policies, and checked in-app through a single hasPermission() helper."
        />
        <div className="mt-10 overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <caption className="sr-only">Role-based access control matrix</caption>
            <thead>
              <tr className="border-b bg-muted/40">
                <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Capability
                </th>
                <th scope="col" className="bg-brand/5 px-4 py-3 text-center font-medium">
                  Owner
                </th>
                <th scope="col" className="px-4 py-3 text-center font-medium">
                  Admin
                </th>
                <th scope="col" className="px-4 py-3 text-center font-medium">
                  Billing
                </th>
                <th scope="col" className="px-4 py-3 text-center font-medium">
                  Member
                </th>
              </tr>
            </thead>
            <tbody>
              {capabilities.map((cap) => (
                <tr key={cap.label} className="border-b last:border-0">
                  <th scope="row" className="px-4 py-3 text-left font-normal">
                    {cap.label}
                  </th>
                  <td className="bg-brand/5 px-4 py-3 text-center">
                    <span className="inline-flex justify-center">
                      <CheckMark ok={cap.owner} />
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex justify-center">
                      <CheckMark ok={cap.admin} />
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex justify-center">
                      <CheckMark ok={cap.billing} />
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex justify-center">
                      <CheckMark ok={cap.member} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 8 · Stripe */}
      <Section id="stripe">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <SectionHead
            kicker="07 · Billing"
            title="Stripe that survives real webhooks."
            description="Checkout, customer portal, seat-based plans and invoice history — with handlers that reconcile Stripe's events into local state so your database always reflects what the customer actually pays."
          />
          <div className="rounded-xl border bg-card font-mono text-xs">
            <p className="border-b bg-muted/40 px-4 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              webhook events handled
            </p>
            {webhookEvents.map((e, i) => (
              <div key={e.event} className={cn("px-4 py-3", i > 0 && "border-t")}>
                <p className="text-foreground">{e.event}</p>
                <p className="mt-0.5 text-muted-foreground">→ {e.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 9 · Developer infrastructure */}
      <Section id="developer-infra">
        <SectionHead
          kicker="08 · Developer infrastructure"
          title="The features customers assume you already have."
          description="Every B2B buyer asks for these. Ship them on day one instead of quarter three."
        />
        <div className="mt-12">
          {infraRows.map((row) => (
            <div
              key={row.tag}
              className="grid gap-3 border-t py-6 last:border-b md:grid-cols-[48px_1fr_1.4fr_auto] md:items-center md:gap-8"
            >
              <span className="flex size-9 items-center justify-center rounded-md border bg-card text-muted-foreground">
                <row.icon className="size-4" aria-hidden="true" />
              </span>
              <h3 className="font-medium">{row.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{row.body}</p>
              <span className="hidden font-mono text-xs text-muted-foreground lg:block">
                {row.tag}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* 10 · Architecture */}
      <Section id="architecture">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <SectionHead
              kicker="09 · Architecture"
              title="Boring on purpose."
              description="No exotic runtimes, no custom DSLs. A stack a mid-level developer can read in an afternoon and a senior developer can extend without asking permission."
            />
            <div className="mt-10 overflow-hidden rounded-xl border">
              {architectureRows.map((row, i) => (
                <div
                  key={row.k}
                  className={cn(
                    "grid gap-1 p-4 sm:grid-cols-[110px_1fr] sm:gap-6",
                    i > 0 && "border-t"
                  )}
                >
                  <span className="font-mono text-sm text-brand">{row.k}</span>
                  <span className="text-sm leading-6 text-muted-foreground">{row.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center gap-6 rounded-xl border bg-card p-8">
            <CreditCard className="size-6 text-brand" aria-hidden="true" />
            <p className="text-lg font-medium leading-7">
              &ldquo;The best infrastructure is the kind you stop thinking about. This is the
              foundation, finished — so the next commit you write is product.&rdquo;
            </p>
            <p className="text-sm text-muted-foreground">
              Server Components by default. Client JavaScript only where interaction demands it.
              Strict TypeScript end to end.
            </p>
          </div>
        </div>
      </Section>

      {/* 11 · Example application */}
      <Section id="example-app">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <SectionHead
              kicker="10 · Example application"
              title="A working reference, not a skeleton."
              description="The boilerplate ships with a complete example app — the same dashboard in the live demo — so every feature has a real implementation to copy from: organizations, invites, billing, usage, keys and audit."
            />
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Button variant="outline" asChild>
              <Link href="/demo">
                Open the demo <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild>
              <a className="gumroad-button" href={siteConfig.checkoutUrl}>Get the source</a>
            </Button>
          </div>
        </div>
      </Section>

      {/* 12 · Pricing */}
      <Section id="pricing" className="bg-muted/30">
        <SectionHead
          center
          kicker="11 · Pricing"
          title="Pay once. Own it forever."
          description="No seats on the boilerplate, no revenue share, no runtime license checks."
        />
        <div className="mt-12">
          <PricingCard />
        </div>
      </Section>

      {/* 13 · FAQ */}
      <Section id="faq">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <SectionHead
            kicker="12 · FAQ"
            title="Questions, answered."
            description="Anything else, the documentation covers setup through deployment."
          />
          <div>
            {faqs.map((faq) => (
              <details key={faq.q} className="group border-t last:border-b">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <ChevronDown
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="pb-5 text-sm leading-6 text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      {/* 14 · Final CTA */}
      <section className="border-b py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="dot-grid relative overflow-hidden rounded-2xl border bg-card px-6 py-16 text-center md:py-20">
            <div
              className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_50%_60%_at_50%_100%,black,transparent)]"
              aria-hidden="true"
            />
            <h2 className="relative mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              Stop building infrastructure. Start building product.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-base text-muted-foreground">
              {siteConfig.description} One payment, full source, yours to ship.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <a className="gumroad-button" href={siteConfig.checkoutUrl}>
                  Get B2B SaaS OS — {siteConfig.priceDisplay}
                </a>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link href="/docs">Read the docs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
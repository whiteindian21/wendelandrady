import type { Metadata } from "next";
import { Info } from "lucide-react";
import { CodeBlock } from "@/components/shared/code-block";
import { docsSections } from "@/config/navigation";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Documentation" };

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 border-b pb-2 pt-10 text-xl font-semibold tracking-tight first:pt-0"
    >
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 leading-7 text-muted-foreground">{children}</p>;
}

function L({ children }: { children: React.ReactNode }) {
  return <li className="mt-2 leading-7 text-muted-foreground">{children}</li>;
}

function Td({ className, children }: { className?: string; children: React.ReactNode }) {
  return <td className={cn("border-t px-3 py-2 align-top", className)}>{children}</td>;
}

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <div className="grid gap-12 lg:grid-cols-[210px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            On this page
          </p>
          <nav aria-label="Documentation sections" className="mt-3 flex flex-row flex-wrap gap-x-4 gap-y-1.5 lg:flex-col lg:gap-y-0">
            {docsSections.map((s) => (
              <a
                key={s.href}
                href={s.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-widest text-brand">Docs</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Documentation</h1>
          <P>
            B2B SaaS OS is a source-code boilerplate for building multi-tenant B2B SaaS with
            Next.js, Supabase and Stripe. This page covers the concepts behind the codebase and how
            to set it up. The full reference documentation ships inside the source package.
          </P>
          <p className="mt-6 flex items-start gap-2 rounded-md border border-brand/25 bg-brand/5 p-3 text-sm leading-6">
            <Info className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
            Everything on this page describes the codebase as it ships. Nothing here requires a
            hosted service beyond your own Supabase and Stripe accounts.
          </p>

          <H2 id="getting-started">Getting Started</H2>
          <P>
            The package is a standard Next.js App Router project with strict TypeScript, Tailwind
            CSS v4 and a component library modeled on shadcn/ui. Marketing, auth and dashboard
            routes are separated into route groups, and the dashboard ships with a complete example
            application backed by clearly-labeled mock data.
          </P>

          <H2 id="installation">Installation</H2>
          <P>
            Requirements: Node.js 20+ and pnpm (or npm/yarn of your choice). No global tools, no
            CLI login.
          </P>
          <div className="mt-4">
            <CodeBlock filename="terminal" lang="bash">
              {`# 1. Unzip the package
unzip b2b-saas-os.zip && cd b2b-saas-os

# 2. Install dependencies
pnpm install

# 3. Configure environment (next section)
cp .env.example .env.local

# 4. Start the dev server
pnpm dev`}
            </CodeBlock>
          </div>

          <H2 id="environment-variables">Environment Variables</H2>
          <P>
            Copy <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env.example</code>{" "}
            to <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env.local</code> and
            fill in the values from your Supabase and Stripe dashboards.
          </P>
          <div className="mt-4 overflow-x-auto rounded-lg border text-sm">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="bg-muted/40 text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Variable</th>
                  <th className="px-3 py-2 font-medium">Used for</th>
                  <th className="px-3 py-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                <tr>
                  <Td>NEXT_PUBLIC_SITE_URL</Td>
                  <Td className="font-sans text-muted-foreground">Canonical URL, metadata, sitemap</Td>
                  <Td className="font-sans">Now</Td>
                </tr>
                <tr>
                  <Td>NEXT_PUBLIC_SUPABASE_URL</Td>
                  <Td className="font-sans text-muted-foreground">Supabase project URL</Td>
                  <Td className="font-sans">Backend stage</Td>
                </tr>
                <tr>
                  <Td>NEXT_PUBLIC_SUPABASE_ANON_KEY</Td>
                  <Td className="font-sans text-muted-foreground">Browser client</Td>
                  <Td className="font-sans">Backend stage</Td>
                </tr>
                <tr>
                  <Td>SUPABASE_SERVICE_ROLE_KEY</Td>
                  <Td className="font-sans text-muted-foreground">Server-only admin tasks</Td>
                  <Td className="font-sans">Backend stage</Td>
                </tr>
                <tr>
                  <Td>STRIPE_SECRET_KEY</Td>
                  <Td className="font-sans text-muted-foreground">Billing API</Td>
                  <Td className="font-sans">Billing stage</Td>
                </tr>
                <tr>
                  <Td>STRIPE_WEBHOOK_SECRET</Td>
                  <Td className="font-sans text-muted-foreground">Webhook signature verification</Td>
                  <Td className="font-sans">Billing stage</Td>
                </tr>
              </tbody>
            </table>
          </div>

          <H2 id="supabase">Supabase</H2>
          <P>
            You connect your own Supabase project. The package ships its schema as readable SQL
            migrations (organizations, members, invitations, projects, API keys, audit log, usage)
            plus one policy file per table, so you can run{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">supabase db push</code>{" "}
            and audit exactly what gets created.
          </P>

          <H2 id="authentication">Authentication</H2>
          <P>
            Supabase Auth handles credential storage and sessions. The package supplies the flow
            around it: sign-in, sign-up, forgot-password and reset-password pages, an auth callback
            route that exchanges codes for sessions, and OAuth wiring for Google and GitHub.
          </P>

          <H2 id="organizations">Organizations</H2>
          <P>
            An organization is the tenant root: members, roles, projects, keys, billing state and
            audit entries all belong to one. The membership table is the join point — a user can
            belong to many organizations, which is what makes the organization switcher work.
          </P>

          <H2 id="multi-tenancy">Multi-tenancy</H2>
          <P>
            Every tenant-owned row carries an{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">organization_id</code>.
            There is one database for all customers — isolation is achieved with Row Level Security,
            not with schema-per-tenant gymnastics. This keeps migrations simple and queries fast.
          </P>

          <H2 id="rls">RLS</H2>
          <P>
            Policies are deny-by-default: a table is unreadable unless a policy explicitly allows
            it, and the policies check membership through the authenticated user id. Example shape:
          </P>
          <div className="mt-4">
            <CodeBlock filename="supabase/policies/members.sql" lang="sql">
              {`create policy "members_are_visible_to_their_org"
on organization_members for select
using (
  organization_id in (
    select organization_id from organization_members
    where user_id = auth.uid()
  )
);`}
            </CodeBlock>
          </div>

          <H2 id="rbac">RBAC</H2>
          <P>
            Four roles — Owner, Admin, Billing, Member — declared once in{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">config/permissions.ts</code>
            {" "}as a permission map. The same map drives Postgres policies and an in-app{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">hasPermission()</code>{" "}
            helper, so UI and database can never disagree about who may do what.
          </P>

          <H2 id="stripe">Stripe</H2>
          <P>
            The billing layer covers checkout sessions, the customer portal, seat-aware
            subscriptions, and webhook handlers that reconcile Stripe events (subscription updates,
            invoices, cancellations) into your database. You provide the API keys and the webhook
            endpoint URL.
          </P>

          <H2 id="invitations">Team Invitations</H2>
          <P>
            Invitations are rows with a secure random token, an expiry, and a pre-selected role.
            Accepting happens at <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">/invite/[token]</code>,
            which validates the token and attaches the new member to the organization in one
            transaction.
          </P>

          <H2 id="api-keys">API Keys</H2>
          <P>
            Keys use <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">pk_live_</code> and{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">pk_test_</code> prefixes, are
            stored hashed (the full value is shown exactly once at creation), support read-only and
            read-write scopes, and can be rotated or revoked per organization.
          </P>

          <H2 id="audit-logs">Audit Logs</H2>
          <P>
            An append-only table records who did what to which resource, with metadata — invite
            acceptance, role changes, key creation, billing events. Entries are written server-side,
            never from the browser.
          </P>

          <H2 id="usage-limits">Usage Limits</H2>
          <P>
            A metered counter tracks API requests per organization per window. The billing layer
            compares the counter against the plan&apos;s included quota and exposes an overage hook,
            so you can enforce limits or trigger upsells.
          </P>

          <H2 id="customization">Customization</H2>
          <ul className="mt-2 list-disc pl-5">
            <L>
              Branding lives in <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">config/site.ts</code> —
              name, tagline, price, URLs.
            </L>
            <L>
              The color system is CSS variables in{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">app/globals.css</code>; restyle
              the whole app by editing one palette.
            </L>
            <L>
              Navigation is data, not markup:{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">config/navigation.ts</code>.
            </L>
            <L>
              Roles and permissions:{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">config/permissions.ts</code>.
            </L>
          </ul>

          <H2 id="deployment">Deployment</H2>
          <P>
            Deploy the Next.js app to any Node-compatible host (Vercel, Fly, your own box). Push
            migrations with the Supabase CLI, then register your deployed{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">/api/stripe/webhook</code>{" "}
            endpoint in the Stripe dashboard. Set all environment variables in the host&apos;s
            dashboard — nothing else is required.
          </P>

          <H2 id="testing">Testing</H2>
          <P>
            The repo is structured for testability: pure helpers live in{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">lib/</code>, route
            handlers are thin, and the permission map is pure data. Quality gates included:
          </P>
          <div className="mt-4">
            <CodeBlock filename="terminal" lang="bash">
              {`pnpm typecheck   # strict TypeScript, zero errors expected
pnpm lint        # eslint with next/core-web-vitals + next/typescript
pnpm build       # production build across all routes`}
            </CodeBlock>
          </div>

          <H2 id="troubleshooting">Troubleshooting</H2>
          <ul className="mt-2 list-disc pl-5">
            <L>
              <strong className="text-foreground">Build fails on missing env</strong> — you skipped{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env.local</code>. Copy{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env.example</code> first.
            </L>
            <L>
              <strong className="text-foreground">Rows return empty unexpectedly</strong> — an RLS
              policy is filtering them; check that the user has an{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">organization_members</code>{" "}
              row for that tenant.
            </L>
            <L>
              <strong className="text-foreground">Stripe webhook returns 400</strong> — the endpoint
              secret doesn&apos;t match; re-copy{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">STRIPE_WEBHOOK_SECRET</code>{" "}
              from the Stripe dashboard.
            </L>
          </ul>
        </div>
      </div>
    </div>
  );
}
import type { Metadata } from "next";
import Link from "next/link";
import { createHash } from "node:crypto";
import { Info, MailWarning, ShieldCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { ErrorState } from "@/components/shared/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { InvitationActions, SwitchAccountButton } from "@/components/organizations/invitation-actions";
import { getCurrentUser, isSupabaseConfigured } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Accept invitation" };

const roleVariant = {
  admin: "default",
  member: "outline",
} as const;

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invitePath = `/invite/${token}`;

  // The raw token never leaves the server except inside links we generate;
  // the database stores only this SHA-256 hash.
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const configured = isSupabaseConfigured();
  const user = configured ? await getCurrentUser() : null;

  // Unauthenticated: route to sign-in while preserving the invitation in the
  // `next` parameter (a root-relative path — open-redirect safe).
  if (!user) {
    return (
      <div className="flex min-h-svh flex-col">
        <header className="flex h-14 items-center px-4 sm:px-6">
          <Logo />
        </header>
        <main className="flex flex-1 items-center justify-center px-4 py-10">
          <AuthCard
            title="You've been invited"
            description="Sign in or create an account to view and accept this invitation."
          >
            <div className="space-y-4">
              <p className="flex items-start gap-2 rounded-md border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                This invite link is personal and single-use. Only the invited email
                address will be able to accept it.
              </p>
              <Button asChild className="w-full">
                <Link href={`/login?next=${encodeURIComponent(invitePath)}`}>Sign in</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href={`/signup?next=${encodeURIComponent(invitePath)}`}>
                  Create account
                </Link>
              </Button>
            </div>
          </AuthCard>
        </main>
      </div>
    );
  }

  // Authenticated: resolve the invitation state through the SECURITY DEFINER
  // preview RPC — invitation rows are invisible via RLS to non-members, so
  // the RPC is the only safe read path for a would-be accepter.
  const supabase = await createClient();
  const { data: previews } = await supabase.rpc("invitation_preview", {
    p_token_hash: tokenHash,
  });

  const preview = previews?.[0] ?? null;

  if (!preview) {
    return (
      <div className="flex min-h-svh flex-col">
        <header className="flex h-14 items-center px-4 sm:px-6">
          <Logo />
        </header>
        <main className="flex flex-1 items-center justify-center px-4 py-10">
          <ErrorState
            title="This invitation is invalid"
            description="The link doesn't match any invitation. Ask the organization owner to send a new one."
            action={
              <Button asChild variant="outline">
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            }
            className="max-w-md"
          />
        </main>
      </div>
    );
  }

  if (preview.status === "accepted" || preview.status === "declined") {
    return (
      <div className="flex min-h-svh flex-col">
        <header className="flex h-14 items-center px-4 sm:px-6">
          <Logo />
        </header>
        <main className="flex flex-1 items-center justify-center px-4 py-10">
          <ErrorState
            title={
              preview.status === "accepted"
                ? "This invitation has already been accepted"
                : "This invitation was declined"
            }
            description={
              preview.status === "accepted"
                ? "The invitation link has been used and can't be used again. If you believe this is a mistake, ask the organization owner to invite you again."
                : "This invitation can no longer be used. Ask the organization owner to send a new invitation."
            }
            action={
              <Button asChild variant="outline">
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            }
            className="max-w-md"
          />
        </main>
      </div>
    );
  }

  if (preview.status === "expired") {
    return (
      <div className="flex min-h-svh flex-col">
        <header className="flex h-14 items-center px-4 sm:px-6">
          <Logo />
        </header>
        <main className="flex flex-1 items-center justify-center px-4 py-10">
          <ErrorState
            title="This invitation has expired"
            description="Invitations are valid for 7 days. Ask the organization owner to send a new one."
            action={
              <Button asChild variant="outline">
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            }
            className="max-w-md"
          />
        </main>
      </div>
    );
  }

  // Pending: require the invited email to match the signed-in account.
  const emailMatches =
    (user.email ?? "").toLowerCase() === preview.email.toLowerCase();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-14 items-center px-4 sm:px-6">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <AuthCard
          title={`Join ${preview.organization_name}`}
          description={`You've been invited to collaborate as ${preview.role}.`}
        >
          {emailMatches ? (
            <div className="space-y-4">
              <dl className="space-y-2 rounded-md border bg-muted/40 p-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Organization</dt>
                  <dd className="font-medium">{preview.organization_name}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Invited email</dt>
                  <dd className="truncate font-medium">{preview.email}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Role</dt>
                  <dd>
                    <Badge variant={roleVariant[preview.role]} className="capitalize">
                      {preview.role}
                    </Badge>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Expires</dt>
                  <dd className="font-mono text-xs">{formatDate(preview.expires_at)}</dd>
                </div>
              </dl>
              <InvitationActions token={token} />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm leading-6">
                <MailWarning className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                This invitation was sent to{" "}
                <span className="font-medium">{preview.email}</span>, but you&apos;re
                signed in as <span className="font-medium">{user.email}</span>. For
                security, only the invited address can accept.
              </p>
              <SwitchAccountButton invitePath={invitePath} />
              <p className="flex items-start gap-2 rounded-md border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                Signed in with the wrong account? Sign out and sign back in with{" "}
                {preview.email}.
              </p>
            </div>
          )}
        </AuthCard>
      </main>
    </div>
  );
}
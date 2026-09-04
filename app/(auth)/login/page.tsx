import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Info } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser, isSupabaseConfigured } from "@/lib/auth";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Sign in" };

function SetupNotice() {
  return (
    <p className="flex items-start gap-2 rounded-md border border-brand/25 bg-brand/5 p-3 text-xs leading-5">
      <Info className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden="true" />
      Authentication isn&apos;t configured on this deployment yet. Set{" "}
      <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
      <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{" "}
      <code className="font-mono">.env.local</code> — see the README&apos;s
      Supabase Setup section.
    </p>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = getSafeRedirectPath(params.next);

  if (!isSupabaseConfigured()) {
    return (
      <AuthCard
        title="Sign in"
        description="Welcome back. Enter your details to continue."
        footer={{ prompt: "Don't have an account?", links: [{ label: "Create one", href: "/signup" }] }}
      >
        <SetupNotice />
      </AuthCard>
    );
  }

  // Defense in depth: middleware also redirects authenticated users away.
  const user = await getCurrentUser();
  if (user) {
    redirect(next);
  }

  const signupHref = next === "/dashboard" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`;

  return (
    <AuthCard
      title="Sign in"
      description="Welcome back. Enter your details to continue."
      footer={{ prompt: "Don't have an account?", links: [{ label: "Create one", href: signupHref }] }}
    >
      <LoginForm next={next} initialError={params.error} />
    </AuthCard>
  );
}
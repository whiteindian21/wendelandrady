import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { getCurrentUser, isSupabaseConfigured } from "@/lib/auth";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = getSafeRedirectPath(params.next);

  if (isSupabaseConfigured()) {
    const user = await getCurrentUser();
    if (user) {
      redirect(next);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      description="Set up your account and start building in minutes."
      footer={{ prompt: "Already have an account?", links: [{ label: "Sign in", href: "/login" }] }}
    >
      <SignupForm next={next} />
    </AuthCard>
  );
}
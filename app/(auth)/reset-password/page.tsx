import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Choose a new password"
      description="Enter a strong new password for your account."
      footer={{ prompt: "Done?", links: [{ label: "Back to sign in", href: "/login" }] }}
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
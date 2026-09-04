import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email and we'll send you a secure reset link."
      footer={{ prompt: "Remembered it?", links: [{ label: "Back to sign in", href: "/login" }] }}
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
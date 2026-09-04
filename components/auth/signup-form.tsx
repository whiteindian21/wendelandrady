"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage, NETWORK_ERROR } from "@/lib/auth/auth-errors";
import { signupSchema, zodFieldErrors } from "@/lib/auth/schemas";
import { getSiteUrl } from "@/lib/site-url";

export function SignupForm({ next }: { next: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [needsConfirmation, setNeedsConfirmation] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const formData = new FormData(event.currentTarget);
    const parsed = signupSchema.safeParse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      setFormError(null);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setSubmitting(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          // Consumed by the on_auth_user_created DB trigger to populate
          // profiles.full_name.
          data: { full_name: parsed.data.fullName },
          emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (error) {
        setFormError(getAuthErrorMessage(error));
        setSubmitting(false);
        return;
      }

      if (data.session) {
        // Email confirmation disabled in the Supabase project — signed in.
        router.replace(next);
        router.refresh();
        return;
      }

      // Email confirmation enabled — wait for the user to verify.
      setNeedsConfirmation(parsed.data.email);
      setSubmitting(false);
    } catch {
      setFormError(NETWORK_ERROR);
      setSubmitting(false);
    }
  }

  if (needsConfirmation) {
    return (
      <div className="grid gap-4 text-center" aria-live="polite">
        <span className="mx-auto flex size-10 items-center justify-center rounded-full border border-brand/30 bg-brand/10 text-brand">
          <MailCheck className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-medium">Check your inbox</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            We sent a confirmation link to{" "}
            <span className="font-medium text-foreground">{needsConfirmation}</span>.
            Click it to activate your account, then sign in.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">
            <CheckCircle2 aria-hidden="true" /> Back to sign in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      {formError && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </p>
      )}

      <div className="grid gap-2">
        <Label htmlFor="signup-name">Full name</Label>
        <Input
          id="signup-name"
          name="fullName"
          autoComplete="name"
          placeholder="Sarah Chen"
          required
          aria-invalid={Boolean(fieldErrors.fullName)}
          aria-describedby={fieldErrors.fullName ? "signup-name-error" : undefined}
        />
        {fieldErrors.fullName && (
          <p id="signup-name-error" className="text-xs text-destructive">
            {fieldErrors.fullName}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
        />
        {fieldErrors.email && (
          <p id="signup-email-error" className="text-xs text-destructive">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "signup-password-error" : "signup-password-hint"}
        />
        {fieldErrors.password ? (
          <p id="signup-password-error" className="text-xs text-destructive">
            {fieldErrors.password}
          </p>
        ) : (
          <p id="signup-password-hint" className="text-xs text-muted-foreground">
            Minimum 8 characters.
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="signup-confirm">Confirm password</Label>
        <Input
          id="signup-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={Boolean(fieldErrors.confirmPassword)}
          aria-describedby={fieldErrors.confirmPassword ? "signup-confirm-error" : undefined}
        />
        {fieldErrors.confirmPassword && (
          <p id="signup-confirm-error" className="text-xs text-destructive">
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="animate-spin" aria-hidden="true" />}
        {submitting ? "Creating account…" : "Create account"}
      </Button>

      <OAuthButtons next={next} />
    </form>
  );
}
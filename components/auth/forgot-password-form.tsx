"use client";

import * as React from "react";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { forgotPasswordSchema, zodFieldErrors } from "@/lib/auth/schemas";
import { getSiteUrl } from "@/lib/site-url";

export function ForgotPasswordForm() {
  const [submitting, setSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const formData = new FormData(event.currentTarget);
    const parsed = forgotPasswordSchema.safeParse({
      email: formData.get("email"),
    });

    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }

    setFieldErrors({});
    setNotice(null);
    setSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
      });

      // Deliberately do not distinguish "account exists" from "account
      // doesn't exist" — Supabase succeeds silently for unknown emails, and
      // any other failure still renders the same generic success text, except
      // rate limiting, which is safe (and useful) to surface.
      if (error && error.code === "over_email_send_rate_limit") {
        setNotice(getAuthErrorMessage(error));
      }

      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="grid gap-4 text-center" aria-live="polite">
        <span className="mx-auto flex size-10 items-center justify-center rounded-full border border-brand/30 bg-brand/10 text-brand">
          <MailCheck className="size-5" aria-hidden="true" />
        </span>
        {notice && (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {notice}
          </p>
        )}
        <p className="text-sm leading-6 text-muted-foreground">
          If an account exists for that email, a password reset link has been
          sent. Check your inbox — and your spam folder — for the message.
        </p>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-2">
        <Label htmlFor="forgot-email">Email</Label>
        <Input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "forgot-email-error" : undefined}
        />
        {fieldErrors.email && (
          <p id="forgot-email-error" className="text-xs text-destructive">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="animate-spin" aria-hidden="true" />}
        {submitting ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
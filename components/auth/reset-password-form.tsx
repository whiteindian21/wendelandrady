"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/states";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage, NETWORK_ERROR } from "@/lib/auth/auth-errors";
import { resetPasswordSchema, zodFieldErrors } from "@/lib/auth/schemas";

type Status = "checking" | "ready" | "invalid";

export function ResetPasswordForm() {
  const router = useRouter();
  const [status, setStatus] = React.useState<Status>("checking");
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        if (!cancelled) setStatus("invalid");
        return;
      }

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!cancelled) {
          // A valid recovery session was established by /auth/callback just
          // before landing here. Without it, updating is impossible.
          setStatus(user ? "ready" : "invalid");
        }
      } catch {
        if (!cancelled) setStatus("invalid");
      }
    }

    void checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const formData = new FormData(event.currentTarget);
    const parsed = resetPasswordSchema.safeParse({
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: parsed.data.password,
      });

      if (error) {
        if (error.code === "session_not_found") {
          setStatus("invalid");
          setSubmitting(false);
          return;
        }
        setFormError(getAuthErrorMessage(error));
        setSubmitting(false);
        return;
      }

      // Security hygiene: revoke every other session after a password change.
      try {
        await supabase.auth.signOut({ scope: "others" });
      } catch {
        // Non-fatal — the current session stays valid either way.
      }

      toast.success("Password updated. You are signed in.");
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setFormError(NETWORK_ERROR);
      setSubmitting(false);
    }
  }

  if (status === "checking") {
    return (
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <ErrorState
        title="This reset link is invalid or has expired"
        description="Password reset links are single-use and expire after a short time. Request a fresh link to continue."
        action={
          <Button asChild>
            <Link href="/forgot-password">Request a new link</Link>
          </Button>
        }
        className="border-none bg-transparent px-0 py-2"
      />
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
        <Label htmlFor="reset-password">New password</Label>
        <Input
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "reset-password-error" : "reset-password-hint"}
        />
        {fieldErrors.password ? (
          <p id="reset-password-error" className="text-xs text-destructive">
            {fieldErrors.password}
          </p>
        ) : (
          <p id="reset-password-hint" className="text-xs text-muted-foreground">
            Minimum 8 characters.
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="reset-confirm">Confirm password</Label>
        <Input
          id="reset-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={Boolean(fieldErrors.confirmPassword)}
          aria-describedby={fieldErrors.confirmPassword ? "reset-confirm-error" : undefined}
        />
        {fieldErrors.confirmPassword && (
          <p id="reset-confirm-error" className="text-xs text-destructive">
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="animate-spin" aria-hidden="true" />}
        {submitting ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
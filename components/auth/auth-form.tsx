"use client";

import * as React from "react";
import { Github, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Variant = "login" | "signup" | "forgot" | "reset" | "invite";

const submitLabels: Record<Variant, string> = {
  login: "Sign in",
  signup: "Create account",
  forgot: "Send reset link",
  reset: "Update password",
  invite: "Accept invitation",
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.97 10.97 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z" />
    </svg>
  );
}

export function AuthForm({ variant }: { variant: Variant }) {
  const [sent, setSent] = React.useState(false);

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      {(variant === "signup" || variant === "invite") && (
        <div className="grid gap-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" autoComplete="name" placeholder="Sarah Chen" required />
        </div>
      )}

      {variant === "signup" && (
        <div className="grid gap-2">
          <Label htmlFor="org">Organization name</Label>
          <Input id="org" name="org" autoComplete="organization" placeholder="Acme Inc." required />
        </div>
      )}

      {variant !== "reset" && variant !== "invite" && (
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="email">Email</Label>
            {variant === "login" && (
              <a
                href="/forgot-password"
                className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                Forgot password?
              </a>
            )}
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
          />
        </div>
      )}

      {variant !== "forgot" && (
        <div className="grid gap-2">
          <Label htmlFor="password">
            {variant === "reset" ? "New password" : "Password"}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={variant === "login" ? "current-password" : "new-password"}
            minLength={8}
            required
          />
          {variant !== "login" && (
            <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
          )}
        </div>
      )}

      {variant === "reset" && (
        <div className="grid gap-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
      )}

      <Button type="submit" className="w-full">
        {submitLabels[variant]}
      </Button>

      {(variant === "login" || variant === "signup") && (
        <>
          <div className="relative my-1">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              or continue with
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={() => setSent(true)}>
              <GoogleIcon /> Google
            </Button>
            <Button type="button" variant="outline" onClick={() => setSent(true)}>
              <Github className="size-4" /> GitHub
            </Button>
          </div>
        </>
      )}

      {sent && (
        <p className="flex items-start gap-2 rounded-md border border-brand/25 bg-brand/5 p-3 text-xs leading-5">
          <Info className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden="true" />
          UI foundation only — this form submits to Supabase Auth in the backend stage. No request
          was sent.
        </p>
      )}
    </form>
  );
}
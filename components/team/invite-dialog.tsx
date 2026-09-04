"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteMemberAction } from "@/lib/actions/invitations";

export function InviteDialog() {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    setInviteUrl(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const result = await inviteMemberAction(formData);

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    if (result.data?.inviteUrl) {
      setInviteUrl(result.data.inviteUrl);
      setSubmitting(false);
      formRef.current?.reset();
      return;
    }

    toast.success("Invitation sent.");
    setSubmitting(false);
    setOpen(false);
    formRef.current?.reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setError(null);
          setInviteUrl(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UserPlus aria-hidden="true" /> Invite member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to your organization</DialogTitle>
          <DialogDescription>
            They&apos;ll receive an email with a secure, single-use link that expires
            in 7 days. Only the invited email address can accept.
          </DialogDescription>
        </DialogHeader>

        {inviteUrl ? (
          <div className="space-y-4">
            <p className="flex items-start gap-2 rounded-md border border-brand/25 bg-brand/5 p-3 text-xs leading-5">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden="true" />
              Email delivery isn&apos;t configured on this deployment. Share the
              invitation link directly:
            </p>
            <p className="break-all rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs">
              {inviteUrl}
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteUrl(null)}>
                Invite another
              </Button>
              <Button asChild>
                <Link href="/dashboard/team">Done</Link>
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form ref={formRef} className="grid gap-4" onSubmit={handleSubmit} noValidate>
            {error && (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                name="email"
                type="email"
                placeholder="teammate@company.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select name="role" defaultValue="member">
                <SelectTrigger id="invite-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Owner cannot be granted through invitations.
              </p>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="animate-spin" aria-hidden="true" />}
                {submitting ? "Sending…" : "Send invite"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
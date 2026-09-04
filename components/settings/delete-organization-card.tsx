"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteOrganizationAction } from "@/lib/actions/organizations";

export function DeleteOrganizationCard({
  organizationName,
  currentUserEmail,
}: {
  organizationId?: string; // Kept as optional in type just in case, but not destructured
  organizationName: string;
  currentUserEmail: string;
}) {
  const router = useRouter();
  const [confirmName, setConfirmName] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const matched = confirmName === organizationName;

  async function handleDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!matched || deleting) return;

    setError(null);
    setDeleting(true);

    const formData = new FormData(event.currentTarget);
    const result = await deleteOrganizationAction(formData);

    if (!result.ok) {
      setError(result.error);
      setDeleting(false);
      return;
    }

    toast.success("Organization deleted.");
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <TriangleAlert className="size-4" aria-hidden="true" /> Danger zone
        </CardTitle>
        <CardDescription>
          Permanently delete {organizationName}, all memberships, projects, keys,
          invitations and audit history for it. This cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleDelete} noValidate>
          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <div className="grid gap-2">
            <Label htmlFor="delete-confirm">
              Type <span className="font-semibold text-foreground">{organizationName}</span> to confirm
            </Label>
            <Input
              id="delete-confirm"
              name="confirmName"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              autoComplete="off"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Signed in as {currentUserEmail}. Only the organization owner can delete it.
            </p>
          </div>
          <Button type="submit" variant="destructive" disabled={!matched || deleting}>
            {deleting && <Loader2 className="animate-spin" aria-hidden="true" />}
            {deleting ? "Deleting…" : "Delete organization"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
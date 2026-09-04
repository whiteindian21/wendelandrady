"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrganizationAction } from "@/lib/actions/organizations";
import { slugify } from "@/lib/utils";

export function CreateOrganizationForm() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (creating) return;

    setError(null);
    setCreating(true);

    const result = await createOrganizationAction(new FormData(event.currentTarget));

    if (!result.ok) {
      setError(result.error);
      setCreating(false);
      return;
    }

    toast.success("Organization created — you're the owner.");
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <Card className="max-w-md">
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <div className="grid gap-2">
            <Label htmlFor="create-org-name">Organization name</Label>
            <Input
              id="create-org-name"
              name="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Acme Inc."
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="create-org-slug">Slug</Label>
            <Input
              id="create-org-slug"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase());
              }}
              required
              maxLength={63}
              className="font-mono"
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
            />
            <p className="text-xs text-muted-foreground">
              Lowercase letters, numbers and hyphens. Must be unique — the database
              is the authority, and conflicts are reported clearly.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={creating || !name || !slug}>
            {creating && <Loader2 className="animate-spin" aria-hidden="true" />}
            {creating ? "Creating…" : "Create organization"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
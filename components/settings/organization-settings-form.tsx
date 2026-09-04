"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOrganizationAction } from "@/lib/actions/organizations";
import { slugify } from "@/lib/utils";

export function OrganizationSettingsForm({
  organization,
}: {
  organization: {
    name: string;
    slug: string;
    logo_url: string | null;
    timezone: string | null;
  };
}) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [slug, setSlug] = React.useState(organization.slug);
  const [slugTouched, setSlugTouched] = React.useState(false);

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!slugTouched) {
      setSlug(slugify(event.target.value));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setError(null);
    setSaving(true);

    const result = await updateOrganizationAction(new FormData(event.currentTarget));

    if (!result.ok) {
      setError(result.error);
      setSaving(false);
      return;
    }

    toast.success("Organization settings saved.");
    setSaving(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
        <CardDescription>
          Identity of the organization. Admins and the owner can edit; members cannot.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="org-name">Organization name</Label>
              <Input
                id="org-name"
                name="name"
                defaultValue={organization.name}
                onChange={handleNameChange}
                required
                maxLength={100}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="org-slug">Slug</Label>
              <Input
                id="org-slug"
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
                Must be unique. Changing it affects anyone using links with the old slug.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="org-logo">Logo URL</Label>
              <Input
                id="org-logo"
                name="logoUrl"
                type="url"
                defaultValue={organization.logo_url ?? ""}
                placeholder="https://…/logo.png"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="org-timezone">Timezone</Label>
              <Input
                id="org-timezone"
                name="timezone"
                defaultValue={organization.timezone ?? ""}
                placeholder="Europe/Berlin"
                maxLength={64}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 border-t pt-5">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
              {saving ? "Saving…" : "Save changes"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Validated with Zod, authorized server-side, enforced by RLS.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
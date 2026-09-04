import type { Metadata } from "next";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currentUser } from "@/lib/mock-data";
import { initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Profile" };

export default function ProfileSettingsPage() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How you appear to the rest of Acme Inc.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="text-sm">{initials(currentUser.name)}</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm" disabled>
                Change photo
              </Button>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Avatar uploads activate in the backend stage.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="profile-name">Full name</Label>
              <Input id="profile-name" defaultValue={currentUser.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" type="email" defaultValue={currentUser.email} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-timezone">Timezone</Label>
              <Select defaultValue="Europe/Berlin">
                <SelectTrigger id="profile-timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                  <SelectItem value="Europe/Lisbon">Europe/Lisbon</SelectItem>
                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                  <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Organization role</Label>
              <div className="flex h-9 items-center gap-2">
                <Badge variant="brand">Owner</Badge>
                <span className="text-xs text-muted-foreground">Managed by the organization owner.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t pt-5">
            <Button disabled>Save changes</Button>
            <p className="text-xs text-muted-foreground">
              Profile updates persist through Supabase in the backend stage.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Permanently delete your account and remove access to all organizations.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="destructive" disabled>
            Delete account
          </Button>
          <p className="text-xs text-muted-foreground">
            Available once the backend stage is connected.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
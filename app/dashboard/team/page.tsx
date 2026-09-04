import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireUser } from "@/lib/auth";
import {
  requireActiveOrganization,
  getOrganizationMembers,
  getPendingInvitations,
} from "@/lib/organizations";
import { InviteDialog } from "@/components/team/invite-dialog";
import { MemberActions } from "@/components/team/member-actions";
import { formatDate, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Team" };

const roleVariant = {
  owner: "brand",
  admin: "default",
  member: "outline",
} as const;

export default async function TeamPage() {
  const user = await requireUser();
  const organization = await requireActiveOrganization();

  const [members, pendingInvitations] = await Promise.all([
    getOrganizationMembers(organization.id),
    // RLS returns this list only for admins/owners; for members the query
    // is also gated in code to avoid a pointless request.
    organization.role === "owner" || organization.role === "admin"
      ? getPendingInvitations(organization.id)
      : Promise.resolve([]),
  ]);

  const canManage = organization.role === "owner" || organization.role === "admin";

  return (
    <section className="space-y-6">
      <PageHeader
        title="Team"
        description={`People with access to ${organization.name}.`}
        actions={canManage ? <InviteDialog /> : undefined}
      />

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            {members.length} member{members.length === 1 ? "" : "s"} · roles are enforced
            server-side and by RLS.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden sm:table-cell">Joined</TableHead>
                <TableHead className="w-12 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const name = member.profile?.full_name || member.profile?.email || "Member";
                const isSelf = member.user_id === user.id;
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-[11px]">{initials(name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {name}
                            {isSelf && (
                              <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>
                            )}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {member.profile?.email ?? "—"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleVariant[member.role]} className="capitalize">
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                      {formatDate(member.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {canManage && member.role !== "owner" ? (
                        <MemberActions
                          memberId={member.id}
                          currentRole={member.role}
                          isSelf={member.user_id === user.id}
                        />
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Pending invitations</CardTitle>
            <CardDescription>
              Sent invitations that haven&apos;t been accepted yet. Tokens are stored hashed;
              links expire after 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {pendingInvitations.length === 0 ? (
              <p className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <Mail className="size-4" aria-hidden="true" /> No pending invitations.
              </p>
            ) : (
              <ul className="divide-y">
                {pendingInvitations.map((invitation) => (
                  <li key={invitation.id} className="flex items-center gap-3 p-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Mail className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{invitation.email}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        Expires {formatDate(invitation.expires_at)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {invitation.role}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
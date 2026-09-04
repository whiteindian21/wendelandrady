"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { changeMemberRoleAction, removeMemberAction } from "@/lib/actions/members";

export function MemberActions({
  memberId,
  currentRole,
  isSelf,
}: {
  memberId: string;
  currentRole: "admin" | "member";
  isSelf: boolean;
}) {
  const router = useRouter();
  const [role, setRole] = React.useState<"admin" | "member">(currentRole);
  const [savingRole, startRoleTransition] = React.useTransition();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [removing, startRemoveTransition] = React.useTransition();

  function handleRoleChange(next: string) {
    const newRole = next as "admin" | "member";
    if (newRole === role) return;

    startRoleTransition(async () => {
      const result = await changeMemberRoleAction(memberId, newRole);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setRole(newRole);
      toast.success(`Role updated to ${newRole}.`);
      router.refresh();
    });
  }

  function handleRemove() {
    startRemoveTransition(async () => {
      const result = await removeMemberAction(memberId);
      setConfirmOpen(false);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Member removed. Their access ends immediately.");
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Member actions"
            disabled={savingRole || removing}
          >
            {(savingRole || removing) && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {!savingRole && !removing && <MoreHorizontal className="size-4" aria-hidden="true" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Change role</DropdownMenuLabel>
          <div className="px-2 pb-2">
            <Select
              value={role}
              onValueChange={handleRoleChange}
              disabled={savingRole || isSelf}
            >
              <SelectTrigger aria-label="Member role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {isSelf && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                You can&apos;t change your own role.
              </p>
            )}
          </div>
          {!isSelf && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => setConfirmOpen(true)}
              >
                <Trash2 aria-hidden="true" /> Remove member
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove this member?</DialogTitle>
            <DialogDescription>
              They immediately lose access to this organization through Row Level
              Security. Their profile and account are not deleted. This can only be
              undone by inviting them again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={removing}>
              {removing && <Loader2 className="animate-spin" aria-hidden="true" />}
              {removing ? "Removing…" : "Remove member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
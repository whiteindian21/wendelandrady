"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  acceptInvitationAction,
  declineInvitationAction,
} from "@/lib/actions/invitations";

export function InvitationActions({ token }: { token: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function handleAccept() {
    startTransition(async () => {
      const result = await acceptInvitationAction(token);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Invitation accepted — welcome aboard!");
      router.replace("/dashboard");
      router.refresh();
    });
  }

  function handleDecline() {
    startTransition(async () => {
      const result = await declineInvitationAction(token);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Invitation declined.");
      router.replace("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button onClick={handleDecline} variant="outline" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <X aria-hidden="true" />}
        Decline
      </Button>
      <Button onClick={handleAccept} disabled={pending}>
        {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Check aria-hidden="true" />}
        Accept invitation
      </Button>
    </div>
  );
}

export function SwitchAccountButton({ invitePath }: { invitePath: string }) {
  const router = useRouter();
  const [signingOut, startTransition] = React.useTransition();

  function handleSignOut() {
    startTransition(async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace(`/login?next=${encodeURIComponent(invitePath)}`);
      router.refresh();
    });
  }

  return (
    <Button onClick={handleSignOut} variant="outline" className="w-full" disabled={signingOut}>
      {signingOut && <Loader2 className="animate-spin" aria-hidden="true" />}
      Sign out & switch account
    </Button>
  );
}
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <CheckCircle2 className="mb-4 h-16 w-16 text-green-600 dark:text-green-400" />
      <h1 className="text-2xl font-bold">Payment Received</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your subscription is being activated. This page will update automatically
        once billing is fully synchronized. If it doesnt update within a minute,
        please refresh.
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Billing state is controlled by verified Stripe webhooks, not by reaching
        this page.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard/billing">Back to Billing</Link>
      </Button>
    </div>
  );
}
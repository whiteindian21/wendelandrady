import { Button } from "@/components/ui/button";
import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <XCircle className="mb-4 h-16 w-16 text-muted-foreground" />
      <h1 className="text-2xl font-bold">Checkout Canceled</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your checkout was canceled and no payment was processed. Your current
        plan remains unchanged.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard/billing">Back to Billing</Link>
      </Button>
    </div>
  );
}
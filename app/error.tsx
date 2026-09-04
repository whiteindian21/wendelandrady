"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/states";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <ErrorState
        title="Something went wrong"
        description={
          error.message || "An unexpected error occurred. Please try again."
        }
        action={
          <Button onClick={reset} variant="outline">
            Try again
          </Button>
        }
        className="max-w-md border-none bg-transparent"
      />
    </div>
  );
}
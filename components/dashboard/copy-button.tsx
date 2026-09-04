"use client";

import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyButton({ value, label }: { value: string; label?: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7"
      aria-label={label ?? "Copy to clipboard"}
      onClick={() => {
        if (navigator.clipboard) {
          navigator.clipboard
            .writeText(value)
            .then(() => toast.success("Copied to clipboard"))
            .catch(() => toast.error("Couldn't copy to clipboard."));
        } else {
          toast.error("Clipboard is unavailable in this browser.");
        }
      }}
    >
      <Copy className="size-3.5" aria-hidden="true" />
    </Button>
  );
}
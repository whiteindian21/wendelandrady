import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground",
        className
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
        <rect x="2" y="2.4" width="12" height="2.4" rx="1.2" fill="currentColor" />
        <rect x="2" y="6.8" width="12" height="2.4" rx="1.2" fill="currentColor" opacity="0.62" />
        <rect x="2" y="11.2" width="12" height="2.4" rx="1.2" fill="currentColor" opacity="0.3" />
      </svg>
    </span>
  );
}

export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}
      aria-label="B2B SaaS OS home"
    >
      <LogoMark />
      <span>
        B2B SaaS <span className="font-mono text-brand">OS</span>
      </span>
    </Link>
  );
}
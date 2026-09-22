"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { marketingNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      {/* MOBILE FIX: gap-3 below sm gives the logo room at 320px; the action
          group is shrink-0 so the toggle/menu can never be squeezed */}
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-5 md:flex" aria-label="Main navigation">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <ThemeToggle />

          {/* GUMROAD FIX: the responsive hiding now lives on this plain span.
              Gumroad's injected stylesheet is unlayered, so in Tailwind v4 it
              beats the layered `hidden` utility on a .gumroad-button anchor —
              forcing the CTA visible on mobile at ~261px min-width, which
              pushed the whole header (and page) past the viewport. Gumroad's
              CSS cannot touch this span, so `hidden sm:inline-flex` is
              bulletproof again. */}
          <span className="hidden sm:inline-flex">
            <Button size="sm" asChild>
              <a
                className="gumroad-button"
                href={siteConfig.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get it — {siteConfig.priceDisplay}
              </a>
            </Button>
          </span>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle asChild>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile navigation" className="mt-4 flex flex-col gap-1">
                {marketingNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {item.title}
                  </Link>
                ))}

                {/* Mobile Buy Button */}
                <Button size="sm" asChild className="mt-4">
                  <a
                    className="gumroad-button"
                    href={siteConfig.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                  >
                    Get it — {siteConfig.priceDisplay}
                  </a>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

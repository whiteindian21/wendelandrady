import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { siteConfig } from "@/config/site";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Live demo", href: "/demo" },
      { label: "Documentation", href: "/docs" },
      { label: "Features", href: "/#features" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "License", href: "/license" },
      { label: "Buy Now", href: siteConfig.checkoutUrl },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{siteConfig.tagline}</p>
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            {siteConfig.priceDisplay} · {siteConfig.paymentModel.toLowerCase()}
          </p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {col.title}
            </h2>
            <ul className="mt-3 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {siteConfig.author}. All rights reserved.
          </p>
          <p className="font-mono">{siteConfig.url.replace("https://", "")}</p>
        </div>
      </div>
    </footer>
  );
}
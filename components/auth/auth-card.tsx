import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthCard({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: string;
  footer?: { prompt: string; links: { label: string; href: string }[] };
  children: React.ReactNode;
}) {
  return (
    <Card className="w-full max-w-sm shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {children}
        {footer && (
          <p className="text-center text-sm text-muted-foreground">
            {footer.prompt}{" "}
            {footer.links.map((link, i) => (
              <React.Fragment key={link.href}>
                {i > 0 && " · "}
                <Link
                  href={link.href}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {link.label}
                </Link>
              </React.Fragment>
            ))}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
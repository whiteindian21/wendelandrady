import type { ReactNode } from "react";

export function CodeBlock({
  filename,
  lang,
  children,
}: {
  filename?: string;
  lang?: string;
  children: ReactNode;
}) {
  return (
    <figure className="overflow-hidden rounded-lg border bg-card">
      {(filename || lang) && (
        <figcaption className="flex items-center justify-between border-b bg-muted/40 px-3 py-1.5 font-mono text-xs text-muted-foreground">
          <span>{filename}</span>
          <span>{lang}</span>
        </figcaption>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
        <code>{children}</code>
      </pre>
    </figure>
  );
}
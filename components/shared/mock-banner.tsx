export function MockBanner() {
  return (
    <div className="border-b bg-muted/40 px-4 py-1.5 text-center text-xs text-muted-foreground">
      <span className="mr-1.5 rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide">
        preview
      </span>
      Organizations, team and settings are live. Billing, usage, API keys and
      projects remain demo data until their stages.
    </div>
  );
}
import type { Metadata } from "next";
import { getActiveOrganization } from "@/lib/billing/context";
import { listApiKeys } from "@/lib/api-keys";
import { ApiKeysClient } from "./api-keys-client";

export const metadata: Metadata = { title: "API Keys" };

export default async function ApiKeysPage() {
  const ctx = await getActiveOrganization();
  if (!ctx) return <div>No organization</div>;

  const keys = await listApiKeys(ctx.organization.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">API Keys</h1>
      <ApiKeysClient keys={keys} role={ctx.role} />
    </div>
  );
}
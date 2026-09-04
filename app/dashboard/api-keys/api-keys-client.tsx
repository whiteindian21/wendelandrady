"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createApiKeyAction, revokeApiKeyAction } from "./actions";
import type { SafeApiKey } from "@/lib/api-keys";

export function ApiKeysClient({ keys, role }: { keys: SafeApiKey[]; role: string }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [name, setName] = useState("");

  const canManage = role === "owner" || role === "admin";

  const handleCreate = async () => {
    setIsCreating(true);
    const res = await createApiKeyAction(name);
    if (res.ok && res.rawKey) {
      setNewKey(res.rawKey);
      setName("");
    }
    setIsCreating(false);
  };

  return (
    <div className="space-y-4">
      {newKey && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="font-bold text-yellow-800">Copy your new API key. It won&apos;t be shown again.</p>
          <code className="block mt-2 p-2 bg-yellow-100 rounded text-sm break-all">{newKey}</code>
          <Button className="mt-2" size="sm" onClick={() => setNewKey(null)}>Done</Button>
        </Card>
      )}

      {canManage && (
        <div className="flex gap-2">
          <input 
            className="border px-2 py-1 rounded" 
            placeholder="Key name (e.g. Production)" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button onClick={handleCreate} disabled={isCreating || !name}>
            {isCreating ? "Creating..." : "Create Key"}
          </Button>
        </div>
      )}

      <div className="border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Prefix</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Last Used</th>
              <th className="p-2 text-left">Created</th>
              {canManage && <th className="p-2"></th>}
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} className="border-t">
                <td className="p-2 font-medium">{k.name}</td>
                <td className="p-2 font-mono text-xs">{k.prefix}...</td>
                <td className="p-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${k.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {k.status}
                  </span>
                </td>
                <td className="p-2 text-muted-foreground">{k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "Never"}</td>
                <td className="p-2 text-muted-foreground">{new Date(k.created_at).toLocaleDateString()}</td>
                {canManage && (
                  <td className="p-2 text-right">
                    {k.status === 'active' && (
                      <Button variant="destructive" size="sm" onClick={async () => await revokeApiKeyAction(k.id)}>
                        Revoke
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
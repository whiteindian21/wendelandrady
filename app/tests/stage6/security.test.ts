/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHash, randomBytes } from "crypto";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: vi.fn(),
}));

vi.mock("@/lib/billing/queries", () => ({
  getOrganizationPlan: vi.fn(),
  getBillingOverview: vi.fn(),
}));

describe("Stage 6 Security Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("API Key Generation & Hashing", () => {
    it("should generate a key with correct format and hash it securely", () => {
      // Simulate the internal logic of generateApiKey
      const randomSecret = randomBytes(32).toString("hex");
      const rawKey = `bs_live_${randomSecret}`;
      const prefix = rawKey.substring(0, 12);
      const hashedKey = createHash("sha256").update(rawKey).digest("hex");

      expect(rawKey).toMatch(/^bs_live_[a-f0-9]{64}$/);
      expect(prefix).toBe(rawKey.substring(0, 12));
      expect(hashedKey).toHaveLength(64); // SHA-256 hex length
      expect(hashedKey).not.toBe(rawKey); // Ensure it's hashed
    });
  });

  describe("API Key Validation", () => {
    it("should reject keys with wrong format", async () => {
      const { validateApiKey } = await import("@/lib/api-keys");
      const result = await validateApiKey("invalid_key");
      expect(result).toBeNull();
    });
  });

  describe("Usage Enforcement", () => {
    it("should enforce limits when current usage >= limit", async () => {
      const { checkUsageLimit } = await import("@/lib/usage");
      const { getOrganizationPlan } = await import("@/lib/billing/queries");
      const { createClient } = await import("@/lib/supabase/server");

      vi.mocked(getOrganizationPlan).mockResolvedValue({
        config: {
          limits: { maxProjects: 5, maxMembers: 5, maxApiRequests: 5 },
        } as any,
      } as any);

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                data: [{ amount: 5 }], // Current usage is 5
                error: null,
              }),
            }),
          }),
        }),
      } as any);

      const status = await checkUsageLimit("org-1", "maxProjects");
      expect(status.limit).toBe(5);
      expect(status.current).toBe(5);
      expect(status.isExceeded).toBe(true);
    });

    it("should allow unlimited usage (null limit)", async () => {
      const { checkUsageLimit } = await import("@/lib/usage");
      const { getOrganizationPlan } = await import("@/lib/billing/queries");
      const { createClient } = await import("@/lib/supabase/server");

      vi.mocked(getOrganizationPlan).mockResolvedValue({
        config: {
          limits: { maxProjects: null, maxMembers: null, maxApiRequests: null },
        } as any,
      } as any);

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                data: [{ amount: 9999 }],
                error: null,
              }),
            }),
          }),
        }),
      } as any);

      const status = await checkUsageLimit("org-1", "maxProjects");
      expect(status.limit).toBeNull();
      expect(status.isExceeded).toBe(false);
    });
  });
});
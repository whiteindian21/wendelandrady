/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies BEFORE importing the module under test.
vi.mock("@/lib/auth", () => ({
  requireUser: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

describe("Billing permission checks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated users", async () => {
    vi.mocked(requireUser).mockRejectedValue(
      new Error("Not authenticated")
    );
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    } as any);

    const { getActiveOrganization } = await import("@/lib/billing/context");

    await expect(getActiveOrganization()).rejects.toThrow("Not authenticated");
  });

  it("rejects members from billing management", async () => {
    vi.mocked(requireUser).mockResolvedValue({
      id: "user-1",
      email: "member@test.com",
    } as any);

    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "org-1" }),
    } as any);

    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { role: "member" },
              }),
            }),
          }),
        }),
      }),
    } as any);

    const { requireBillingPermission, BillingError } = await import(
      "@/lib/billing/context"
    );

    // Need to also mock the organizations query
    const supabaseMock = vi.mocked(createClient).mock.results[0].value;
    supabaseMock.from = vi.fn().mockImplementation((table: string) => {
      if (table === "organization_memberships") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: { role: "member" } }),
              }),
            }),
          }),
        };
      }
      if (table === "organizations") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: "org-1", name: "Test Org", stripe_customer_id: null },
              }),
            }),
          }),
        };
      }
      return {} as any;
    });

    await expect(requireBillingPermission()).rejects.toThrow(BillingError);
    try {
      await requireBillingPermission();
    } catch (e) {
      expect(e).toBeInstanceOf(BillingError);
      expect((e as any).code).toBe("FORBIDDEN");
    }
  });

  it("allows owners to manage billing", async () => {
    vi.mocked(requireUser).mockResolvedValue({
      id: "user-1",
      email: "owner@test.com",
    } as any);

    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "org-1" }),
    } as any);

    const fromMock = vi.fn().mockImplementation((table: string) => {
      if (table === "organization_memberships") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: { role: "owner" } }),
              }),
            }),
          }),
        };
      }
      if (table === "organizations") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: "org-1", name: "Test Org", stripe_customer_id: null },
              }),
            }),
          }),
        };
      }
      return {} as any;
    });

    vi.mocked(createClient).mockResolvedValue({ from: fromMock } as any);

    const { requireBillingPermission } = await import("@/lib/billing/context");
    const ctx = await requireBillingPermission();

    expect(ctx.role).toBe("owner");
    expect(ctx.organization.id).toBe("org-1");
  });

  it("allows admins to manage billing", async () => {
    vi.mocked(requireUser).mockResolvedValue({
      id: "user-1",
      email: "admin@test.com",
    } as any);

    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "org-1" }),
    } as any);

    const fromMock = vi.fn().mockImplementation((table: string) => {
      if (table === "organization_memberships") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: { role: "admin" } }),
              }),
            }),
          }),
        };
      }
      if (table === "organizations") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: "org-1", name: "Test Org", stripe_customer_id: null },
              }),
            }),
          }),
        };
      }
      return {} as any;
    });

    vi.mocked(createClient).mockResolvedValue({ from: fromMock } as any);

    const { requireBillingPermission } = await import("@/lib/billing/context");
    const ctx = await requireBillingPermission();

    expect(ctx.role).toBe("admin");
  });
});
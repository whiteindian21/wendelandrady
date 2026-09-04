/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/stripe/server", () => ({
  getStripe: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: vi.fn(),
}));

vi.mock("@/lib/billing/sync", () => ({
  syncSubscription: vi.fn(),
  handleSubscriptionDeleted: vi.fn(),
  handleCheckoutCompleted: vi.fn(),
  handleInvoicePaid: vi.fn(),
  handleInvoicePaymentFailed: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { getStripe } from "@/lib/stripe/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

describe("Stripe webhook security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test_secret");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_secret");
  });

  it("rejects requests without stripe-signature header", async () => {
    const { POST } = await import("@/app/api/stripe/webhook/route");

    const req = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      body: "{}",
    });

    const response = await POST(req as any);
    expect(response.status).toBe(400);
  });

  it("rejects invalid webhook signatures", async () => {
    vi.mocked(getStripe).mockReturnValue({
      webhooks: {
        constructEvent: vi.fn().mockImplementation(() => {
          throw new Error("Invalid signature");
        }),
      },
    } as any);

    vi.mocked(getSupabaseAdmin).mockReturnValue({} as any);

    const { POST } = await import("@/app/api/stripe/webhook/route");

    const req = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      body: "raw payload",
      headers: { "stripe-signature": "t=123,v1=invalid" },
    });

    const response = await POST(req as any);
    expect(response.status).toBe(400);
  });

  it("does not parse JSON before signature verification", async () => {
    // The webhook route must call req.text() (raw body), NOT req.json().
    // This test verifies the raw body is passed to constructEvent.
    const constructEvent = vi.fn().mockReturnValue({
      id: "evt_test_123",
      type: "checkout.session.completed",
      data: { object: {} },
    });

    vi.mocked(getStripe).mockReturnValue({
      webhooks: { constructEvent },
    } as any);

    const insertMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(getSupabaseAdmin).mockReturnValue({
      from: vi.fn().mockReturnValue({
        insert: insertMock,
        update: updateMock,
      }),
    } as any);

    const { handleCheckoutCompleted } = await import("@/lib/billing/sync");
    vi.mocked(handleCheckoutCompleted).mockResolvedValue(undefined);

    const { POST } = await import("@/app/api/stripe/webhook/route");

    const rawBody = '{"id":"evt_test_123","type":"test"}';
    const req = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      body: rawBody,
      headers: { "stripe-signature": "t=123,v1=valid" },
    });

    await POST(req as any);

    // Verify constructEvent received the raw body string
    expect(constructEvent).toHaveBeenCalled();
    const [bodyArg] = constructEvent.mock.calls[0];
    expect(bodyArg).toBe(rawBody);
    expect(typeof bodyArg).toBe("string");
  });

  it("handles duplicate events idempotently", async () => {
    const constructEvent = vi.fn().mockReturnValue({
      id: "evt_duplicate_123",
      type: "checkout.session.completed",
      data: { object: {} },
    });

    vi.mocked(getStripe).mockReturnValue({
      webhooks: { constructEvent },
    } as any);

    // Simulate unique constraint violation (duplicate event)
    const insertMock = vi.fn().mockResolvedValue({
      error: { code: "23505", message: "duplicate key" },
    });

    vi.mocked(getSupabaseAdmin).mockReturnValue({
      from: vi.fn().mockReturnValue({ insert: insertMock }),
    } as any);

    const { POST } = await import("@/app/api/stripe/webhook/route");

    const req = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      body: "payload",
      headers: { "stripe-signature": "t=123,v1=valid" },
    });

    const response = await POST(req as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.duplicate).toBe(true);
  });

  it("processes supported event types", async () => {
    const supportedTypes = [
      "checkout.session.completed",
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "invoice.paid",
      "invoice.payment_failed",
    ];

    for (const type of supportedTypes) {
      const constructEvent = vi.fn().mockReturnValue({
        id: `evt_${type}_${Date.now()}`,
        type,
        data: { object: {} },
      });

      vi.mocked(getStripe).mockReturnValue({
        webhooks: { constructEvent },
      } as any);

      const insertMock = vi.fn().mockResolvedValue({ error: null });
      const updateMock = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(getSupabaseAdmin).mockReturnValue({
        from: vi.fn().mockReturnValue({
          insert: insertMock,
          update: updateMock,
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null }),
            }),
          }),
        }),
      } as any);

      const syncModule = await import("@/lib/billing/sync");
      vi.mocked(syncModule.syncSubscription).mockResolvedValue(undefined);
      vi.mocked(syncModule.handleSubscriptionDeleted).mockResolvedValue(undefined);
      vi.mocked(syncModule.handleCheckoutCompleted).mockResolvedValue(undefined);
      vi.mocked(syncModule.handleInvoicePaid).mockResolvedValue(undefined);
      vi.mocked(syncModule.handleInvoicePaymentFailed).mockResolvedValue(undefined);

      const { POST } = await import("@/app/api/stripe/webhook/route");

      const req = new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        body: "payload",
        headers: { "stripe-signature": "t=123,v1=valid" },
      });

      const response = await POST(req as any);
      expect(response.status).toBe(200);
    }
  });

  it("does not expose STRIPE_SECRET_KEY in responses", async () => {
    const constructEvent = vi.fn().mockImplementation(() => {
      throw new Error(
        `Error that might contain the secret: sk_test_123`
      );
    });

    vi.mocked(getStripe).mockReturnValue({
      webhooks: { constructEvent },
    } as any);

    vi.mocked(getSupabaseAdmin).mockReturnValue({} as any);

    const { POST } = await import("@/app/api/stripe/webhook/route");

    const req = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      body: "payload",
      headers: { "stripe-signature": "t=123,v1=invalid" },
    });

    const response = await POST(req as any);
    const json = await response.json();

    // The error message should be generic, not the raw Stripe error
    expect(JSON.stringify(json)).not.toContain("sk_test_123");
    expect(json.error).toBe("Invalid signature.");
  });
});
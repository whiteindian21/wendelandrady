import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Stripe configuration", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("getPlanBySlug returns the plan for a known slug", async () => {
    vi.stubEnv("STRIPE_PRICE_PRO_MONTHLY", "price_pro_monthly_123");
    vi.stubEnv("STRIPE_PRICE_PRO_YEARLY", "price_pro_yearly_123");
    vi.stubEnv("STRIPE_PRICE_BUSINESS_MONTHLY", "price_bus_monthly_123");
    vi.stubEnv("STRIPE_PRICE_BUSINESS_YEARLY", "price_bus_yearly_123");

    const { getPlanBySlug } = await import("@/config/stripe");
    const pro = getPlanBySlug("pro");
    expect(pro).toBeDefined();
    expect(pro!.name).toBe("Pro");
    expect(pro!.isFree).toBe(false);
  });

  it("getPlanBySlug returns undefined for unknown slug", async () => {
    const { getPlanBySlug } = await import("@/config/stripe");
    expect(getPlanBySlug("nonexistent")).toBeUndefined();
  });

  it("getPlanByPriceId resolves the correct plan and interval", async () => {
    vi.stubEnv("STRIPE_PRICE_PRO_MONTHLY", "price_pro_monthly_123");
    vi.stubEnv("STRIPE_PRICE_PRO_YEARLY", "price_pro_yearly_123");
    vi.stubEnv("STRIPE_PRICE_BUSINESS_MONTHLY", "price_bus_monthly_123");
    vi.stubEnv("STRIPE_PRICE_BUSINESS_YEARLY", "price_bus_yearly_123");

    const { getPlanByPriceId } = await import("@/config/stripe");

    const monthly = getPlanByPriceId("price_pro_monthly_123");
    expect(monthly).not.toBeNull();
    expect(monthly!.plan.slug).toBe("pro");
    expect(monthly!.interval).toBe("month");

    const yearly = getPlanByPriceId("price_pro_yearly_123");
    expect(yearly).not.toBeNull();
    expect(yearly!.interval).toBe("year");

    expect(getPlanByPriceId("price_unknown")).toBeNull();
  });

  it("getStripePriceId returns null for free plan", async () => {
    const { getStripePriceId } = await import("@/config/stripe");
    expect(getStripePriceId("free", "month")).toBeNull();
  });

  it("getStripePriceId returns null for unconfigured price", async () => {
    vi.stubEnv("STRIPE_PRICE_PRO_MONTHLY", "");
    vi.stubEnv("STRIPE_PRICE_PRO_YEARLY", "");

    const { getStripePriceId } = await import("@/config/stripe");
    expect(getStripePriceId("pro", "month")).toBeNull();
    expect(getStripePriceId("pro", "year")).toBeNull();
  });

  it("getStripePriceId returns the configured price ID", async () => {
    vi.stubEnv("STRIPE_PRICE_PRO_MONTHLY", "price_test_123");

    const { getStripePriceId } = await import("@/config/stripe");
    expect(getStripePriceId("pro", "month")).toBe("price_test_123");
  });

  it("isStripeConfigured returns false when STRIPE_SECRET_KEY is not set", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    const { isStripeConfigured } = await import("@/config/stripe");
    expect(isStripeConfigured()).toBe(false);
  });

  it("isStripeConfigured returns true when STRIPE_SECRET_KEY is set", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
    const { isStripeConfigured } = await import("@/config/stripe");
    expect(isStripeConfigured()).toBe(true);
  });

  it("Free plan always exists", async () => {
    const { getPlanBySlug, FREE_PLAN_SLUG } = await import("@/config/stripe");
    const free = getPlanBySlug(FREE_PLAN_SLUG);
    expect(free).toBeDefined();
    expect(free!.isFree).toBe(true);
    expect(free!.monthlyPriceId).toBeNull();
    expect(free!.yearlyPriceId).toBeNull();
  });

  it("getAppUrl falls back to localhost", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    const { getAppUrl } = await import("@/config/stripe");
    expect(getAppUrl()).toBe("http://localhost:3000");
  });

  it("getAppUrl strips trailing slash", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com/");
    const { getAppUrl } = await import("@/config/stripe");
    expect(getAppUrl()).toBe("https://example.com");
  });
});
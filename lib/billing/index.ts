// Barrel exports for billing utilities.

export { BillingError } from "./context";
export type { BillingContext } from "./context";
export {
  getActiveOrganization,
  requireBillingPermission,
  verifyOrganizationMembership,
} from "./context";

export {
  getOrganizationSubscription,
  getOrganizationSubscriptionHistory,
  getOrganizationPlan,
  hasActiveSubscription,
  canAccessPaidFeature,
  getBillingOverview,
  getAvailablePlans,
} from "./queries";
export type { BillingOverview } from "./queries";

export { getOrCreateStripeCustomer } from "./customers";
export { createCheckoutSession } from "./checkout";
export { createPortalSession } from "./portal";
export {
  cancelSubscriptionAtPeriodEnd,
  reactivateSubscription,
  changePlan,
} from "./subscriptions";

export {
  syncSubscription,
  handleSubscriptionDeleted,
  handleCheckoutCompleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
} from "./sync";
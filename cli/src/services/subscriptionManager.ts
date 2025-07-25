// Simplified subscription manager for local development - no limits or payments
export const subscriptionManager = {
  getSubscriptionInfo: async () => ({
    status: 'active' as const,
    tier: 'unlimited' as const,
    userId: 'local-dev'
  }),
  checkLimits: async () => true,
  updateUsage: async () => {}
};
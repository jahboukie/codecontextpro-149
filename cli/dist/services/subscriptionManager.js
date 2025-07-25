"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionManager = void 0;
// Simplified subscription manager for local development - no limits or payments
exports.subscriptionManager = {
    getSubscriptionInfo: async () => ({
        status: 'active',
        tier: 'unlimited',
        userId: 'local-dev'
    }),
    checkLimits: async () => true,
    updateUsage: async () => { }
};
//# sourceMappingURL=subscriptionManager.js.map
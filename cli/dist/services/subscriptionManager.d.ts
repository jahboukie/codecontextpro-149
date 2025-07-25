export declare const subscriptionManager: {
    getSubscriptionInfo: () => Promise<{
        status: "active";
        tier: "unlimited";
        userId: string;
    }>;
    checkLimits: () => Promise<boolean>;
    updateUsage: () => Promise<void>;
};
//# sourceMappingURL=subscriptionManager.d.ts.map
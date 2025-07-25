export declare const apiClient: {
    isAuthenticated: () => boolean;
    getCredentials: () => {
        email: string;
        userId: string;
    };
    login: () => Promise<{
        email: string;
        userId: string;
        displayName: string;
    }>;
    logout: () => void;
    validateApiKey: () => Promise<boolean>;
};
//# sourceMappingURL=apiClient.d.ts.map
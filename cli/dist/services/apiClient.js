"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = void 0;
// Simplified API client for local development - no authentication needed
exports.apiClient = {
    isAuthenticated: () => true,
    getCredentials: () => ({ email: 'local@dev', userId: 'local-dev' }),
    login: async () => ({
        email: 'local@dev',
        userId: 'local-dev',
        displayName: 'Local Developer'
    }),
    logout: () => { },
    validateApiKey: async () => true
};
//# sourceMappingURL=apiClient.js.map
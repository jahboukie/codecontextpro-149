// Simplified API client for local development - no authentication needed
export const apiClient = {
  isAuthenticated: () => true,
  getCredentials: () => ({ email: 'local@dev', userId: 'local-dev' }),
  login: async () => ({ 
    email: 'local@dev', 
    userId: 'local-dev',
    displayName: 'Local Developer'
  }),
  logout: () => {},
  validateApiKey: async () => true
};
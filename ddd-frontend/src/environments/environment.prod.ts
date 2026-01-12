/**
 * Production Environment Configuration
 * 
 * This file is used for production builds.
 * Angular CLI will replace environment.ts with this file during production builds.
 */
export const environment = {
  production: true,
  
  // API Configuration
  apiUrl: 'https://api.your-domain.com/api',
  apiVersion: 'v1',
  
  // Feature Flags
  features: {
    enableMockData: false,
    enableDebugMode: false,
    enableAnalytics: true,
  },
  
  // Authentication
  auth: {
    tokenKey: 'ddd_auth_token',
    refreshTokenKey: 'ddd_refresh_token',
    tokenExpirationMinutes: 60,
  },
  
  // Pagination Defaults
  pagination: {
    defaultPageSize: 12,
    pageSizeOptions: [12, 24, 48, 96],
  },
  
  // Cache Configuration
  cache: {
    defaultTTLMinutes: 15,
    maxItems: 200,
  },
};

export type Environment = typeof environment;

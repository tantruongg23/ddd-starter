/**
 * Development Environment Configuration
 * 
 * This file contains configuration for the development environment.
 * For production builds, environment.prod.ts will be used instead.
 */
export const environment = {
  production: false,
  
  // API Configuration
  apiUrl: 'http://localhost:8080/api',
  apiVersion: 'v1',
  
  // Feature Flags
  features: {
    enableMockData: true,
    enableDebugMode: true,
    enableAnalytics: false,
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
    defaultTTLMinutes: 5,
    maxItems: 100,
  },
};

export type Environment = typeof environment;

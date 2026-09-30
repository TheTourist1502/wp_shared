// Paths relative to VITE_API_URL (which already ends in `/api`).
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  HEALTH: '/health',
  PORTFOLIOS: {
    LIST: '/portfolios',
    TRANSACTIONS: (portfolioId: string) => `/portfolios/${portfolioId}/transactions`,
  },
  DASHBOARD: {
    SUMMARY: '/dashboard/summary',
    HOLDINGS: '/dashboard/holdings',
    PERFORMANCE: '/dashboard/performance',
  },
  MARKET: {
    INDICES: '/market/indices',
    MOVERS: '/market/movers',
  },
  NEWS: {
    MARKET: '/news',
    HOLDINGS: '/news/holdings',
  },
} as const;

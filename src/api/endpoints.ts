/**
 * @fileOverview Centralized API endpoint registry.
 */

export const ENDPOINTS = {
  PRODUCTS: {
    BY_BARCODE: (barcode: string) => `/products/${barcode}`,
    SEARCH: '/products/search',
    DISCOVERY: '/products/discovery',
  },
  AI: {
    INSIGHTS: '/ai/insights',
    IMAGE_ANALYSIS: '/ai/image-analysis',
    CHAT: '/ai/chat',
    ESTIMATE: '/ai/estimate',
  },
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  }
};

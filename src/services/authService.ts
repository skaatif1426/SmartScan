/**
 * @fileOverview Authentication service layer.
 * STRICTLY aligned with Backend Auth APIs Contract.
 */

import apiClient from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

export const authService = {
  /**
   * Logs in a user.
   * Aligned with POST /api/v1/auth/login
   */
  async login(credentials: { email: string; password: any }) {
    try {
      // Contract: returns data: { accessToken, refreshToken, user }
      const response: any = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
      if (response && response.accessToken) {
        localStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('refresh_token', response.refreshToken);
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Registers a new user.
   */
  async register(userData: any) {
    return apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
  },

  /**
   * Clears session logic.
   */
  async logout() {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/';
    }
  },

  /**
   * Fetches current authenticated user profile.
   */
  async getCurrentUser() {
    try {
      return await apiClient.get(ENDPOINTS.AUTH.ME);
    } catch (error) {
      return null;
    }
  }
};

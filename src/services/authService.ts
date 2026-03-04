/**
 * @fileOverview Authentication service layer.
 * Structured to handle Stateless JWT flows once Spring Boot is connected.
 */

import apiClient from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

export const authService = {
  /**
   * Logs in a user and stores the access token.
   */
  async login(credentials: { email: string; password: any }) {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
      if (response && response.access_token) {
        localStorage.setItem('access_token', response.access_token);
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

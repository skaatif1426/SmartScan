/**
 * @fileOverview Strict Production-Ready API client.
 * Enforces standardized Enterprise API Contract.
 */
'use client';

import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
  timestamp: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 7000, // Strict 7s timeout as per contract requirement
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const body = response.data as ApiResponse;

    // CONTRACT RULE: Must have status
    if (!body || !body.status) {
      throw new Error(`Response from ${response.config.url} missing status field.`);
    }

    if (body.status === 'success') {
      return body.data; // Services receive the raw data object
    }

    if (body.status === 'error') {
      throw {
        message: body.error?.message || 'Server error',
        code: body.error?.code || 'UNKNOWN_ERROR',
        status: response.status
      };
    }

    throw new Error('Inconsistent API response status.');
  },
  async (error: AxiosError) => {
    const { config, response } = error;
    const originalRequest = config as InternalAxiosRequestConfig & { _retry?: boolean };

    // AUTH FLOW: Handle Refresh Token on 401
    if (response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        // Contract POST /api/v1/auth/refresh
        const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken } = refreshResponse.data.data;

        localStorage.setItem('access_token', accessToken);
        isRefreshing = false;
        onTokenRefreshed(accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return Promise.reject(refreshError);
      }
    }

    // Standardize non-contractual network errors
    const apiError = {
      message: (error.response?.data as any)?.error?.message || error.message || 'Connection failed',
      status: error.response?.status || 500,
      code: (error.response?.data as any)?.error?.code || 'NETWORK_ERROR',
    };
    
    return Promise.reject(apiError);
  }
);

export default apiClient;

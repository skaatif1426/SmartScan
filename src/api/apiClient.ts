/**
 * @fileOverview Strict Production-Ready API client.
 * Enforces standardized Enterprise response formats and surfaces mismatches.
 */
'use client';

import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

export interface ApiResponse<T = any> {
  timestamp: string;
  status: number;
  data: T;
  errors: any;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Global timeout set to 15s for safety, but UI handles user-facing 7s
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
};

// Debug Logger for Development
const logDebug = (msg: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API DEBUG]: ${msg}`, data || '');
  }
};

apiClient.interceptors.request.use(
  (config) => {
    logDebug(`Request to ${config.url}`);
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
    const body = response.data;

    // STRICT VALIDATION: Ensure Spring Boot standard wrapper is present
    if (body && typeof body === 'object' && 'data' in body && 'status' in body) {
      logDebug(`Valid response from ${response.config.url}`);
      return body.data;
    }

    // Explicit Mismatch Error
    const mismatchMsg = `Response from ${response.config.url} does not follow enterprise wrapper format.`;
    console.error(`[STRICT AUDIT]: ${mismatchMsg}`, body);
    throw new Error(mismatchMsg);
  },
  async (error: AxiosError) => {
    const { config, response } = error;
    const originalRequest = config as InternalAxiosRequestConfig & { _retry?: boolean };

    // AUTH FLOW: Attempt token refresh on 401
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
        logDebug('Attempting token refresh...');
        // Simulate refresh call
        // const { access_token } = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: localStorage.getItem('refresh_token') });
        // localStorage.setItem('access_token', access_token);
        
        // Mock failure for now as backend is non-existent
        throw new Error('Refresh failed');
        
        // if successful:
        // isRefreshing = false;
        // onTokenRefreshed(access_token);
        // return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        logDebug('Refresh failed, logging out.');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          // window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    const responseData = error.response?.data as any;
    
    const apiError = {
      message: responseData?.message || error.message || 'Server connection failed',
      status: error.response?.status || 500,
      code: error.response?.code || 'NETWORK_FAILURE',
      details: responseData?.errors || null
    };
    
    logDebug('API Failure', apiError);
    return Promise.reject(apiError);
  }
);

export default apiClient;

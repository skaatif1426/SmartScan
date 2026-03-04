/**
 * @fileOverview Strict Production-Ready API client.
 * Enforces standardized Enterprise response formats and surfaces mismatches.
 */
'use client';

import axios, { AxiosResponse, AxiosError } from 'axios';

export interface ApiResponse<T = any> {
  timestamp: string;
  status: number;
  data: T;
  errors: any;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    const responseData = error.response?.data as any;
    
    const apiError = {
      message: responseData?.message || error.message || 'Server connection failed',
      status: error.response?.status || 500,
      code: responseData?.code || 'NETWORK_FAILURE',
      details: responseData?.errors || null
    };
    
    logDebug('API Failure', apiError);

    // AUTH FLOW: Attempt token refresh on 401
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      logDebug('401 detected. Session expired.');
      localStorage.removeItem('access_token');
      // In a real app, here you would trigger /auth/refresh
    }
    
    return Promise.reject(apiError);
  }
);

export default apiClient;

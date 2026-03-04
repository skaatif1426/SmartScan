/**
 * @fileOverview Production-ready API client using Axios.
 * Configured with base URL, timeouts, and enterprise-grade response wrapping.
 */
'use client';

import axios, { AxiosResponse, AxiosError } from 'axios';

// Standard Enterprise Response Wrapper
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

// Request Interceptor: JWT Attachment
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

// Response Interceptor: Standardized Extraction
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // If backend returns the standard wrapper, extract .data
    // Otherwise return the whole body (for simple mocks or external APIs)
    const body = response.data;
    if (body && typeof body === 'object' && 'data' in body && 'status' in body) {
      return body.data;
    }
    return body;
  },
  (error: AxiosError) => {
    const responseData = error.response?.data as any;
    
    const apiError = {
      message: responseData?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
      code: responseData?.code || 'INTERNAL_ERROR',
      details: responseData?.errors || null
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.error('[Enterprise API Failure]:', apiError);
    }
    
    return Promise.reject(apiError);
  }
);

export default apiClient;

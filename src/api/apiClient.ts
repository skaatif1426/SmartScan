/**
 * @fileOverview Production-ready API client using Axios.
 * Configured with base URL, timeouts, and standardized error handling.
 */
'use client';

import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add logic here to attach JWT from localStorage if needed
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Standardized Error Structure
    const apiError = {
      message: error.response?.data?.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
      code: error.response?.data?.code || 'INTERNAL_ERROR',
    };
    
    // We log on client for debugging but re-throw for the service layer to handle
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]:', apiError);
    }
    
    return Promise.reject(apiError);
  }
);

export default apiClient;

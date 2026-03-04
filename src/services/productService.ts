/**
 * @fileOverview Service layer for Product-related business logic.
 * Implements a strict "Backend-First" pattern with robust external API fallback.
 */

import { fetchProductFromApi } from '@/lib/openfoodfacts-api';
import apiClient from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';
import type { Product } from '@/lib/types';

export const productService = {
  /**
   * Fetches product details. 
   * STRATEGY: 
   * 1. Try internal Spring Boot API.
   * 2. If fail/404/500/Timeout, fallback to OpenFoodFacts.
   */
  async getProductByBarcode(barcode: string): Promise<Product | null> {
    try {
      // Step 1: Attempt to fetch from our Enterprise Backend
      const response = await apiClient.get(ENDPOINTS.PRODUCTS.BY_BARCODE(barcode));
      if (response) return response;
      
      // If backend returns 200 but empty data, we still fallback
      return await fetchProductFromApi(barcode);
    } catch (error: any) {
      // Step 2: Fallback if backend is unavailable or crashes
      // Specifically catching Network Errors, Timeouts, 404s and 500s.
      if (
        error.status === 404 || 
        error.status === 500 || 
        error.code === 'ERR_NETWORK' || 
        error.message?.includes('timeout')
      ) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[ProductService] Backend Simulation: ${error.message}. Triggering fallback.`);
        }
        return await fetchProductFromApi(barcode).catch(() => null);
      }
      
      // For all other errors, return null (handled by UI error cards)
      return null;
    }
  },

  /**
   * Reports a discovery to the backend.
   */
  async reportDiscovery(productData: any): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.PRODUCTS.DISCOVERY, productData);
    } catch (error) {
      // Silent fail for discoveries in prototype mode to prevent UI blockage
      console.warn('Backend discovery sync skipped.');
    }
  },

  /**
   * Search for products.
   */
  async searchProducts(query: string) {
    try {
      return await apiClient.get(ENDPOINTS.PRODUCTS.SEARCH, { params: { q: query } });
    } catch (error) {
      return [];
    }
  }
};

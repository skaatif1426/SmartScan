/**
 * @fileOverview Service layer for Product-related business logic.
 * Implements a strict "Backend-First" pattern with external API fallback.
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
   * 2. If fail/404, fallback to OpenFoodFacts.
   */
  async getProductByBarcode(barcode: string): Promise<Product | null> {
    try {
      // Step 1: Attempt to fetch from our Enterprise Backend
      const response = await apiClient.get(ENDPOINTS.PRODUCTS.BY_BARCODE(barcode));
      if (response) return response;
      
      return await fetchProductFromApi(barcode);
    } catch (error: any) {
      // Step 2: Fallback if backend is unavailable (ECONNREFUSED) or returns 404
      if (error.status === 404 || error.code === 'ERR_NETWORK' || error.status === 500) {
        return await fetchProductFromApi(barcode).catch(() => null);
      }
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
      // Silent fail for discoveries in prototype mode
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

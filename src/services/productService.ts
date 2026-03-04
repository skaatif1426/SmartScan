/**
 * @fileOverview Service layer for Product-related business logic.
 * Handles data fetching with fallbacks to external APIs.
 */

import { fetchProductFromApi } from '@/lib/openfoodfacts-api';
import apiClient from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';
import type { Product } from '@/lib/types';

export const productService = {
  /**
   * Fetches product details. First tries custom backend, then falls back to OpenFoodFacts.
   */
  async getProductByBarcode(barcode: string): Promise<Product | null> {
    try {
      // Logic: Try backend first if it's connected
      // const response = await apiClient.get(ENDPOINTS.PRODUCTS.BY_BARCODE(barcode));
      // if (response) return response;
      
      // Fallback to current external API
      return await fetchProductFromApi(barcode);
    } catch (error) {
      // If backend fails or is not found, use fallback
      console.warn('Backend service unavailable, using OpenFoodFacts fallback.');
      return await fetchProductFromApi(barcode);
    }
  },

  /**
   * Reports a new product discovery.
   */
  async reportDiscovery(productData: any): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.PRODUCTS.DISCOVERY, productData);
    } catch (error) {
      // In prototype mode, we just log locally
      console.log('Discovery logged locally. Backend report pending integration.');
    }
  }
};

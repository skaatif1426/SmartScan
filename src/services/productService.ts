/**
 * @fileOverview Product Service with Explicit Fallback Logic.
 * No silent redirection. If backend fails, the UI must handle the decision.
 */

import { fetchProductFromApi } from '@/lib/openfoodfacts-api';
import apiClient from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';
import type { Product, DataSource } from '@/lib/types';

export type ProductResult = 
  | { status: 'success'; source: DataSource; data: Product }
  | { status: 'error'; type: 'backend_unavailable' | 'not_found' | 'network_error'; barcode: string };

export const productService = {
  /**
   * Fetches product details. 
   * STRICT: No silent fallback to OpenFoodFacts.
   */
  async getProductByBarcode(barcode: string): Promise<ProductResult> {
    try {
      const response = await apiClient.get(ENDPOINTS.PRODUCTS.BY_BARCODE(barcode));
      if (response) {
        return { status: 'success', source: 'backend', data: response };
      }
      return { status: 'error', type: 'not_found', barcode };
    } catch (error: any) {
      if (error.status === 404) {
        return { status: 'error', type: 'not_found', barcode };
      }
      return { status: 'error', type: 'backend_unavailable', barcode };
    }
  },

  /**
   * Explicit Manual Fallback to External API.
   */
  async getProductFromExternal(barcode: string): Promise<ProductResult> {
    try {
      const data = await fetchProductFromApi(barcode);
      if (data) {
        return { status: 'success', source: 'openfoodfacts', data };
      }
      return { status: 'error', type: 'not_found', barcode };
    } catch (error) {
      return { status: 'error', type: 'network_error', barcode };
    }
  },

  async reportDiscovery(productData: any): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.PRODUCTS.DISCOVERY, productData);
    } catch (error) {
      console.warn('[Service] Discovery sync failed. Product remains local-only.');
    }
  }
};

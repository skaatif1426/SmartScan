/**
 * @fileOverview Product Service implementing Mapper Strategy.
 * Translates Backend and External data into UnifiedProduct format.
 */

import { fetchProductFromApi } from '@/lib/openfoodfacts-api';
import apiClient from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';
import { UnifiedProduct, Product, DataSource } from '@/lib/types';

export type ProductResult = 
  | { status: 'success'; source: DataSource; data: UnifiedProduct }
  | { status: 'error'; type: 'backend_unavailable' | 'not_found' | 'network_error' | 'timeout'; barcode: string; code?: string };

/**
 * Mapper: OpenFoodFacts -> UnifiedProduct
 */
function mapOFFToUnified(offData: Product): UnifiedProduct {
  const p = offData.product!;
  return {
    barcode: offData.code,
    name: p.product_name || 'Unknown Product',
    brand: p.brands || 'Unknown Brand',
    image: p.image_front_url || null,
    nutriments: {
      calories: p.nutriments?.['energy-kcal_100g'] || 0,
      protein: p.nutriments?.proteins_100g || 0,
      carbs: p.nutriments?.carbohydrates_100g || 0,
      fat: p.nutriments?.fat_100g || 0,
      sugar: p.nutriments?.sugars_100g || 0,
      salt: p.nutriments?.salt_100g || 0,
      saturatedFat: p.nutriments?.['saturated-fat_100g'] || 0,
    },
    healthScore: 0, // Will be calculated locally
    ingredients: p.ingredients_text_with_allergens ? [p.ingredients_text_with_allergens] : [],
    source: 'openfoodfacts',
    nutriscoreGrade: p.nutriscore_grade,
    novaGroup: p.nova_group,
    allergens: p.allergens_tags,
  };
}

/**
 * Mapper: Backend Contract -> UnifiedProduct
 */
function mapBackendToUnified(backendData: any): UnifiedProduct {
  return {
    ...backendData,
    source: 'backend', // Explicitly set as per contract
    // Ensure nested fields are safe
    nutriments: {
      calories: backendData.nutriments?.calories || 0,
      protein: backendData.nutriments?.protein || 0,
      carbs: backendData.nutriments?.carbs || 0,
      fat: backendData.nutriments?.fat || 0,
    },
    ingredients: Array.isArray(backendData.ingredients) ? backendData.ingredients : [],
  };
}

export const productService = {
  /**
   * Fetches product via Backend. 
   * Strict adherence to Backend API Contract.
   * Re-enabled automatic fallback for seamless UX.
   */
  async getProductByBarcode(barcode: string, retryCount = 0): Promise<ProductResult> {
    try {
      // Step 1: Try Backend
      const response = await apiClient.get(ENDPOINTS.PRODUCTS.BY_BARCODE(barcode));
      
      if (response) {
        return { 
          status: 'success', 
          source: 'backend', 
          data: mapBackendToUnified(response) 
        };
      }
      return { status: 'error', type: 'not_found', barcode };
    } catch (error: any) {
      // Step 2: Handle 404 (Backend explicitly says it doesn't have it)
      if (error.code === 'PRODUCT_NOT_FOUND' || error.status === 404) {
        // Even if 404, we try External Registry before giving up
        console.log(`[Service] Product ${barcode} not in backend. Trying Global Registry...`);
        return this.getProductFromExternal(barcode);
      }

      // Step 3: Handle Network Failures / Unreachable Server
      // Instead of showing error screen, we fallback AUTOMATICALLY for a "Direct Result" feel.
      if (error.code === 'NETWORK_ERROR' || error.status === 0 || error.code === 'ECONNABORTED') {
        console.warn(`[Service] Backend unreachable or timeout. Falling back to External API for ${barcode}...`);
        return this.getProductFromExternal(barcode);
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
      if (data && data.product) {
        return { status: 'success', source: 'openfoodfacts', data: mapOFFToUnified(data) };
      }
      return { status: 'error', type: 'not_found', barcode };
    } catch (error) {
      return { status: 'error', type: 'network_error', barcode };
    }
  },

  async reportDiscovery(productData: any): Promise<void> {
    try {
      // POST /api/v1/products
      await apiClient.post(ENDPOINTS.PRODUCTS.DISCOVERY, productData);
    } catch (error) {
      console.warn('[Service] Discovery sync failed.');
    }
  }
};

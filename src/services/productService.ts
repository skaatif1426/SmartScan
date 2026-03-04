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
  | { status: 'error'; type: 'not_found' | 'network_error'; barcode: string };

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
    source: 'backend',
    nutriments: {
      calories: backendData.nutriments?.calories || 0,
      protein: backendData.nutriments?.protein || 0,
      carbs: backendData.nutriments?.carbs || 0,
      fat: backendData.nutriments?.fat || 0,
      sugar: backendData.nutriments?.sugar,
      salt: backendData.nutriments?.salt,
      saturatedFat: backendData.nutriments?.saturatedFat,
    },
    ingredients: Array.isArray(backendData.ingredients) ? backendData.ingredients : [],
  };
}

export const productService = {
  /**
   * Fetches product via Backend with AUTOMATIC fallback.
   */
  async getProductByBarcode(barcode: string): Promise<ProductResult> {
    try {
      // 1. Try Backend FIRST
      const response = await apiClient.get(ENDPOINTS.PRODUCTS.BY_BARCODE(barcode));
      
      if (response) {
        return { 
          status: 'success', 
          source: 'backend', 
          data: mapBackendToUnified(response) 
        };
      }
      
      // If response is null/empty but no error thrown
      return this.getProductFromExternal(barcode);
    } catch (error: any) {
      // 2. AUTO-FALLBACK on any error (404, 500, Connection Refused)
      console.log(`[Service] Backend access issue for ${barcode}. Using Global Registry...`);
      return this.getProductFromExternal(barcode);
    }
  },

  /**
   * External Global Registry Fetch (OpenFoodFacts)
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
      await apiClient.post(ENDPOINTS.PRODUCTS.DISCOVERY, productData);
    } catch (error) {
      console.warn('[Service] Discovery sync skipped (Backend Offline).');
    }
  }
};

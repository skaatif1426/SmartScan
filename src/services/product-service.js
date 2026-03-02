/**
 * @fileoverview Service layer for Product-related API calls.
 * Encapsulates data fetching logic and DTO transformation.
 */
import apiClient from '@/lib/api-client';

export const ProductService = {
  /**
   * Fetches product details by barcode.
   * @param {string} barcode 
   * @returns {Promise<Object>} The product DTO
   */
  async getProductByBarcode(barcode) {
    return apiClient.get(`/products/${barcode}`);
  },

  /**
   * Searches for products with pagination and filters.
   * @param {Object} params { page, size, category }
   */
  async searchProducts(params) {
    return apiClient.get('/products/search', { params });
  },

  /**
   * Submits a new product discovery.
   * @param {Object} productData 
   */
  async reportDiscovery(productData) {
    return apiClient.post('/products/discovery', productData);
  }
};

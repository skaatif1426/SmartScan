import type { Product } from './types';

const API_URL = 'https://world.openfoodfacts.org/api/v3/product';

export async function fetchProductFromApi(barcode: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_URL}/${barcode}?fields=product_name,brands,image_front_url,nutriments,ingredients_text_with_allergens,nutriscore_grade,nova_group,allergens_tags,categories`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: Product = await response.json();

    if (data.status === 0 || !data.product) {
      return null; // Product not found
    }

    return data;
  } catch (error) {
    console.error('Error fetching product from OpenFoodFacts:', error);
    // You might want to re-throw the error or handle it as a specific error type
    throw new Error('Failed to fetch product data.');
  }
}

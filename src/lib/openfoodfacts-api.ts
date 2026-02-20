import { Product, ProductSchema } from './types';

const API_URL = 'https://world.openfoodfacts.org/api/v3/product';

export async function fetchProductFromApi(barcode: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_URL}/${barcode}?fields=product_name,brands,image_front_url,nutriments,ingredients_text_with_allergens,nutriscore_grade,nova_group,allergens_tags,categories`);
    
    // A 404 status from this API means the product was not found, which is a valid flow.
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: unknown = await response.json();

    if (!data || typeof data !== 'object' || !('product' in data) || !data.product) {
        return null;
    }

    const parsedProduct = ProductSchema.safeParse(data);

    if (!parsedProduct.success) {
        console.error("Zod validation failed:", parsedProduct.error.flatten());
        throw new Error('Failed to validate product data from API.');
    }

    if (parsedProduct.data.status === 0 || !parsedProduct.data.product) {
      return null; // Product not found
    }

    return parsedProduct.data;
  } catch (error) {
    console.error('Error fetching product from OpenFoodFacts:', error);
    // Re-throw the error to be handled by the caller (e.g. Server Action)
    throw new Error('Failed to fetch or validate product data.');
  }
}

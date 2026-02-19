import { z } from 'zod';

export const ProductSchema = z.object({
  code: z.string(),
  product: z.object({
    product_name: z.string().default('Unknown Product'),
    brands: z.string().nullish().default('Unknown Brand'),
    image_front_url: z.string().url().nullish(),
    nutriments: z.object({
      "energy-kcal_100g": z.number().optional(),
      fat_100g: z.number().optional(),
      "saturated-fat_100g": z.number().optional(),
      carbohydrates_100g: z.number().optional(),
      sugars_100g: z.number().optional(),
      proteins_100g: z.number().optional(),
      salt_100g: z.number().optional(),
    }).passthrough().default({}),
    ingredients_text_with_allergens: z.string().nullish().default('Not available'),
    nutriscore_grade: z.string().optional(),
    nova_group: z.number().optional(),
    allergens_tags: z.array(z.string()).default([]),
    categories: z.string().nullish().default(''),
  }).passthrough(),
  status: z.number(),
});
export type Product = z.infer<typeof ProductSchema>;


export interface ScanHistoryItem {
  barcode: string;
  productName: string;
  brand: string;
  imageUrl?: string | null;
  scanDate: string;
  categories?: string | null;
}

export type Language = 'English' | 'Hindi' | 'Marathi' | 'Hinglish';

export interface UserSettings {
  language: Language;
  isVeg: boolean;
  isNonVeg: boolean;
  allergies: string[];
  advancedUiMode: boolean; // For the "J9s"-like feature
}

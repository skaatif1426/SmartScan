import { z } from 'zod';

export const ProductSchema = z.object({
  code: z.string(),
  product: z.object({
    product_name: z.string().nullish().transform(v => v ?? 'Unknown Product'),
    brands: z.string().nullish().transform(v => v ?? 'Unknown Brand'),
    image_front_url: z.string().url().nullish(),
    nutriments: z.object({
      "energy-kcal_100g": z.coerce.number().nullish(),
      fat_100g: z.coerce.number().nullish(),
      "saturated-fat_100g": z.coerce.number().nullish(),
      carbohydrates_100g: z.coerce.number().nullish(),
      sugars_100g: z.coerce.number().nullish(),
      proteins_100g: z.coerce.number().nullish(),
      salt_100g: z.coerce.number().nullish(),
    }).passthrough().nullish().transform(v => v ?? {}),
    ingredients_text_with_allergens: z.string().nullish().transform(v => v ?? 'Not available'),
    nutriscore_grade: z.string().nullish(),
    nova_group: z.coerce.number().nullish(),
    allergens_tags: z.array(z.string()).nullish().transform(v => v ?? []),
    categories: z.string().nullish().transform(v => v ?? ''),
  }).passthrough().nullish(),
  status: z.coerce.number().or(z.string()).transform(v => typeof v === 'string' ? parseInt(v, 10) : v),
});
export type Product = z.infer<typeof ProductSchema>;


export interface ScanHistoryItem {
  barcode: string;
  productName: string;
  brand: string;
  imageUrl?: string | null;
  scanDate: string;
  categories?: string | null;
  healthScore?: number;
  isDiscovery?: boolean;
}

export interface DiscoveryItem {
  barcode: string;
  date: string;
}

export type Language = 'English' | 'Hindi' | 'Marathi' | 'Hinglish';
export type AiVerbosity = 'concise' | 'detailed';
export type HealthGoal = 'general' | 'weight-loss' | 'muscle-gain';
export type DataRetention = '30d' | '90d' | 'forever';


export interface UserSettings {
  language: Language;
  isVeg: boolean;
  isNonVeg: boolean;
  allergies: string[];
  advancedUiMode: boolean;
  aiChatEnabled: boolean;
  aiInsightsEnabled: boolean;
  aiVerbosity: AiVerbosity;
  healthGoal: HealthGoal;
  dataRetention: DataRetention;
}

export const UserPreferencesSchema = z.object({
  isVeg: z.boolean(),
  isNonVeg: z.boolean(),
  allergies: z.array(z.string()),
  healthGoal: z.enum(['general', 'weight-loss', 'muscle-gain']),
  aiVerbosity: z.enum(['concise', 'detailed']),
});
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;


// New AI Output Schema
export const NutritionInsightOutputSchema = z.object({
  summary: z.string().describe("A one-line, easy-to-understand summary of the product's nutritional profile."),
  healthScore: z.number().min(0).max(100).describe('An overall health score from 0 (unhealthy) to 100 (very healthy), based on all available data.'),
  risks: z.array(z.string()).describe('A list of potential health risks or warnings (e.g., "High in sugar", "Contains allergens").'),
  recommendation: z.string().describe('A short recommendation for consumption (e.g., "Good for a quick snack", "Enjoy in moderation").')
});
export type NutritionInsightOutput = z.infer<typeof NutritionInsightOutputSchema>;

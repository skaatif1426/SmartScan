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
export const LanguageSchema = z.enum(['English', 'Hindi', 'Marathi', 'Hinglish']);
export type AiVerbosity = 'concise' | 'balanced' | 'detailed';
export type AiFocusPriority = 'health' | 'budget' | 'ingredients' | 'eco' | 'performance';
export type HealthGoal = 'general' | 'weight-loss' | 'muscle-gain' | 'maintain-weight' | 'improve-diet' | 'manage-condition';
export type HealthFocus = 'low-sugar' | 'low-fat' | 'high-protein' | 'low-carb' | 'high-fiber' | 'low-sodium' | 'organic' | 'budget-friendly' | 'overall-health' | 'price-conscious' | 'clean-ingredients' | 'eco-friendly';
export type DietType = 'none' | 'vegetarian' | 'vegan' | 'non-vegetarian' | 'keto' | 'paleo' | 'eggetarian';
export type DataRetention = '30d' | '90d' | 'forever';
export type Theme = 'light' | 'dark' | 'system';
export type UnitSystem = 'metric' | 'imperial';


export interface UserSettings {
  name: string;
  email: string;
  language: Language;
  theme: Theme;
  units: UnitSystem;
  diet: DietType;
  allergies: string[];
  healthGoal: HealthGoal;
  healthFocus: HealthFocus[];
  aiVerbosity: AiVerbosity;
  aiFocusPriority: AiFocusPriority;
  autoLanguageReply: boolean;
  advancedUiMode: boolean;
  aiChatEnabled: boolean;
  aiInsightsEnabled: boolean;
  dataRetention: DataRetention;
  strictMode: boolean;
  notifications: {
    master: boolean;
    smart: boolean;
    goalReminders: boolean;
    scanReminders: boolean;
    insightAlerts: boolean;
  };
  // Deprecated, for migration only
  isVeg?: boolean;
  isNonVeg?: boolean;
}

export const UserPreferencesSchema = z.object({
  diet: z.nativeEnum({
    none: 'none',
    vegetarian: 'vegetarian',
    vegan: 'vegan',
    'non-vegetarian': 'non-vegetarian',
    keto: 'keto',
    paleo: 'paleo',
    eggetarian: 'eggetarian'
  }),
  allergies: z.array(z.string()),
  healthGoal: z.nativeEnum({
    general: 'general',
    'weight-loss': 'weight-loss',
    'muscle-gain': 'muscle-gain',
    'maintain-weight': 'maintain-weight',
    'improve-diet': 'improve-diet',
    'manage-condition': 'manage-condition',
  }),
  healthFocus: z.array(z.nativeEnum({
    'low-sugar': 'low-sugar',
    'low-fat': 'low-fat',
    'high-protein': 'high-protein',
    'low-carb': 'low-carb',
    'high-fiber': 'high-fiber',
    'low-sodium': 'low-sodium',
    organic: 'organic',
    'budget-friendly': 'budget-friendly',
    'overall-health': 'overall-health',
    'price-conscious': 'price-conscious',
    'clean-ingredients': 'clean-ingredients',
    'eco-friendly': 'eco-friendly',
  })),
  aiVerbosity: z.enum(['concise', 'balanced', 'detailed']),
  strictMode: z.boolean(),
});
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;


// New AI Output Schema
export const NutritionInsightOutputSchema = z.object({
  summary: z.string().describe("A one-line, easy-to-understand summary of the product's nutritional profile."),
  healthScore: z.number().min(0).max(100).describe('An overall health score from 0 (unhealthy) to 100 (very healthy), based on all available data.'),
  risks: z.array(z.string()).describe('A list of potential health risks or warnings (e.g., "High in sugar", "Contains allergens").'),
  recommendation: z.string().describe('A short recommendation for consumption (e.g., "Good for a quick snack", "Enjoy in moderation").'),
  category: z.string().optional().describe("A plausible product category (e.g., 'Snacks', 'Beverages').")
});
export type NutritionInsightOutput = z.infer<typeof NutritionInsightOutputSchema>;

import { z } from 'zod';

/**
 * Unified Data Source Type
 */
export type DataSource = 'backend' | 'openfoodfacts' | 'ai-estimate' | 'image-analysis';

/**
 * Unified Product structure used by the Frontend UI.
 * This decouples the UI from specific API response keys.
 */
export interface UnifiedProduct {
  barcode: string;
  name: string;
  brand: string;
  image: string | null;
  nutriments: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar?: number;
    salt?: number;
    saturatedFat?: number;
  };
  healthScore: number;
  ingredients: string[];
  source: DataSource;
  nutriscoreGrade?: string;
  novaGroup?: number;
  allergens?: string[];
}

/**
 * Backend Product Contract Schema
 */
export const BackendProductSchema = z.object({
  barcode: z.string(),
  name: z.string(),
  brand: z.string(),
  image: z.string().url().nullable(),
  nutriments: z.object({
    calories: z.number().default(0),
    protein: z.number().default(0),
    carbs: z.number().default(0),
    fat: z.number().default(0),
  }),
  healthScore: z.number().min(0).max(100).default(0),
  ingredients: z.array(z.string()).default([]),
  source: z.literal('backend'),
});

/**
 * Legacy OpenFoodFacts Schema (for mapping)
 */
export const ProductSchema = z.object({
  code: z.string(),
  product: z.object({
    product_name: z.string().nullish(),
    brands: z.string().nullish(),
    image_front_url: z.string().url().nullish(),
    nutriments: z.object({
      "energy-kcal_100g": z.coerce.number().nullish(),
      fat_100g: z.coerce.number().nullish(),
      "saturated-fat_100g": z.coerce.number().nullish(),
      carbohydrates_100g: z.coerce.number().nullish(),
      sugars_100g: z.coerce.number().nullish(),
      proteins_100g: z.coerce.number().nullish(),
      salt_100g: z.coerce.number().nullish(),
    }).passthrough().nullish(),
    ingredients_text_with_allergens: z.string().nullish(),
    nutriscore_grade: z.string().nullish(),
    nova_group: z.coerce.number().nullish(),
    allergens_tags: z.array(z.string()).nullish(),
    categories: z.string().nullish(),
  }).passthrough().nullish(),
  status: z.coerce.number().or(z.string()).transform(v => typeof v === 'string' ? parseInt(v, 10) : v),
});

export type Product = z.infer<typeof ProductSchema>;

/**
 * AI Service Contract Schemas
 */
export const NutritionInsightOutputSchema = z.object({
  summary: z.string(),
  healthScore: z.number().min(0).max(100),
  risks: z.array(z.string()),
  recommendation: z.string(),
  category: z.string().optional()
});

export type NutritionInsightOutput = z.infer<typeof NutritionInsightOutputSchema>;

export const ImageAnalysisOutputSchema = z.object({
  productName: z.string(),
  summary: z.string(),
  confidence: z.enum(['Low', 'Medium', 'High']),
  healthScore: z.number().min(0).max(100),
  nutrition: z.object({
    calories: z.number(),
    sugar: z.number(),
    fat: z.number(),
    protein: z.number(),
  }),
  insights: z.object({
    ingredients: z.string(),
    healthImpact: z.string(),
    whoShouldAvoid: z.string(),
    betterAlternatives: z.string(),
  })
});

export type ImageAnalysisOutput = z.infer<typeof ImageAnalysisOutputSchema>;

/**
 * Global User Settings types (Persistence)
 */
export type Language = 'English' | 'Hindi' | 'Marathi' | 'Hinglish';
export const LanguageSchema = z.enum(['English', 'Hindi', 'Marathi', 'Hinglish']);
export type AiVerbosity = 'concise' | 'balanced' | 'detailed';
export type AiFocusPriority = 'health' | 'budget' | 'ingredients' | 'eco' | 'performance';
export type HealthGoal = 'general' | 'weight-loss' | 'muscle-gain' | 'maintain-weight' | 'improve-diet' | 'manage-condition';
export type HealthFocus = 'low-sugar' | 'low-fat' | 'high-protein' | 'low-carb' | 'high-fiber' | 'low-sodium' | 'organic' | 'budget-friendly' | 'overall-health' | 'price-conscious' | 'clean-ingredients' | 'eco-friendly';
export type DietType = 'none' | 'vegetarian' | 'vegan' | 'non-vegetarian' | 'keto' | 'paleo' | 'eggetarian';
export type DataRetention = '30d' | '90d' | 'forever';
export type Theme = 'light' | 'dark';
export type UnitSystem = 'metric' | 'imperial';

export interface UserSettings {
  name: string;
  email: string;
  profilePicUrl: string | null;
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

export interface ScanHistoryItem {
  barcode: string;
  productName: string;
  brand: string;
  imageUrl?: string | null;
  scanDate: string;
  categories?: string | null;
  healthScore?: number;
  isDiscovery?: boolean;
  type?: 'barcode' | 'image';
  source: DataSource;
  imageAnalysis?: ImageAnalysisOutput;
}

export interface DiscoveryItem {
  barcode: string;
  date: string;
}

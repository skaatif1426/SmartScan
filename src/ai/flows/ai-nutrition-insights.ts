'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating AI-powered nutrition insights.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { NutritionInsightOutputSchema, UserPreferencesSchema, LanguageSchema } from '@/lib/types';

const NutritionFactsSchema = z.object({
  energy_kcal_100g: z.number().optional().describe('Energy in kcal per 100g.'),
  fat_100g: z.number().optional().describe('Total fat in grams per 100g.'),
  saturated_fat_100g: z.number().optional().describe('Saturated fat in grams per 100g.'),
  carbohydrates_100g: z.number().optional().describe('Total carbohydrates in grams per 100g.'),
  sugars_100g: z.number().optional().describe('Sugars in grams per 100g.'),
  proteins_100g: z.number().optional().describe('Proteins in grams per 100g.'),
  salt_100g: z.number().optional().describe('Salt in grams per 100g.'),
});

const NutritionInsightInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  ingredientsText: z.string().optional().describe('The raw ingredients list of the product.'),
  nutriscoreGrade: z.string().optional().describe('The Nutri-score grade (e.g., A, B, C, D, E).'),
  novaGroup: z.number().optional().describe('The NOVA group for food processing level (1-4).'),
  allergens: z.array(z.string()).optional().describe('A list of common allergens present in the product.'),
  nutritionFacts: NutritionFactsSchema.optional().describe('Detailed nutritional values per 100g.'),
  healthScore: z.number().describe('The pre-calculated health score from 0 to 100.'),
  warnings: z.array(z.string()).describe('A list of pre-identified warnings that contributed to the score.'),
  userPreferences: UserPreferencesSchema.optional().describe("The user's dietary and personalization preferences."),
  language: LanguageSchema.describe("The language for the response."),
});
export type NutritionInsightInput = z.infer<typeof NutritionInsightInputSchema>;

const nutritionInsightPrompt = ai.definePrompt({
  name: 'nutritionInsightPrompt_v7',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: NutritionInsightInputSchema },
  output: { schema: NutritionInsightOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are an expert AI nutrition analyst. Your task is to explain a health score for a food product, personalized for the user.

Response Language: {{{language}}}

User Profile:
- Goal: {{{userPreferences.healthGoal}}}
- Diet: {{{userPreferences.diet}}}
- Allergies: {{{userPreferences.allergies}}}
- Focus: {{{userPreferences.healthFocus}}}

Product: {{{productName}}}
Health Score: {{{healthScore}}}
Key Warnings: {{{warnings}}}
Ingredients: {{{ingredientsText}}}

Instructions:
1. Provide a concise 'summary' of why the product got this score.
2. Provide a personalized 'recommendation'.
3. In 'longTermImpact', predict the future health outlook (A-Z) if eaten regularly for 5+ years.
4. Use provided 'healthScore' as-is.`,
});

const generateNutritionInsightsFlow = ai.defineFlow(
  {
    name: 'generateNutritionInsightsFlow',
    inputSchema: NutritionInsightInputSchema,
    outputSchema: NutritionInsightOutputSchema,
  },
  async (input) => {
    const { output } = await nutritionInsightPrompt(input);
    if (!output) throw new Error('AI failed to generate a structured response.');
    return {
        ...output,
        healthScore: input.healthScore,
        risks: [...new Set([...input.warnings, ...output.risks])]
    };
  }
);

export async function generateNutritionInsights(input: any) {
  return generateNutritionInsightsFlow(input);
}

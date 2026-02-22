'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating AI-powered nutrition insights.
 *
 * - generateNutritionInsights - A function that generates a structured nutrition insight for a given product.
 * - NutritionInsightInput - The input type for the generateNutritionInsights function.
 * - NutritionInsightOutput - The return type for the generateNutritionInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { NutritionInsightOutput, NutritionInsightOutputSchema, UserPreferencesSchema, LanguageSchema } from '@/lib/types';

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
  name: 'nutritionInsightPrompt_v5',
  input: { schema: NutritionInsightInputSchema },
  output: { schema: NutritionInsightOutputSchema },
  prompt: `You are an expert AI nutrition analyst. Your task is to explain a pre-calculated health score for a food product, PERSONALIZED for the user and delivered in their chosen language.

Your entire response (summary, recommendation, and risk names) MUST be in the language specified here: {{{language}}}. Do not use any other language.

--- USER PREFERENCES (Use these to tailor your response) ---
- Primary Health Goal: {{{userPreferences.healthGoal}}}
- Specific Focus Areas: {{{userPreferences.healthFocus}}}
- Diet: {{{userPreferences.diet}}}
- Known Allergies: {{{userPreferences.allergies}}}
- Allergy Strict Mode: {{{userPreferences.strictMode}}}
- Desired AI Style: {{{userPreferences.aiVerbosity}}}
---

Based on ALL the provided information, your task is:
1.  Use the provided 'healthScore' as the final 'healthScore' in your output. DO NOT change it.
2.  Use the provided 'warnings' list as the primary basis for the 'risks' in your output. You can add more risks if you identify them from the ingredients or based on the user's preferences (e.g., if a product is high in sugar and the user's focus is 'low-sugar', add a risk for it).
3.  **PRIORITY 1 (Allergies):** If any of the user's known allergies are present in the product's allergens list, you MUST add a specific risk for it (e.g., "Contains nuts, which you are allergic to"). If strict mode is on, be more emphatic.
4.  **PRIORITY 2 (Diet):** If the user's diet (e.g., 'vegetarian', 'vegan') conflicts with the product ingredients, you MUST add a risk.
5.  Write a 'summary' that explains IN SIMPLE TERMS why the product received its score, referencing the main warnings.
6.  Write a 'recommendation' that is PERSONALLY tailored to the user's 'Primary Health Goal' and 'Specific Focus Areas'. For example, if their goal is 'weight-loss' and focus is 'low-carb', explain if this product fits that goal. If the product is high in protein and their goal is 'muscle-gain', mention that.
7.  Adjust the length and detail of your 'summary' and 'recommendation' based on the user's 'Desired AI Style' ('concise', 'balanced', 'detailed').
8.  If a user has a 'budget-friendly' or 'price-conscious' focus, you cannot know the price, so your recommendation could say "Check the price to see if it fits your budget."

Product Information:
- Name: {{{productName}}}
- Health Score: {{{healthScore}}}
- Key Warnings: {{{warnings}}}
- Ingredients: {{{ingredientsText}}}
- Nutri-score: {{{nutriscoreGrade}}}
- NOVA Group: {{{novaGroup}}}
- Product Allergens: {{{allergens}}}
- Nutrition Facts (per 100g):
  - Energy: {{{nutritionFacts.energy_kcal_100g}}} kcal
  - Fat: {{{nutritionFacts.fat_100g}}}g
  - Saturated Fat: {{{nutritionFacts.saturated_fat_100g}}}g
  - Carbohydrates: {{{nutritionFacts.carbohydrates_100g}}}g
  - Sugars: {{{nutritionFacts.sugars_100g}}}g
  - Proteins: {{{nutritionFacts.proteins_100g}}}g
  - Salt: {{{nutritionFacts.salt_100g}}}g
`,
});

const generateNutritionInsightsFlow = ai.defineFlow(
  {
    name: 'generateNutritionInsightsFlow',
    inputSchema: NutritionInsightInputSchema,
    outputSchema: NutritionInsightOutputSchema,
  },
  async (input) => {
    const { output } = await nutritionInsightPrompt(input);
    if (!output) {
        throw new Error('AI failed to generate a structured response.');
    }
    // Enforce the score and merge risks to be safe.
    return {
        ...output,
        healthScore: input.healthScore,
        risks: [...new Set([...input.warnings, ...output.risks])]
    };
  }
);

export async function generateNutritionInsights(input: NutritionInsightInput): Promise<NutritionInsightOutput> {
  return generateNutritionInsightsFlow(input);
}

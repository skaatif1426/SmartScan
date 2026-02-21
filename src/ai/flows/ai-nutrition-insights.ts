'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating AI-powered nutrition insights.
 *
 * - generateNutritionInsights - A function that generates a structured nutrition insight for a given product.
 * - NutritionInsightInput - The input type for the generateNutritionInsights function.
 * - NutritionInsightOutput - The return type for the generateNutritionInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { NutritionInsightOutput, NutritionInsightOutputSchema } from '@/lib/types';

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
});
export type NutritionInsightInput = z.infer<typeof NutritionInsightInputSchema>;

const nutritionInsightPrompt = ai.definePrompt({
  name: 'nutritionInsightPrompt_v1',
  input: { schema: NutritionInsightInputSchema },
  output: { schema: NutritionInsightOutputSchema },
  prompt: `You are an expert AI nutrition analyst. Your task is to explain a pre-calculated health score for a food product.

You have been given the product information, a health score (from 0-100), and a list of warnings that determined that score.

Based on ALL the provided product information, your task is to:
1.  Use the provided 'healthScore' as the final 'healthScore' in your output. DO NOT change it.
2.  Use the provided 'warnings' as the primary basis for the 'risks' in your output. You can add more risks if you identify them from the ingredients list (e.g., artificial sweeteners, preservatives), but you MUST include the original warnings.
3.  Write a 'summary' that explains IN SIMPLE TERMS why the product received its score, referencing the main warnings.
4.  Provide a helpful and encouraging 'recommendation' for consumption.

Your language should be informative, not alarming.

Product Information:
- Name: {{{productName}}}
- Health Score: {{{healthScore}}}
- Key Warnings: {{{warnings}}}
- Ingredients: {{{ingredientsText}}}
- Nutri-score: {{{nutriscoreGrade}}}
- NOVA Group: {{{novaGroup}}}
- Allergens: {{{allergens}}}
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

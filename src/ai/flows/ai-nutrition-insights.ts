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
});
export type NutritionInsightInput = z.infer<typeof NutritionInsightInputSchema>;

// Tool for checking nutrition warnings based on thresholds
const checkNutritionWarnings = ai.defineTool(
  {
    name: 'checkNutritionWarnings',
    description: 'Checks for potential nutrition warnings (e.g., high sugar, salt, saturated fat, or allergens).',
    inputSchema: z.object({
      sugars_100g: z.number().optional().describe('Sugars in grams per 100g.'),
      salt_100g: z.number().optional().describe('Salt in grams per 100g.'),
      saturated_fat_100g: z.number().optional().describe('Saturated fat in grams per 100g.'),
      allergens: z.array(z.string()).optional().describe('A list of common allergens present.'),
      nutriscoreGrade: z.string().optional().describe('The Nutri-score grade.'),
      novaGroup: z.number().optional().describe('The NOVA group.'),
    }),
    outputSchema: z.object({
      warnings: z.array(z.string()).describe('A list of identified warnings.'),
    }),
  },
  async (input) => {
    const warnings: string[] = [];

    // Thresholds per 100g (example values, may vary by region/guideline)
    const HIGH_SUGAR_THRESHOLD = 22.5; // grams
    const HIGH_SALT_THRESHOLD = 1.5;   // grams
    const HIGH_SATFAT_THRESHOLD = 5;  // grams

    if (input.sugars_100g !== undefined && input.sugars_100g >= HIGH_SUGAR_THRESHOLD) {
      warnings.push('High in sugar');
    }
    if (input.salt_100g !== undefined && input.salt_100g >= HIGH_SALT_THRESHOLD) {
      warnings.push('High in salt');
    }
    if (input.saturated_fat_100g !== undefined && input.saturated_fat_100g >= HIGH_SATFAT_THRESHOLD) {
      warnings.push('High in saturated fat');
    }

    if (input.allergens && input.allergens.length > 0) {
      warnings.push(`Contains allergens: ${input.allergens.join(', ')}`);
    }

    if (input.nutriscoreGrade && ['D', 'E'].includes(input.nutriscoreGrade.toUpperCase())) {
      warnings.push(`Poor Nutri-score: ${input.nutriscoreGrade}`);
    }
    
    if (input.novaGroup !== undefined && input.novaGroup >= 3) {
      warnings.push(input.novaGroup === 4 ? 'Ultra-processed food (NOVA 4)' : 'Processed food (NOVA 3)');
    }

    return { warnings };
  }
);

const nutritionInsightPrompt = ai.definePrompt({
  name: 'nutritionInsightPrompt',
  input: { schema: NutritionInsightInputSchema },
  output: { schema: NutritionInsightOutputSchema },
  tools: [checkNutritionWarnings],
  prompt: `You are an expert AI nutrition analyst. Your task is to provide a structured, non-medical nutritional analysis of the provided food product.

Analyze all the information below. Use the 'checkNutritionWarnings' tool to identify potential health risks. Based on your full analysis, generate a health score from 0-100, where 100 is exceptionally healthy.

Then, you MUST provide the output in the requested JSON format containing: 'summary', 'healthScore', 'risks', and 'recommendation'.

Product Information:
- Name: {{{productName}}}
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
    return output;
  }
);

export async function generateNutritionInsights(input: NutritionInsightInput): Promise<NutritionInsightOutput> {
  return generateNutritionInsightsFlow(input);
}

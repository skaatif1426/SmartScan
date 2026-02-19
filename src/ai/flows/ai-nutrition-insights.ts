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

// Tool for checking nutrition warnings and calculating a base score
const checkNutritionAndScore = ai.defineTool(
  {
    name: 'checkNutritionAndScore',
    description: 'Checks for nutrition warnings (e.g., high sugar, salt, saturated fat) and calculates a base health score from 0 to 100.',
    inputSchema: z.object({
      sugars_100g: z.number().optional().describe('Sugars in grams per 100g.'),
      salt_100g: z.number().optional().describe('Salt in grams per 100g.'),
      saturated_fat_100g: z.number().optional().describe('Saturated fat in grams per 100g.'),
      proteins_100g: z.number().optional().describe('Protein in grams per 100g.'),
      allergens: z.array(z.string()).optional().describe('A list of common allergens present.'),
      nutriscoreGrade: z.string().optional().describe('The Nutri-score grade.'),
      novaGroup: z.number().optional().describe('The NOVA group.'),
    }),
    outputSchema: z.object({
      warnings: z.array(z.string()).describe('A list of identified warnings.'),
      baseScore: z.number().describe('A base health score from 0-100 calculated from the inputs.'),
    }),
  },
  async (input) => {
    const warnings: string[] = [];
    let score = 100;

    const HIGH_SUGAR_THRESHOLD = 22.5;
    const HIGH_SALT_THRESHOLD = 1.5;
    const HIGH_SATFAT_THRESHOLD = 5;

    if (input.sugars_100g !== undefined) {
      if (input.sugars_100g >= HIGH_SUGAR_THRESHOLD) {
        warnings.push('High in sugar');
        score -= 25;
      } else if (input.sugars_100g > 10) {
        score -= 10;
      }
    }

    if (input.salt_100g !== undefined) {
        if (input.salt_100g >= HIGH_SALT_THRESHOLD) {
            warnings.push('High in salt');
            score -= 25;
        } else if (input.salt_100g > 0.3) {
            score -= 10;
        }
    }

    if (input.saturated_fat_100g !== undefined) {
        if (input.saturated_fat_100g >= HIGH_SATFAT_THRESHOLD) {
            warnings.push('High in saturated fat');
            score -= 20;
        } else if (input.saturated_fat_100g > 1.5) {
            score -= 10;
        }
    }
    
    if (input.allergens && input.allergens.length > 0) {
      warnings.push(`Contains allergens: ${input.allergens.join(', ')}`);
    }

    if (input.nutriscoreGrade && ['D', 'E'].includes(input.nutriscoreGrade.toUpperCase())) {
      warnings.push(`Poor Nutri-score: ${input.nutriscoreGrade}`);
      score -= (input.nutriscoreGrade.toUpperCase() === 'D' ? 15 : 25);
    }
    
    if (input.novaGroup !== undefined) {
      if (input.novaGroup === 4) {
        warnings.push('Ultra-processed food (NOVA 4)');
        score -= 20;
      } else if (input.novaGroup === 3) {
        warnings.push('Processed food (NOVA 3)');
        score -= 10;
      }
    }

    if (input.proteins_100g !== undefined && input.proteins_100g > 10) {
        score += 5;
    }

    return { warnings, baseScore: Math.max(0, Math.min(100, Math.round(score))) };
  }
);

const nutritionInsightPrompt = ai.definePrompt({
  name: 'nutritionInsightPrompt',
  input: { schema: NutritionInsightInputSchema },
  output: { schema: NutritionInsightOutputSchema },
  tools: [checkNutritionAndScore],
  prompt: `You are an expert AI nutrition analyst. Your task is to provide a structured, non-medical nutritional analysis of a food product.

First, you MUST use the 'checkNutritionAndScore' tool to get a base score and a list of warnings.

Then, conduct a holistic analysis of ALL provided product information. Refine the base score into a final 'healthScore' (0-100), considering nuances the tool might miss (e.g., ingredient quality, context). The final score should be your own conclusion.

Finally, generate the output in the requested JSON format with 'summary', 'healthScore', 'risks' (which should include the warnings from the tool plus any others you identify), and a 'recommendation'. Your language should be encouraging and informative, not alarming.

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

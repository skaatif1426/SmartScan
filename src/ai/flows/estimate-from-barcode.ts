'use server';
/**
 * @fileOverview This file implements a Genkit flow for estimating nutrition insights from a barcode.
 *
 * - generateEstimateFromBarcode - A function that generates a plausible-sounding nutrition insight for a given barcode.
 * - EstimateInput - The input type for the generateEstimateFromBarcode function.
 * - NutritionInsightOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { NutritionInsightOutput, NutritionInsightOutputSchema, LanguageSchema } from '@/lib/types';

const EstimateInputSchema = z.object({
    barcode: z.string().describe("The product barcode."),
    language: LanguageSchema.describe("The language for the response."),
});
export type EstimateInput = z.infer<typeof EstimateInputSchema>;


const estimateFromBarcodePrompt = ai.definePrompt({
  name: 'estimateFromBarcodePrompt_v3',
  input: { schema: EstimateInputSchema },
  output: { schema: NutritionInsightOutputSchema },
  prompt: `You are a creative nutrition analyst AI. You've been given a barcode: {{{barcode}}}. You cannot look up barcodes on the internet.
Your task is to generate a plausible, hypothetical nutritional analysis for a common type of product that *could* have such a barcode (e.g., a snack food, a beverage, a canned good).

Your entire response MUST be in the specified language: {{{language}}}.

1.  **Choose a hypothetical product** (e.g., "Potato Chips", "Cola Soda").
2.  **Assign a general category** for this product (e.g., 'Snacks', 'Beverages').
3.  **Generate a plausible analysis**: healthScore, risks, summary, and recommendation.
4.  **Crucially, make it clear this is an estimate**:
    - In the 'summary', start with a phrase like "As an AI estimate, this product could be...".
    - In the 'recommendation', include a sentence like "This is a hypothetical analysis; scan the actual product for accurate information."

Your entire response must be in the required JSON format, including the new 'category' field. Do not add any other text.
`,
});

const generateEstimateFromBarcodeFlow = ai.defineFlow(
  {
    name: 'generateEstimateFromBarcodeFlow',
    inputSchema: EstimateInputSchema,
    outputSchema: NutritionInsightOutputSchema,
  },
  async (input) => {
    const { output } = await estimateFromBarcodePrompt(input);
    if (!output) {
        throw new Error('AI failed to generate an estimated response.');
    }
    return output;
  }
);

export async function generateEstimateFromBarcode(input: EstimateInput): Promise<NutritionInsightOutput> {
  return generateEstimateFromBarcodeFlow(input);
}

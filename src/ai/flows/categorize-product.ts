'use server';
/**
 * @fileOverview A Genkit flow for assigning a category to a product.
 *
 * - categorizeProduct - A function that returns a category for a product.
 * - CategorizeProductInput - Input type.
 * - CategorizeProductOutput - Output type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CategorizeProductInputSchema = z.object({
  productName: z.string(),
  ingredients: z.string().optional(),
});
export type CategorizeProductInput = z.infer<typeof CategorizeProductInputSchema>;

const CategorizeProductOutputSchema = z.object({
  category: z.string().describe("A single, general food category like 'Snacks', 'Beverages', 'Dairy', 'Bakery', 'Canned Goods', 'Produce', 'Meat & Seafood', 'Frozen Foods', 'Condiments & Sauces', or 'Other'."),
});
export type CategorizeProductOutput = z.infer<typeof CategorizeProductOutputSchema>;

const categorizeProductPrompt = ai.definePrompt({
  name: 'categorizeProductPrompt',
  input: { schema: CategorizeProductInputSchema },
  output: { schema: CategorizeProductOutputSchema },
  prompt: `You are an expert product categorizer for a grocery app. Based on the product name and ingredients, assign the most appropriate, single, general food category.
          
Product Name: {{{productName}}}
Ingredients: {{{ingredients}}}

Choose one from this list: 'Snacks', 'Beverages', 'Dairy', 'Bakery', 'Canned Goods', 'Produce', 'Meat & Seafood', 'Frozen Foods', 'Condiments & Sauces', 'Breakfast', 'Pasta & Grains', 'Other'.
          
If you are unsure, assign 'Other'. Your response must be in the specified JSON format.
`,
});

const categorizeProductFlow = ai.defineFlow(
  {
    name: 'categorizeProductFlow',
    inputSchema: CategorizeProductInputSchema,
    outputSchema: CategorizeProductOutputSchema,
  },
  async (input) => {
    const { output } = await categorizeProductPrompt(input);
    if (!output) {
      return { category: 'Other' };
    }
    return output;
  }
);

export async function categorizeProduct(input: CategorizeProductInput): Promise<CategorizeProductOutput> {
  return categorizeProductFlow(input);
}

'use server';
/**
 * @fileOverview A multilingual chatbot assistant for product nutrition. It answers user questions about product data
 * in English, Hindi, Marathi, or Hinglish.
 *
 * - multilingualProductChatbot - A function that handles the multilingual product chat.
 * - MultilingualProductChatbotInput - The input type for the multilingualProductChatbot function.
 * - MultilingualProductChatbotOutput - The return type for the multilingualProductChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MultilingualProductChatbotInputSchema = z.object({
  productData: z
    .string()
    .describe('Detailed product information, typically fetched from an API like OpenFoodFacts.'),
  userQuestion: z.string().describe('The user\u0027s question about the product.'),
  language: z
    .enum(['English', 'Hindi', 'Marathi', 'Hinglish'])
    .describe('The preferred language for the chatbot response.'),
});
export type MultilingualProductChatbotInput = z.infer<
  typeof MultilingualProductChatbotInputSchema
>;

const MultilingualProductChatbotOutputSchema = z.object({
  answer: z
    .string()
    .describe("The chatbot's answer to the user's question in the specified language."),
});
export type MultilingualProductChatbotOutput = z.infer<
  typeof MultilingualProductChatbotOutputSchema
>;

export async function multilingualProductChatbot(
  input: MultilingualProductChatbotInput
): Promise<MultilingualProductChatbotOutput> {
  return multilingualProductChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'multilingualProductChatbotPrompt',
  input: {schema: MultilingualProductChatbotInputSchema},
  output: {schema: MultilingualProductChatbotOutputSchema},
  prompt: `You are a helpful nutrition assistant chatbot. Based on the provided product information,
answer the user's question. Respond concisely and in the specified language. Do not provide medical advice.

Product Information:
{{{productData}}}

User's Question:
{{{userQuestion}}}

Respond in {{{language}}}.`,
});

const multilingualProductChatbotFlow = ai.defineFlow(
  {
    name: 'multilingualProductChatbotFlow',
    inputSchema: MultilingualProductChatbotInputSchema,
    outputSchema: MultilingualProductChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';
/**
 * @fileOverview A Genkit flow for analyzing food images using Gemini 1.5 Flash.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ImageAnalysisOutputSchema, UserPreferencesSchema, LanguageSchema } from '@/lib/types';

const ImageAnalysisInputSchema = z.object({
  imageDataUri: z.string().describe("Photo of food as data URI."),
  language: LanguageSchema.describe("Response language."),
  userPreferences: UserPreferencesSchema.optional(),
});
export type ImageAnalysisInput = z.infer<typeof ImageAnalysisInputSchema>;

const analyzeFoodImagePrompt = ai.definePrompt({
  name: 'analyzeFoodImagePrompt_v3',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: ImageAnalysisInputSchema },
  output: { schema: ImageAnalysisOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `Analyze the provided food image. Identify the meal and estimate its nutritional profile.

User Preferences:
- Goal: {{{userPreferences.healthGoal}}}
- Diet: {{{userPreferences.diet}}}

Instructions:
1. Return identifying info, healthScore (0-100), and nutrition estimates.
2. In 'futureOutlook', explain the long-term health impact of eating this specific meal regularly.
3. Language of response: {{{language}}}.

Photo: {{media url=imageDataUri}}`,
});

const analyzeFoodImageFlow = ai.defineFlow(
  {
    name: 'analyzeFoodImageFlow',
    inputSchema: ImageAnalysisInputSchema,
    outputSchema: ImageAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeFoodImagePrompt(input);
    if (!output) throw new Error('AI Vision failed to analyze image.');
    return output;
  }
);

export async function analyzeFoodImage(input: ImageAnalysisInput) {
  return analyzeFoodImageFlow(input);
}

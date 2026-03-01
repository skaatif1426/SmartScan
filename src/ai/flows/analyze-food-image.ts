'use server';
/**
 * @fileOverview A Genkit flow for analyzing food images to provide nutritional insights.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ImageAnalysisOutputSchema, UserPreferencesSchema, LanguageSchema } from '@/lib/types';

const ImageAnalysisInputSchema = z.object({
  imageDataUri: z.string().describe("Photo of food as data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  language: LanguageSchema.describe("Response language."),
  userPreferences: UserPreferencesSchema.optional(),
});
export type ImageAnalysisInput = z.infer<typeof ImageAnalysisInputSchema>;

const analyzeFoodImagePrompt = ai.definePrompt({
  name: 'analyzeFoodImagePrompt_v1',
  input: { schema: ImageAnalysisInputSchema },
  output: { schema: ImageAnalysisOutputSchema },
  prompt: `You are an expert AI food analyst. Analyze the provided image of food and provide a detailed nutritional breakdown.

User Preferences:
- Goal: {{{userPreferences.healthGoal}}}
- Diet: {{{userPreferences.diet}}}
- Allergies: {{{userPreferences.allergies}}}
- Focus: {{{userPreferences.healthFocus}}}

Instructions:
1. Identify the food name.
2. Estimate nutritional values per a standard serving size.
3. Provide a healthScore (0-100) based on nutritional quality.
4. Language of response MUST be: {{{language}}}.
5. If identification is difficult, set confidence to 'Low'.

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
    if (!output) throw new Error('AI failed to analyze the image.');
    return output;
  }
);

export async function analyzeFoodImage(input: ImageAnalysisInput) {
  return analyzeFoodImageFlow(input);
}
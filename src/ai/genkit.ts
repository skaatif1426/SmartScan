/**
 * @fileoverview AI Provider Abstraction Layer.
 *
 * This file initializes and configures the Genkit AI instance.
 * Using Gemini 1.5 Flash for better performance and reliability.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY,
    }),
  ],
  // Default model for all prompts
  model: 'googleai/gemini-1.5-flash',
});

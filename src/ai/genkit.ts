/**
 * @fileoverview AI Provider Abstraction Layer.
 *
 * This file initializes and configures the Genkit AI instance.
 * Using Gemini 1.5 Flash for better performance and reliability.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY || 
               process.env.GOOGLE_API_KEY || 
               process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.warn('AI_WARNING: No Google AI API key found in environment variables. AI features will fail.');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  // Default model for all prompts - using stable 1.5 flash
  model: 'googleai/gemini-1.5-flash',
});

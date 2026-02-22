/**
 * @fileoverview AI Provider Abstraction Layer.
 *
 * This file initializes and configures the Genkit AI instance, serving as a
 * centralized provider for different AI models. By abstracting the model
 * initialization here, the rest of the application can remain model-agnostic.
 *
 * To switch models (e.g., from Google AI to OpenAI), you would:
 * 1. Add the appropriate plugin package (e.g., `@genkit-ai/openai`).
 * 2. Import the plugin.
 * 3. Instantiate and include the new plugin in the `plugins` array.
 * 4. Update the `model` property to reference the new model name.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
// import { openAI } from '@genkit-ai/openai'; // Example for OpenAI

export const ai = genkit({
  plugins: [
    googleAI(),
    // openAI({ apiKey: process.env.OPENAI_API_KEY }), // Example
  ],
  // The default model can be switched easily.
  // Make sure the model name corresponds to one provided by your plugins.
  model: 'googleai/gemini-1.5-pro-latest',
  // model: 'openai/gpt-4o', // Example
});

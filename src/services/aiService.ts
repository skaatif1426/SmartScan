/**
 * @fileOverview Service layer for AI insights.
 * Encapsulates Genkit flows with a readiness for future API migration.
 */

import { generateNutritionInsights } from '@/ai/flows/ai-nutrition-insights';
import { multilingualProductChatbot } from '@/ai/flows/multilingual-product-chatbot';
import { generateEstimateFromBarcode } from '@/ai/flows/estimate-from-barcode';
import { analyzeFoodImage } from '@/ai/flows/analyze-food-image';
import { categorizeProduct } from '@/ai/flows/categorize-product';
import apiClient from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

export const aiService = {
  /**
   * Generates nutritional insights.
   * Can be switched to a backend call easily by uncommenting the API line.
   */
  async getNutritionInsight(input: any) {
    try {
      // Future: return await apiClient.post(ENDPOINTS.AI.INSIGHTS, input);
      return await generateNutritionInsights(input);
    } catch (error) {
      console.error('AI Insight Flow Error:', error);
      return null;
    }
  },

  /**
   * Chatbot interface.
   */
  async getChatResponse(input: any): Promise<string> {
    try {
      const response = await multilingualProductChatbot(input);
      return response.answer;
    } catch (error) {
      return 'I am currently unable to process your question.';
    }
  },

  /**
   * AI Estimation for missing products.
   */
  async getBarcodeEstimate(input: any) {
    try {
      return await generateEstimateFromBarcode(input);
    } catch (error) {
      return null;
    }
  },

  /**
   * Vision analysis.
   */
  async getImageAnalysis(input: any) {
    try {
      return await analyzeFoodImage(input);
    } catch (error) {
      return null;
    }
  },

  /**
   * Category classification.
   */
  async getAICategory(input: any) {
    try {
      const result = await categorizeProduct(input);
      return result.category;
    } catch (error) {
      return 'Other';
    }
  }
};

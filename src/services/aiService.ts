/**
 * @fileOverview Service layer for AI-driven insights and analysis.
 * Wraps Genkit flows to allow easy migration to backend endpoints.
 */

import { generateNutritionInsights } from '@/ai/flows/ai-nutrition-insights';
import { multilingualProductChatbot } from '@/ai/flows/multilingual-product-chatbot';
import { generateEstimateFromBarcode } from '@/ai/flows/estimate-from-barcode';
import { analyzeFoodImage } from '@/ai/flows/analyze-food-image';
import { categorizeProduct } from '@/ai/flows/categorize-product';
import apiClient from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

export const aiService = {
  async getNutritionInsight(input: any) {
    try {
      // Future integration: return await apiClient.post(ENDPOINTS.AI.INSIGHTS, input);
      return await generateNutritionInsights(input);
    } catch (error) {
      return await generateNutritionInsights(input);
    }
  },

  async getChatResponse(input: any) {
    try {
      const response = await multilingualProductChatbot(input);
      return response.answer;
    } catch (error) {
      throw error;
    }
  },

  async getBarcodeEstimate(input: any) {
    try {
      return await generateEstimateFromBarcode(input);
    } catch (error) {
      throw error;
    }
  },

  async getImageAnalysis(input: any) {
    try {
      return await analyzeFoodImage(input);
    } catch (error) {
      throw error;
    }
  },

  async getAICategory(input: any) {
    try {
      const result = await categorizeProduct(input);
      return result.category;
    } catch (error) {
      return 'Other';
    }
  }
};

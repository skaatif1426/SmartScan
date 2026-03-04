/**
 * @fileOverview Service layer for AI insights.
 * Aligned with Backend AI APIs Contract.
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
   * Aligned with POST /api/v1/ai/chat
   */
  async getChatResponse(input: any): Promise<string> {
    try {
      // Logic: return await apiClient.post(ENDPOINTS.AI.CHAT, { message: input.userQuestion, language: input.language });
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
   * Aligned with POST /api/v1/ai/analyze-image (Multipart)
   */
  async getImageAnalysis(input: any) {
    try {
      // Mocking backend Multipart flow if needed
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

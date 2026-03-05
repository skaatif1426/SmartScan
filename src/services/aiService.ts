
/**
 * @fileOverview Service layer for AI insights.
 * Aligned with Backend AI APIs Contract.
 */

import { generateNutritionInsights } from '@/ai/flows/ai-nutrition-insights';
import { multilingualProductChatbot } from '@/ai/flows/multilingual-product-chatbot';
import { generateEstimateFromBarcode } from '@/ai/flows/estimate-from-barcode';
import { analyzeFoodImage } from '@/ai/flows/analyze-food-image';
import { categorizeProduct } from '@/ai/flows/categorize-product';

export const aiService = {
  /**
   * Generates nutritional insights.
   */
  async getNutritionInsight(input: any) {
    try {
      return await generateNutritionInsights(input);
    } catch (error) {
      console.error('[AI Service] Nutrition Insight Error:', error);
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
      console.error('[AI Service] Chatbot Error:', error);
      return 'I am currently unable to process your question. Please check API settings.';
    }
  },

  /**
   * AI Estimation for missing products.
   */
  async getBarcodeEstimate(input: any) {
    try {
      return await generateEstimateFromBarcode(input);
    } catch (error) {
      console.error('[AI Service] Barcode Estimate Error:', error);
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
      console.error('[AI Service] Image Analysis Error:', error);
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
      console.error('[AI Service] Categorization Error:', error);
      return 'Other';
    }
  }
};

/**
 * @fileOverview Service layer for AI insights with robust error tracing.
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
      console.log('[AI Service] Calling generateNutritionInsights...');
      const result = await generateNutritionInsights(input);
      return result;
    } catch (error: any) {
      console.error('[AI Service] Nutrition Insight Error Details:', error?.message || error);
      if (error?.stack) console.error(error.stack);
      return null;
    }
  },

  /**
   * Chatbot interface.
   */
  async getChatResponse(input: any): Promise<string> {
    try {
      console.log('[AI Service] Calling chatbot flow...');
      const response = await multilingualProductChatbot(input);
      return response.answer;
    } catch (error: any) {
      console.error('[AI Service] Chatbot Error Details:', error?.message || error);
      return 'I am currently unable to process your question. Please check API settings.';
    }
  },

  /**
   * AI Estimation for missing products.
   */
  async getBarcodeEstimate(input: any) {
    try {
      console.log('[AI Service] Calling barcode estimate flow...');
      return await generateEstimateFromBarcode(input);
    } catch (error: any) {
      console.error('[AI Service] Barcode Estimate Error:', error?.message || error);
      return null;
    }
  },

  /**
   * Vision analysis.
   */
  async getImageAnalysis(input: any) {
    try {
      console.log('[AI Service] Calling vision analysis flow...');
      return await analyzeFoodImage(input);
    } catch (error: any) {
      console.error('[AI Service] Image Analysis Error:', error?.message || error);
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
    } catch (error: any) {
      console.error('[AI Service] Categorization Error:', error?.message || error);
      return 'Other';
    }
  }
};

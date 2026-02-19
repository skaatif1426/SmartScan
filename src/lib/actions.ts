'use server';

import { generateNutritionInsights, NutritionInsightInput } from '@/ai/flows/ai-nutrition-insights';
import { multilingualProductChatbot, MultilingualProductChatbotInput } from '@/ai/flows/multilingual-product-chatbot';
import { fetchProductFromApi } from './openfoodfacts-api';
import { Product, NutritionInsightOutput } from './types';
import { sanitizeInput } from '@/ai/prompt-firewall';

export async function getProduct(barcode: string): Promise<Product | null> {
  try {
    const product = await fetchProductFromApi(barcode);
    return product;
  } catch (error: unknown) {
    console.error(JSON.stringify({
        level: 'error',
        action: 'getProduct',
        message: 'Failed to fetch product from API',
        barcode,
        error: error instanceof Error ? error.message : String(error),
    }, null, 2));
    return null;
  }
}

export async function getAINutritionInsight(productData: NutritionInsightInput): Promise<NutritionInsightOutput | null> {
  try {
    const insight = await generateNutritionInsights(productData);
    return insight;
  } catch (error: unknown) {
    console.error(JSON.stringify({
        level: 'error',
        action: 'getAINutritionInsight',
        message: 'AI insight generation failed',
        productName: productData.productName,
        error: error instanceof Error ? error.message : String(error),
    }, null, 2));
    return null;
  }
}

export async function getAIChatResponse(chatData: MultilingualProductChatbotInput): Promise<string> {
  try {
    const sanitizedInput = {
      ...chatData,
      userQuestion: sanitizeInput(chatData.userQuestion),
    };
    const response = await multilingualProductChatbot(sanitizedInput);
    return response.answer;
  } catch (error: unknown) {
    console.error(JSON.stringify({
        level: 'error',
        action: 'getAIChatResponse',
        message: 'AI chat response failed',
        userQuestion: chatData.userQuestion,
        language: chatData.language,
        error: error instanceof Error ? error.message : String(error),
    }, null, 2));
     if (error instanceof Error && error.message.includes('malicious')) {
        return "Your question seems to contain inappropriate content. Please rephrase.";
    }
    return 'I am unable to respond at this moment.';
  }
}

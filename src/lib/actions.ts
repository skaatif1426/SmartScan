'use server';

import { generateNutritionInsights, NutritionInsightInput } from '@/ai/flows/ai-nutrition-insights';
import { multilingualProductChatbot, MultilingualProductChatbotInput } from '@/ai/flows/multilingual-product-chatbot';
import { fetchProductFromApi } from './openfoodfacts-api';

export async function getProduct(barcode: string) {
  try {
    const product = await fetchProductFromApi(barcode);
    return product;
  } catch (error) {
    console.error('Action error: getProduct', error);
    return null;
  }
}

export async function getAINutritionInsight(productData: NutritionInsightInput) {
  try {
    const insight = await generateNutritionInsights(productData);
    return insight.insight;
  } catch (error) {
    console.error('Action error: getAINutritionInsight', error);
    return 'Could not generate insight at this time.';
  }
}

export async function getAIChatResponse(chatData: MultilingualProductChatbotInput) {
  try {
    const response = await multilingualProductChatbot(chatData);
    return response.answer;
  } catch (error) {
    console.error('Action error: getAIChatResponse', error);
    return 'I am unable to respond at this moment.';
  }
}

'use server';

import { generateNutritionInsights, NutritionInsightInput } from '@/ai/flows/ai-nutrition-insights';
import { multilingualProductChatbot, MultilingualProductChatbotInput } from '@/ai/flows/multilingual-product-chatbot';
import { generateEstimateFromBarcode } from '@/ai/flows/estimate-from-barcode';
import { fetchProductFromApi } from './openfoodfacts-api';
import { Product, NutritionInsightOutput } from './types';
import { sanitizeInput } from '@/ai/prompt-firewall';

type GetProductResult = { status: 'success', product: Product | null } | { status: 'error' };

export async function getProduct(barcode: string): Promise<GetProductResult> {
  try {
    const product = await fetchProductFromApi(barcode);
    return { status: 'success', product: product };
  } catch (error: unknown) {
    console.error(JSON.stringify({
        level: 'error',
        action: 'getProduct',
        message: 'Failed to fetch product from API',
        barcode,
        error: error instanceof Error ? error.message : String(error),
    }, null, 2));
    return { status: 'error' };
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

export async function getAIEstimate(barcode: string): Promise<NutritionInsightOutput | null> {
    try {
        const insight = await generateEstimateFromBarcode({ barcode });
        return insight;
    } catch (error: unknown) {
        console.error(JSON.stringify({
            level: 'error',
            action: 'getAIEstimate',
            message: 'AI estimate generation failed',
            barcode,
            error: error instanceof Error ? error.message : String(error),
        }, null, 2));
        return null;
    }
}

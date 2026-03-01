'use server';

import { generateNutritionInsights, NutritionInsightInput } from '@/ai/flows/ai-nutrition-insights';
import { multilingualProductChatbot, MultilingualProductChatbotInput } from '@/ai/flows/multilingual-product-chatbot';
import { generateEstimateFromBarcode, EstimateInput } from '@/ai/flows/estimate-from-barcode';
import { categorizeProduct, CategorizeProductInput } from '@/ai/flows/categorize-product';
import { analyzeFoodImage, ImageAnalysisInput } from '@/ai/flows/analyze-food-image';
import { fetchProductFromApi } from './openfoodfacts-api';
import { Product, NutritionInsightOutput, Language, ImageAnalysisOutput } from './types';
import { sanitizeInput } from '@/ai/prompt-firewall';

type GetProductResult = { status: 'success', product: Product | null } | { status: 'error' };

export async function getProduct(barcode: string): Promise<GetProductResult> {
  try {
    const product = await fetchProductFromApi(barcode);
    return { status: 'success', product: product };
  } catch (error: unknown) {
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
    } else {
        console.error(JSON.stringify({
            level: 'error',
            action: 'getProduct',
            message: 'Failed to fetch product from API',
            barcode,
            error: error instanceof Error ? error.message : String(error),
        }, null, 2));
    }
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

export async function getAIEstimate(input: EstimateInput): Promise<NutritionInsightOutput | null> {
    try {
        const insight = await generateEstimateFromBarcode(input);
        return insight;
    } catch (error: unknown) {
        console.error(JSON.stringify({
            level: 'error',
            action: 'getAIEstimate',
            message: 'AI estimate generation failed',
            barcode: input.barcode,
            error: error instanceof Error ? error.message : String(error),
        }, null, 2));
        return null;
    }
}

export async function getAICategory(input: CategorizeProductInput): Promise<string> {
  try {
    const result = await categorizeProduct(input);
    return result.category;
  } catch (error: unknown) {
    console.error(JSON.stringify({
        level: 'error',
        action: 'getAICategory',
        message: 'AI category generation failed',
        productName: input.productName,
        error: error instanceof Error ? error.message : String(error),
    }, null, 2));
    return 'Other';
  }
}

export async function getFoodImageAnalysis(input: ImageAnalysisInput): Promise<ImageAnalysisOutput | null> {
  try {
    const result = await analyzeFoodImage(input);
    return result;
  } catch (error: unknown) {
    console.error(JSON.stringify({
        level: 'error',
        action: 'getFoodImageAnalysis',
        message: 'AI image analysis failed',
        error: error instanceof Error ? error.message : String(error),
    }, null, 2));
    return null;
  }
}
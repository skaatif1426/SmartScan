/**
 * @fileOverview Next.js Server Actions.
 * These actions now delegate logic to the service layer for enterprise cleanliness.
 */
'use server';

import { productService } from '@/services/productService';
import { aiService } from '@/services/aiService';
import { Product, NutritionInsightOutput, ImageAnalysisOutput } from './types';
import { sanitizeInput } from '@/ai/prompt-firewall';
import { NutritionInsightInput } from '@/ai/flows/ai-nutrition-insights';
import { MultilingualProductChatbotInput } from '@/ai/flows/multilingual-product-chatbot';
import { EstimateInput } from '@/ai/flows/estimate-from-barcode';
import { CategorizeProductInput } from '@/ai/flows/categorize-product';
import { ImageAnalysisInput } from '@/ai/flows/analyze-food-image';

type GetProductResult = { status: 'success', product: Product | null } | { status: 'error' };

export async function getProduct(barcode: string): Promise<GetProductResult> {
  try {
    const product = await productService.getProductByBarcode(barcode);
    return { status: 'success', product };
  } catch (error: any) {
    return { status: 'error' };
  }
}

export async function getAINutritionInsight(productData: NutritionInsightInput): Promise<NutritionInsightOutput | null> {
  try {
    return await aiService.getNutritionInsight(productData);
  } catch (error: any) {
    return null;
  }
}

export async function getAIChatResponse(chatData: MultilingualProductChatbotInput): Promise<string> {
  try {
    const sanitizedInput = {
      ...chatData,
      userQuestion: sanitizeInput(chatData.userQuestion),
    };
    return await aiService.getChatResponse(sanitizedInput);
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('malicious')) {
        return "Your question seems to contain inappropriate content. Please rephrase.";
    }
    return 'I am unable to respond at this moment.';
  }
}

export async function getAIEstimate(input: EstimateInput): Promise<NutritionInsightOutput | null> {
    try {
        return await aiService.getBarcodeEstimate(input);
    } catch (error: any) {
        return null;
    }
}

export async function getAICategory(input: CategorizeProductInput): Promise<string> {
  try {
    return await aiService.getAICategory(input);
  } catch (error: any) {
    return 'Other';
  }
}

export async function getFoodImageAnalysis(input: ImageAnalysisInput): Promise<ImageAnalysisOutput | null> {
  try {
    return await aiService.getImageAnalysis(input);
  } catch (error: any) {
    return null;
  }
}

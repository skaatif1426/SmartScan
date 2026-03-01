'use client';
import { config } from 'dotenv';
config();

import '@/ai/flows/multilingual-product-chatbot.ts';
import '@/ai/flows/ai-nutrition-insights.ts';
import '@/ai/flows/estimate-from-barcode.ts';
import '@/ai/flows/categorize-product.ts';
import '@/ai/flows/analyze-food-image.ts';
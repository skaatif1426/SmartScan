'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Sparkles, RefreshCcw } from 'lucide-react';
import { getAINutritionInsight } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { Product, NutritionInsightOutput, UserSettings } from '@/lib/types';
import { useLanguage, usePreferences } from '@/contexts/AppProviders';
import { useAiUsage } from '@/hooks/useAiUsage';
import { useAnalytics } from '@/hooks/useAnalytics';
import AnalysisDisplay from './AnalysisDisplay';
import type { LocalAnalysis } from '@/lib/scoring';

const CACHE_KEY = 'nutriscan-ai-cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheItem {
  timestamp: number;
  data: NutritionInsightOutput;
}

function getCacheKey(barcode: string, language: string, preferences: Partial<Omit<UserSettings, 'language'>>): string {
    const prefsString = `${preferences.isVeg}-${preferences.isNonVeg}-${preferences.allergies?.join(',')}`;
    return `${barcode}-${language}-${prefsString}`;
}

export default function NutritionInsight({ product, barcode, localAnalysis }: { product: Product['product'], barcode: string, localAnalysis: LocalAnalysis }) {
  const [aiInsight, setAiInsight] = useState<NutritionInsightOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);
  const { language, t } = useLanguage();
  const { preferences } = usePreferences();
  const { incrementAiCallCount } = useAiUsage();
  const { trackError } = useAnalytics();

  const fetchInsight = useCallback(async (forceRefresh = false) => {
    if (!preferences.aiInsightsEnabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setAiError(null);
    
    if (!forceRefresh) {
        const cacheKey = getCacheKey(barcode, language, preferences);
        try {
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) {
              const cache: { [key: string]: CacheItem } = JSON.parse(cached);
              const item = cache[cacheKey];
              if (item && (Date.now() - item.timestamp < CACHE_TTL)) {
                  setAiInsight(item.data);
                  setIsLoading(false);
                  return;
              }
          }
        } catch (e) {
            console.warn("Failed to read AI cache", e);
        }
    }


    try {
      incrementAiCallCount();
      const insightData = {
        productName: product.product_name,
        ingredientsText: product.ingredients_text_with_allergens,
        nutriscoreGrade: product.nutriscore_grade,
        novaGroup: product.nova_group,
        allergens: product.allergens_tags,
        nutritionFacts: {
          energy_kcal_100g: product.nutriments?.['energy-kcal_100g'],
          fat_100g: product.nutriments?.fat_100g,
          saturated_fat_100g: product.nutriments?.['saturated-fat_100g'],
          carbohydrates_100g: product.nutriments?.carbohydrates_100g,
          sugars_100g: product.nutriments?.sugars_100g,
          proteins_100g: product.nutriments?.proteins_100g,
          salt_100g: product.nutriments?.salt_100g,
        },
        healthScore: localAnalysis.score,
        warnings: localAnalysis.warnings,
      };
      const result = await getAINutritionInsight(insightData);
      
      if (result) {
        setAiInsight(result);
        const cacheKey = getCacheKey(barcode, language, preferences);
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            const cache = cached ? JSON.parse(cached) : {};
            cache[cacheKey] = { timestamp: Date.now(), data: result };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        } catch (e) {
            console.warn("Failed to write to AI cache", e);
        }
      } else {
        trackError();
        setAiError(t('generatingInsightError'));
      }
    } catch (e) {
        trackError();
        console.error("AI Insight fetch failed", e);
        setAiError(t('generatingInsightError'));
    } finally {
      setIsLoading(false);
    }
  }, [product, barcode, language, preferences, t, incrementAiCallCount, trackError, localAnalysis]);


  useEffect(() => {
    fetchInsight();
  }, [fetchInsight]);
  
  if (!preferences.aiInsightsEnabled) {
      return (
          <div className='min-h-[210px]'>
              <AnalysisDisplay title="Nutritional Score" score={localAnalysis.score} risks={localAnalysis.warnings} isLocal={true}/>
          </div>
      );
  }


  return (
    <div className='min-h-[210px]'>
        {isLoading ? (
            <div>
                <AnalysisDisplay title="Nutritional Score" score={localAnalysis.score} risks={localAnalysis.warnings} isLocal={true} />
                <div className="mt-4 space-y-2 animate-pulse">
                    <div className="flex items-center gap-2 text-primary text-sm font-medium">
                        <Sparkles className="h-4 w-4" />
                        <p>Generating AI explanation...</p>
                    </div>
                </div>
            </div>
        ) : aiInsight ? (
            <AnalysisDisplay 
                title="AI Health Score"
                score={aiInsight.healthScore}
                summary={aiInsight.summary}
                recommendation={aiInsight.recommendation}
                risks={aiInsight.risks}
            />
        ) : (
            <>
                <AnalysisDisplay title="Nutritional Score" score={localAnalysis.score} risks={localAnalysis.warnings} isLocal={true}/>
                {aiError && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>AI Analysis Unavailable</AlertTitle>
                        <AlertDescription>
                            An error occurred while fetching the AI insight. Showing local analysis.
                        </AlertDescription>
                        <Button variant="destructive" size="sm" onClick={() => fetchInsight(true)} className="mt-2 gap-2">
                           <RefreshCcw size={14} /> Retry AI Analysis
                        </Button>
                    </Alert>
                )}
            </>
        )}
    </div>
  );
}

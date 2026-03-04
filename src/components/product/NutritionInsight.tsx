'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCcw } from 'lucide-react';
import { getAINutritionInsight } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import type { UnifiedProduct, NutritionInsightOutput, UserPreferences } from '@/lib/types';
import { useLanguage, usePreferences } from '@/contexts/AppProviders';
import { useAiUsage } from '@/hooks/useAiUsage';
import { useAnalytics } from '@/hooks/useAnalytics';
import AnalysisDisplay from './AnalysisDisplay';
import type { LocalAnalysis } from '@/lib/scoring';
import type { NutritionInsightInput } from '@/ai/flows/ai-nutrition-insights';

const CACHE_KEY = 'smartscan-ai-cache';
const CACHE_TTL = 24 * 60 * 60 * 1000;

interface CacheItem {
  timestamp: number;
  data: NutritionInsightOutput;
}

function getCacheKey(barcode: string, language: string, preferences: UserPreferences): string {
    const prefsString = `${preferences.diet}-${preferences.allergies?.join(',')}-${preferences.healthGoal}-${preferences.aiVerbosity}-${preferences.healthFocus.join(',')}-${preferences.strictMode}`;
    return `${barcode}-${language}-${prefsString}`;
}

export default function NutritionInsight({ product, barcode, localAnalysis }: { product: UnifiedProduct, barcode: string, localAnalysis: LocalAnalysis }) {
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

    const userPrefs: UserPreferences = {
      diet: preferences.diet,
      allergies: preferences.allergies,
      healthGoal: preferences.healthGoal,
      healthFocus: preferences.healthFocus,
      aiVerbosity: preferences.aiVerbosity,
      strictMode: preferences.strictMode,
    };
    
    if (!forceRefresh) {
        const cacheKey = getCacheKey(barcode, language, userPrefs);
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
            console.warn("Cache read failed", e);
        }
    }

    try {
      incrementAiCallCount();
      const insightData: NutritionInsightInput = {
        productName: product.name,
        ingredientsText: product.ingredients.join(', '),
        nutriscoreGrade: product.nutriscoreGrade,
        novaGroup: product.novaGroup,
        allergens: product.allergens,
        nutritionFacts: {
          energy_kcal_100g: product.nutriments.calories,
          fat_100g: product.nutriments.fat,
          saturated_fat_100g: product.nutriments.saturatedFat,
          carbohydrates_100g: product.nutriments.carbs,
          sugars_100g: product.nutriments.sugar,
          proteins_100g: product.nutriments.protein,
          salt_100g: product.nutriments.salt,
        },
        healthScore: localAnalysis.score,
        warnings: localAnalysis.warnings,
        userPreferences: userPrefs,
        language: language,
      };
      const result = await getAINutritionInsight(insightData);
      
      if (result) {
        setAiInsight(result);
        const cacheKey = getCacheKey(barcode, language, userPrefs);
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            const cache = cached ? JSON.parse(cached) : {};
            cache[cacheKey] = { timestamp: Date.now(), data: result };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        } catch (e) {
            console.warn("Cache write failed", e);
        }
      } else {
        trackError();
        setAiError(t('generatingInsightError'));
      }
    } catch (e) {
        trackError();
        setAiError(t('generatingInsightError'));
    } finally {
      setIsLoading(false);
    }
  }, [product, barcode, language, preferences, t, incrementAiCallCount, trackError, localAnalysis]);

  useEffect(() => {
    fetchInsight();
  }, [fetchInsight]);
  
  const nutritionGrid = {
    calories: product.nutriments.calories || 0,
    sugar: product.nutriments.sugar || 0,
    fat: product.nutriments.fat || 0,
    protein: product.nutriments.protein || 0,
  };

  return (
    <div className='min-h-[400px]'>
        {isLoading ? (
            <div className="space-y-12">
                <div className="p-8 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center gap-6 animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black">{t('analysisInProgress')}</h3>
                        <p className="text-muted-foreground font-bold">Generating personalized health insights.</p>
                    </div>
                </div>
                <AnalysisDisplay 
                    title="Quick Score" 
                    score={localAnalysis.score} 
                    risks={localAnalysis.warnings} 
                    isLocal={true} 
                    nutrition={nutritionGrid}
                />
            </div>
        ) : aiInsight ? (
            <AnalysisDisplay 
                title="AI Health Profile"
                score={aiInsight.healthScore}
                summary={aiInsight.summary}
                recommendation={aiInsight.recommendation}
                risks={aiInsight.risks}
                nutrition={nutritionGrid}
            />
        ) : (
            <div className="space-y-6">
                <AnalysisDisplay 
                    title="Nutritional Score" 
                    score={localAnalysis.score} 
                    risks={localAnalysis.warnings} 
                    isLocal={true} 
                    nutrition={nutritionGrid}
                />
                {aiError && (
                    <div className="p-6 rounded-2xl border-2 border-destructive/20 bg-destructive/5 space-y-3">
                        <p className="text-sm font-bold text-destructive">AI Analysis temporarily unavailable.</p>
                        <Button variant="outline" size="sm" onClick={() => fetchInsight(true)} className="rounded-full gap-2 border-2 active:scale-95">
                           <RefreshCcw size={14} /> Retry Intelligence Flow
                        </Button>
                    </div>
                )}
            </div>
        )}
    </div>
  );
}

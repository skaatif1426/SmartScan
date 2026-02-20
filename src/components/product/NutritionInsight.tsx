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

const CACHE_KEY = 'nutriscan-ai-cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheItem {
  timestamp: number;
  data: NutritionInsightOutput;
}

interface LocalAnalysis {
    score: number;
    warnings: string[];
}

function getCacheKey(barcode: string, language: string, preferences: Partial<Omit<UserSettings, 'language'>>): string {
    const prefsString = `${preferences.isVeg}-${preferences.isNonVeg}-${preferences.allergies?.join(',')}`;
    return `${barcode}-${language}-${prefsString}`;
}

function calculateLocalAnalysis(product: Product['product']): LocalAnalysis {
    let score = 100;
    const warnings: { reason: string, impact: number }[] = [];
    const nutriments = product.nutriments || {};

    const HIGH_SUGAR_THRESHOLD = 22.5;
    const HIGH_SALT_THRESHOLD = 1.5;
    const HIGH_SATFAT_THRESHOLD = 5;

    if (nutriments.sugars_100g !== undefined) {
      if (nutriments.sugars_100g >= HIGH_SUGAR_THRESHOLD) {
        warnings.push({ reason: 'High in sugar', impact: -25 });
        score -= 25;
      } else if (nutriments.sugars_100g > 10) {
        score -= 10;
      }
    }

    if (nutriments.salt_100g !== undefined) {
        if (nutriments.salt_100g >= HIGH_SALT_THRESHOLD) {
            warnings.push({ reason: 'High in salt', impact: -25 });
            score -= 25;
        } else if (nutriments.salt_100g > 0.3) {
            score -= 10;
        }
    }

    if (nutriments['saturated-fat_100g'] !== undefined) {
        if (nutriments['saturated-fat_100g'] >= HIGH_SATFAT_THRESHOLD) {
            warnings.push({ reason: 'High in saturated fat', impact: -20 });
            score -= 20;
        } else if (nutriments['saturated-fat_100g'] > 1.5) {
            score -= 10;
        }
    }
    
    if (product.nova_group) {
      if (product.nova_group === 4) {
        warnings.push({ reason: 'Ultra-processed food (NOVA 4)', impact: -20 });
        score -= 20;
      } else if (product.nova_group === 3) {
        warnings.push({ reason: 'Processed food (NOVA 3)', impact: -10 });
        score -= 10;
      }
    }

    const finalScore = Math.max(0, Math.min(100, Math.round(score)));
    return { score: finalScore, warnings: warnings.map(w => w.reason) };
}

export default function NutritionInsight({ product, barcode }: { product: Product['product'], barcode: string }) {
  const [localAnalysis, setLocalAnalysis] = useState<LocalAnalysis | null>(null);
  const [aiInsight, setAiInsight] = useState<NutritionInsightOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);
  const { language, t } = useLanguage();
  const { preferences } = usePreferences();
  const { incrementAiCallCount } = useAiUsage();
  const { trackError } = useAnalytics();

  const fetchInsight = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setAiError(null);
    
    if (!localAnalysis) {
        const local = calculateLocalAnalysis(product);
        setLocalAnalysis(local);
    }
    
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
          throw new Error("AI response was empty.");
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

  // Initial loading state before local analysis
  if (!localAnalysis) {
    return <div className='space-y-4 min-h-[210px]'>
        <Skeleton className="h-4 w-1/3 mb-1" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-4 w-1/4 mt-3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-10 w-full mt-2" />
    </div>;
  }

  return (
    <div className='min-h-[210px]'>
        {isLoading ? (
            <div>
                <AnalysisDisplay title="Initial Score" score={localAnalysis.score} risks={localAnalysis.warnings} isLocal={true} />
                <div className="mt-4 space-y-2 animate-pulse">
                    <div className="flex items-center gap-2 text-primary text-sm font-medium">
                        <Sparkles className="h-4 w-4" />
                        <p>Refining analysis with AI...</p>
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

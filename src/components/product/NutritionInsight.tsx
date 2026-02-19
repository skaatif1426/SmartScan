'use client';

import { useState, useEffect } from 'react';
import { getAINutritionInsight } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import type { Product, NutritionInsightOutput, UserSettings } from '@/lib/types';
import { useLanguage, usePreferences } from '@/contexts/AppProviders';

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

export default function NutritionInsight({ product, barcode }: { product: Product['product'], barcode: string }) {
  const [insight, setInsight] = useState<NutritionInsightOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { language, t } = useLanguage();
  const { preferences } = usePreferences();

  useEffect(() => {
    const fetchInsight = async () => {
      setIsLoading(true);

      const cacheKey = getCacheKey(barcode, language, preferences);
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const cache: { [key: string]: CacheItem } = JSON.parse(cached);
            const item = cache[cacheKey];
            if (item && (Date.now() - item.timestamp < CACHE_TTL)) {
                setInsight(item.data);
                setIsLoading(false);
                return;
            }
        }
      } catch (e) {
          console.warn("Failed to read AI cache", e);
      }

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
        setInsight(result);
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            const cache = cached ? JSON.parse(cached) : {};
            cache[cacheKey] = { timestamp: Date.now(), data: result };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        } catch (e) {
            console.warn("Failed to write to AI cache", e);
        }
      }
      
      setIsLoading(false);
    };

    fetchInsight();
  }, [product, barcode, language, preferences]);

  if (isLoading) {
    return <div className='space-y-4'>
        <Skeleton className="h-4 w-1/3 mb-1" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-4 w-1/4 mt-3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
    </div>;
  }

  if (!insight) {
    return (
        <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                {t('generatingInsightError')}
            </AlertDescription>
        </Alert>
    );
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
        <div>
            <Label className="text-sm font-medium">Health Score: {insight.healthScore}/100</Label>
            <Progress value={insight.healthScore} className="h-2" indicatorClassName={getHealthScoreColor(insight.healthScore)} />
        </div>
        <div>
             <Label className="text-sm font-medium">Summary</Label>
             <p className="text-sm text-muted-foreground">{insight.summary}</p>
        </div>
        <div>
            <Label className="text-sm font-medium">Recommendation</Label>
            <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
        </div>
        {insight.risks.length > 0 && (
            <div>
                 <Label className="text-sm font-medium">Potential Risks</Label>
                 <div className="flex flex-wrap gap-2 mt-1">
                    {insight.risks.map((risk, i) => (
                        <Badge key={i} variant="destructive">{risk}</Badge>
                    ))}
                 </div>
            </div>
        )}
    </div>
  );
}

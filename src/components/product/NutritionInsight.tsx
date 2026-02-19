'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Sparkles } from 'lucide-react';
import { getAINutritionInsight } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import type { Product, NutritionInsightOutput, UserSettings } from '@/lib/types';
import { useLanguage, usePreferences } from '@/contexts/AppProviders';
import { useAiUsage } from '@/hooks/useAiUsage';

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

// Local scoring engine
function calculateLocalAnalysis(product: Product['product']): LocalAnalysis {
    let score = 100;
    const warnings: string[] = [];
    const nutriments = product.nutriments || {};

    const HIGH_SUGAR_THRESHOLD = 22.5;
    const HIGH_SALT_THRESHOLD = 1.5;
    const HIGH_SATFAT_THRESHOLD = 5;

    if (nutriments.sugars_100g !== undefined) {
      if (nutriments.sugars_100g >= HIGH_SUGAR_THRESHOLD) {
        warnings.push('High in sugar');
        score -= 25;
      } else if (nutriments.sugars_100g > 10) {
        score -= 10;
      }
    }

    if (nutriments.salt_100g !== undefined) {
        if (nutriments.salt_100g >= HIGH_SALT_THRESHOLD) {
            warnings.push('High in salt');
            score -= 25;
        } else if (nutriments.salt_100g > 0.3) {
            score -= 10;
        }
    }

    if (nutriments['saturated-fat_100g'] !== undefined) {
        if (nutriments['saturated-fat_100g'] >= HIGH_SATFAT_THRESHOLD) {
            warnings.push('High in saturated fat');
            score -= 20;
        } else if (nutriments['saturated-fat_100g'] > 1.5) {
            score -= 10;
        }
    }
    
    if (product.nova_group) {
      if (product.nova_group === 4) {
        warnings.push('Ultra-processed food (NOVA 4)');
        score -= 20;
      } else if (product.nova_group === 3) {
        warnings.push('Processed food (NOVA 3)');
        score -= 10;
      }
    }

    const finalScore = Math.max(0, Math.min(100, Math.round(score)));
    return { score: finalScore, warnings };
}

const getHealthScoreColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
};

const AnalysisDisplay = ({ title, score, risks, recommendation, summary }: { title: string, score: number, risks?: string[], recommendation?: string, summary?: string }) => (
    <div className="space-y-4">
        <div>
            <Label className="text-sm font-medium">{title}: {score}/100</Label>
            <Progress value={score} className="h-2" indicatorClassName={getHealthScoreColor(score)} />
        </div>
        {summary && (
             <div>
                <Label className="text-sm font-medium">Summary</Label>
                <p className="text-sm text-muted-foreground">{summary}</p>
            </div>
        )}
        {recommendation && (
            <div>
                <Label className="text-sm font-medium">Recommendation</Label>
                <p className="text-sm text-muted-foreground">{recommendation}</p>
            </div>
        )}
        {risks && risks.length > 0 && (
            <div>
                 <Label className="text-sm font-medium">Potential Risks</Label>
                 <div className="flex flex-wrap gap-2 mt-1">
                    {risks.map((risk, i) => (
                        <Badge key={i} variant="destructive">{risk}</Badge>
                    ))}
                 </div>
            </div>
        )}
    </div>
);


export default function NutritionInsight({ product, barcode }: { product: Product['product'], barcode: string }) {
  const [localAnalysis, setLocalAnalysis] = useState<LocalAnalysis | null>(null);
  const [aiInsight, setAiInsight] = useState<NutritionInsightOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);
  const { language, t } = useLanguage();
  const { preferences } = usePreferences();
  const { incrementAiCallCount } = useAiUsage();

  const fetchInsight = useCallback(async () => {
    setIsLoading(true);
    setAiError(null);
    
    const local = calculateLocalAnalysis(product);
    setLocalAnalysis(local);

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
        console.error("AI Insight fetch failed", e);
        setAiError(t('generatingInsightError'));
    } finally {
      setIsLoading(false);
    }
  }, [product, barcode, language, preferences, t, incrementAiCallCount]);


  useEffect(() => {
    fetchInsight();
  }, [fetchInsight]);

  // Initial loading state before local analysis
  if (!localAnalysis) {
    return <div className='space-y-4 h-[180px]'>
        <Skeleton className="h-4 w-1/3 mb-1" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-4 w-1/4 mt-3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
    </div>;
  }

  // AI is loading, show local analysis + loading indicator
  if (isLoading) {
    return (
        <div>
            <AnalysisDisplay title="Initial Score" score={localAnalysis.score} risks={localAnalysis.warnings} />
            <div className="mt-4 space-y-2 animate-pulse">
                <div className="flex items-center gap-2 text-primary text-sm font-medium">
                    <Sparkles className="h-4 w-4" />
                    <p>Refining analysis with AI...</p>
                </div>
            </div>
        </div>
    );
  }
  
  // AI has finished loading
  return (
    <div>
        {aiInsight ? (
            <AnalysisDisplay 
                title="AI Health Score"
                score={aiInsight.healthScore}
                summary={aiInsight.summary}
                recommendation={aiInsight.recommendation}
                risks={aiInsight.risks}
            />
        ) : (
            <>
                <AnalysisDisplay title="Nutritional Score" score={localAnalysis.score} risks={localAnalysis.warnings} />
                {aiError && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>AI Analysis Unavailable</AlertTitle>
                        <AlertDescription>
                            Showing a local analysis. The AI couldn't be reached.
                        </AlertDescription>
                    </Alert>
                )}
            </>
        )}
    </div>
  );
}

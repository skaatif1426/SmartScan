'use client';

import { useState, useEffect } from 'react';
import { getAINutritionInsight } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Product } from '@/lib/types';
import { useSettings } from '@/contexts/SettingsContext';

export default function NutritionInsight({ product }: { product: Product['product'] }) {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useSettings();

  useEffect(() => {
    const fetchInsight = async () => {
      setIsLoading(true);
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
      setInsight(result);
      setIsLoading(false);
    };

    fetchInsight();
  }, [product]);

  if (isLoading) {
    return <div className='space-y-2'>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
    </div>;
  }

  return (
    <Alert className="bg-primary/10 border-primary/20">
      <AlertDescription className="text-primary-foreground font-medium text-primary">
        {insight || t('generatingInsight')}
      </AlertDescription>
    </Alert>
  );
}

import type { Product } from './types';

export interface LocalAnalysis {
    score: number;
    warnings: string[];
}

export function calculateLocalScore(product: Product['product']): LocalAnalysis {
    if (!product) {
        return { score: 0, warnings: ['No product data'] };
    }
    
    let score = 100;
    const warnings: string[] = [];
    const nutriments = product.nutriments || {};

    const HIGH_SUGAR_THRESHOLD = 22.5;
    const HIGH_SALT_THRESHOLD = 1.5;
    const HIGH_SATFAT_THRESHOLD = 5;

    if (nutriments.sugars_100g !== undefined && nutriments.sugars_100g !== null) {
      if (nutriments.sugars_100g >= HIGH_SUGAR_THRESHOLD) {
        warnings.push('High in sugar');
        score -= 25;
      } else if (nutriments.sugars_100g > 10) {
        score -= 10;
      }
    }

    if (nutriments.salt_100g !== undefined && nutriments.salt_100g !== null) {
        if (nutriments.salt_100g >= HIGH_SALT_THRESHOLD) {
            warnings.push('High in salt');
            score -= 25;
        } else if (nutriments.salt_100g > 0.3) {
            score -= 10;
        }
    }

    if (nutriments['saturated-fat_100g'] !== undefined && nutriments['saturated-fat_100g'] !== null) {
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

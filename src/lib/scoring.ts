import type { Product } from './types';
import { CheckCircle, Shield, AlertTriangle, ShieldQuestion } from 'lucide-react';

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


export const getScoreInfo = (score: number | null | undefined) => {
    if (score === null || score === undefined) {
        return { 
            label: 'N/A', 
            badgeClassName: 'bg-muted text-muted-foreground',
            progressClassName: 'bg-muted',
            textClassName: 'text-muted-foreground',
            icon: ShieldQuestion
        };
    }

    if (score >= 80) return { 
        label: 'Excellent',
        badgeClassName: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
        progressClassName: 'bg-emerald-500',
        textClassName: 'text-emerald-600 dark:text-emerald-400',
        icon: CheckCircle
    };
    if (score >= 60) return { 
        label: 'Good', 
        badgeClassName: 'bg-primary/10 text-primary border-primary/20',
        progressClassName: 'bg-primary',
        textClassName: 'text-primary',
        icon: Shield
    };
    if (score >= 40) return { 
        label: 'Moderate', 
        badgeClassName: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
        progressClassName: 'bg-amber-500',
        textClassName: 'text-amber-600 dark:text-amber-400',
        icon: AlertTriangle
    };
    return { 
        label: 'Poor', 
        badgeClassName: 'bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/30',
        progressClassName: 'bg-destructive',
        textClassName: 'text-destructive',
        icon: ShieldQuestion
    };
};
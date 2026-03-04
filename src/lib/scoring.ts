import type { UnifiedProduct } from './types';
import { CheckCircle, Shield, AlertTriangle, ShieldQuestion } from 'lucide-react';

export interface LocalAnalysis {
    score: number;
    warnings: string[];
}

/**
 * Calculates a local health score based on unified product data.
 * Used when backend healthScore is unavailable or for local validation.
 */
export function calculateLocalScore(product: UnifiedProduct): LocalAnalysis {
    if (!product) {
        return { score: 0, warnings: ['No product data'] };
    }
    
    // If backend provided a score, we could use it directly, 
    // but for the scanner flow we often want real-time local logic.
    let score = 100;
    const warnings: string[] = [];
    const nutriments = product.nutriments;

    const HIGH_SUGAR_THRESHOLD = 22.5;
    const HIGH_SALT_THRESHOLD = 1.5;
    const HIGH_SATFAT_THRESHOLD = 5;

    // Mapping Unified keys to scoring logic
    if (nutriments.sugar !== undefined) {
      if (nutriments.sugar >= HIGH_SUGAR_THRESHOLD) {
        warnings.push('High in sugar');
        score -= 25;
      } else if (nutriments.sugar > 10) {
        score -= 10;
      }
    }

    if (nutriments.salt !== undefined) {
        if (nutriments.salt >= HIGH_SALT_THRESHOLD) {
            warnings.push('High in salt');
            score -= 25;
        } else if (nutriments.salt > 0.3) {
            score -= 10;
        }
    }

    if (nutriments.saturatedFat !== undefined) {
        if (nutriments.saturatedFat >= HIGH_SATFAT_THRESHOLD) {
            warnings.push('High in saturated fat');
            score -= 20;
        } else if (nutriments.saturatedFat > 1.5) {
            score -= 10;
        }
    }
    
    if (product.novaGroup) {
      if (product.novaGroup === 4) {
        warnings.push('Ultra-processed food (NOVA 4)');
        score -= 20;
      } else if (product.novaGroup === 3) {
        warnings.push('Processed food (NOVA 3)');
        score -= 10;
      }
    }

    // If backend already has a score, we give it high weight or use it as override
    if (product.source === 'backend' && product.healthScore > 0) {
        return { score: product.healthScore, warnings };
    }

    const finalScore = Math.max(0, Math.min(100, Math.round(score)));
    return { score: finalScore, warnings };
}


export const getScoreInfo = (score: number | null | undefined) => {
    if (score === null || score === undefined) {
        return { 
            label: 'N/A', 
            badgeClassName: 'bg-muted text-muted-foreground border-transparent',
            progressClassName: 'bg-muted',
            textClassName: 'text-muted-foreground',
            icon: ShieldQuestion
        };
    }

    if (score >= 80) return { 
        label: 'Excellent',
        badgeClassName: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
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
        badgeClassName: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
        progressClassName: 'bg-amber-500',
        textClassName: 'text-amber-600 dark:text-amber-400',
        icon: AlertTriangle
    };
    return { 
        label: 'Poor', 
        badgeClassName: 'bg-destructive/10 text-destructive border-destructive/20 dark:text-destructive-foreground dark:bg-destructive/20',
        progressClassName: 'bg-destructive',
        textClassName: 'text-destructive',
        icon: ShieldQuestion
    };
};

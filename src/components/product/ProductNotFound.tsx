'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2, Sparkles, Radar } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAIEstimate } from '@/lib/actions';
import type { NutritionInsightOutput } from '@/lib/types';
import AnalysisDisplay from './AnalysisDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { useDiscovery } from '@/hooks/useDiscovery';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useGamification } from '@/hooks/useGamification';
import { useLanguage } from '@/contexts/AppProviders';
import { cn } from '@/lib/utils';

export default function ProductNotFound({ barcode }: { barcode: string }) {
    const router = useRouter();
    const [isEstimating, setIsEstimating] = useState(false);
    const [isWarmingUp, setIsWarmingUp] = useState(true);
    const [estimate, setEstimate] = useState<NutritionInsightOutput | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { addDiscovery } = useDiscovery();
    const { addScanToHistory } = useScanHistory();
    const { addXp, XP_PER_DISCOVERY } = useGamification();
    const { language, t } = useLanguage();

    // Fix hydration mismatch: Set random message key after mount
    const [randomMessageKey, setRandomMessageKey] = useState<any>(null);

    useEffect(() => {
        // Pick random message on client side only
        const index = Math.floor(Math.random() * 7) + 1;
        setRandomMessageKey(`discoveryMsg${index}`);

        if (barcode) {
            addDiscovery(barcode);
            addScanToHistory({
                barcode,
                productName: `Discovery: #${barcode.slice(-4)}`,
                brand: 'Unknown Product',
                isDiscovery: true,
                categories: 'Other', 
            });
            addXp(XP_PER_DISCOVERY);
        }

        // Simulate intelligence delay (Warm up phase)
        const timer = setTimeout(() => {
            setIsWarmingUp(false);
        }, 1800);

        return () => clearTimeout(timer);
    }, [barcode]);

    const handleGetEstimate = async () => {
        setIsEstimating(true);
        setError(null);
        const result = await getAIEstimate({ barcode, language });
        if (result) {
            setEstimate(result);
            if (result.category) {
                addScanToHistory({
                    barcode,
                    productName: `Discovery: ${result.category}`,
                    brand: 'AI Estimate',
                    imageUrl: null, 
                    categories: result.category,
                    healthScore: result.healthScore,
                    isDiscovery: true,
                });
            }
        } else {
            setError(t('generatingInsightError'));
        }
        setIsEstimating(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-full p-6 text-center animate-in fade-in duration-700">
            <Card className="w-full max-w-lg shadow-2xl border-2 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="pt-10">
                    <div className="mx-auto mb-6 relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                        <div className="relative p-5 bg-primary/10 rounded-full">
                            <Radar className="h-10 w-10 text-primary animate-pulse-subtle" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight h-8">
                        {randomMessageKey ? t(randomMessageKey).split('\n')[0] : <Skeleton className="h-8 w-48 mx-auto" />}
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-10 space-y-8">
                    <div className="space-y-4">
                        <div className="min-h-[60px]">
                            {randomMessageKey ? (
                                <p className="text-muted-foreground font-medium text-lg leading-relaxed whitespace-pre-line">
                                    {t(randomMessageKey).split('\n')[1]}
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4 mx-auto" />
                                </div>
                            )}
                        </div>
                        
                        <div className={cn(
                            "flex items-center justify-center gap-2 transition-all duration-500",
                            isWarmingUp ? "opacity-100 translate-y-0" : "opacity-40 -translate-y-1"
                        )}>
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-muted rounded-full border">
                                <Loader2 className={cn("h-3.5 w-3.5 text-primary", isWarmingUp && "animate-spin")} />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    {isWarmingUp ? t('analysisInProgress') : t('systemInitializing')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-4">
                        <Button 
                            className="h-18 rounded-3xl font-black text-lg bg-gradient-to-r from-primary to-emerald-600 shadow-xl active:scale-95 transition-all disabled:opacity-50" 
                            onClick={handleGetEstimate} 
                            disabled={isEstimating || isWarmingUp}
                        >
                            {isEstimating ? (
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            ) : (
                                <Sparkles className="mr-3 h-5 w-5" />
                            )}
                            {isEstimating ? 'Finalizing Analysis...' : t('getAiEstimate')}
                        </Button>
                        <Button 
                            variant="outline" 
                            className="h-16 rounded-3xl border-2 font-black text-muted-foreground hover:text-foreground transition-all active:scale-95" 
                            onClick={() => router.push('/')}
                        >
                            <Camera className="mr-3 h-5 w-5" />
                            {t('scanAgain')}
                        </Button>
                    </div>

                    {isEstimating && (
                        <div className="pt-6 space-y-4 animate-in fade-in duration-500 text-left">
                             <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                                <Skeleton className="h-5 w-1/3" />
                             </div>
                             <Skeleton className="h-2 w-full" />
                             <div className="pt-4 space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-full rounded-lg" />
                             </div>
                        </div>
                    )}

                    {estimate && (
                        <div className="pt-8 text-left border-t-2 mt-8 animate-in slide-in-from-bottom-6 duration-700">
                            <AnalysisDisplay
                                warningTitle={t('aiEstimatedAnalysis')}
                                title="AI System Estimate"
                                score={estimate.healthScore}
                                summary={estimate.summary}
                                recommendation={estimate.recommendation}
                                risks={estimate.risks}
                            />
                        </div>
                    )}

                    {error && (
                         <div className="p-4 bg-destructive/5 rounded-2xl border border-destructive/20 text-destructive text-sm font-bold">
                            {error}
                         </div>
                    )}
                </CardContent>
            </Card>
            
            <p className="mt-8 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] animate-pulse">
                SmartScan Intelligence v1.2 Active
            </p>
        </div>
    );
}

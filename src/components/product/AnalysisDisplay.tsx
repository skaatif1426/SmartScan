'use client';

import { useEffect } from 'react';
import { AlertCircle, CheckCircle, Flame, Apple, Info, ShieldCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import AnimatedCounter from '../ui/AnimatedCounter';
import { getScoreInfo } from '@/lib/scoring';
import { useLanguage } from '@/contexts/AppProviders';

interface AnalysisDisplayProps {
  title: string;
  score: number;
  risks?: string[];
  recommendation?: string;
  summary?: string;
  isLocal?: boolean;
  warningTitle?: string;
  nutrition?: {
    calories: number;
    sugar: number;
    fat: number;
    protein: number;
  };
}

const AnalysisDisplay = ({ 
  score, 
  risks, 
  recommendation, 
  summary, 
  isLocal = false, 
  warningTitle,
  nutrition 
}: AnalysisDisplayProps) => {
    const scoreInfo = getScoreInfo(score);
    const { t } = useLanguage();
    
    useEffect(() => {
        if (navigator.vibrate && !isLocal) {
            navigator.vibrate([50, 30, 50]);
        }
    }, [isLocal]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {warningTitle && (
                <Alert variant="destructive" className="border shadow-sm py-3 px-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="font-bold text-sm">{warningTitle}</AlertTitle>
                </Alert>
            )}

            {summary && (
                 <Card className="border-primary/20 bg-primary/5 shadow-none rounded-xl">
                    <CardContent className="p-4 flex gap-3 items-start">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-bold leading-tight">{summary}</p>
                    </CardContent>
                </Card>
            )}
            
            <div className="text-center space-y-2">
                 <div className="relative inline-block">
                    <div className={cn('text-7xl font-black tracking-tighter', scoreInfo.textClassName)}>
                        <AnimatedCounter value={score} />
                    </div>
                    {!isLocal && <CheckCircle className="absolute -top-2 -right-6 w-8 h-8 text-emerald-500 success-tick" />}
                 </div>
                 <div className="flex flex-col items-center gap-1.5">
                    <Badge variant="outline" className={cn('text-[10px] px-3 py-1 rounded-full font-black border', scoreInfo.badgeClassName)}>
                        {scoreInfo.label} {t('healthChoice')}
                    </Badge>
                    <Progress value={score} indicatorClassName={scoreInfo.progressClassName} className="h-2 w-40 mx-auto bg-muted rounded-full" />
                 </div>
            </div>

            {nutrition && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <NutritionCard label={t('calories')} value={nutrition.calories} unit="kcal" icon={Flame} color="text-orange-500" />
                    <NutritionCard label={t('sugar')} value={nutrition.sugar} unit="g" icon={Apple} color="text-pink-500" />
                    <NutritionCard label={t('fat')} value={nutrition.fat} unit="g" icon={Info} color="text-yellow-500" />
                    <NutritionCard label={t('protein')} value={nutrition.protein} unit="g" icon={ShieldCheck} color="text-emerald-500" />
                </div>
            )}

            {risks && risks.length > 0 && (
                <div className="space-y-2">
                     <Label className="text-[9px] uppercase tracking-widest font-black text-muted-foreground">{t('nutritionAlerts')}</Label>
                     <div className="flex flex-wrap gap-1.5">
                        {risks.map((risk, i) => (
                            <Badge key={i} variant="destructive" className="rounded-lg px-2 py-0.5 font-bold text-[10px] lowercase first-letter:uppercase">
                                {risk} ⚠️
                            </Badge>
                        ))}
                     </div>
                </div>
            )}

            {recommendation && (
                <div className="p-4 rounded-xl border bg-muted/20">
                    <Label className="text-[9px] uppercase tracking-widest font-black text-muted-foreground block mb-1">{t('expertTake')}</Label>
                    <p className="text-xs font-medium leading-relaxed">{recommendation}</p>
                </div>
            )}
        </div>
    );
};

function NutritionCard({ label, value, unit, icon: Icon, color }: any) {
  return (
    <Card className="border shadow-none rounded-xl bg-muted/10">
      <CardContent className="p-3 flex flex-col items-center text-center gap-0.5">
        <Icon className={cn("h-4 w-4", color)} />
        <div className="text-base font-black">{Math.round(value)}{unit}</div>
        <div className="text-[9px] uppercase font-black tracking-tighter text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

export default AnalysisDisplay;

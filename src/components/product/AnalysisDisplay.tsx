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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
            {warningTitle && (
                <Alert variant="destructive" className="border-2 shadow-sm">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="font-bold">{warningTitle}</AlertTitle>
                </Alert>
            )}

            {summary && (
                 <Card className="border-primary/20 bg-primary/5 shadow-none rounded-2xl">
                    <CardContent className="p-5 flex gap-4 items-start">
                        <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-base font-bold leading-tight">{summary}</p>
                    </CardContent>
                </Card>
            )}
            
            <div className="text-center space-y-4">
                 <div className="relative inline-block">
                    <div className={cn('text-8xl font-black tracking-tighter', scoreInfo.textClassName)}>
                        <AnimatedCounter value={score} />
                    </div>
                    {!isLocal && <CheckCircle className="absolute -top-4 -right-8 w-10 h-10 text-emerald-500 success-tick" />}
                 </div>
                 <div className="flex flex-col items-center gap-2">
                    <Badge variant="outline" className={cn('text-xs px-4 py-1.5 rounded-full font-black border-2', scoreInfo.badgeClassName)}>
                        {scoreInfo.label} {t('healthChoice')}
                    </Badge>
                    <Progress value={score} indicatorClassName={scoreInfo.progressClassName} className="h-3 w-48 mx-auto bg-muted rounded-full" />
                 </div>
            </div>

            {nutrition && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <NutritionCard label={t('calories')} value={nutrition.calories} unit="kcal" icon={Flame} color="text-orange-500" />
                    <NutritionCard label={t('sugar')} value={nutrition.sugar} unit="g" icon={Apple} color="text-pink-500" />
                    <NutritionCard label={t('fat')} value={nutrition.fat} unit="g" icon={Info} color="text-yellow-500" />
                    <NutritionCard label={t('protein')} value={nutrition.protein} unit="g" icon={ShieldCheck} color="text-emerald-500" />
                </div>
            )}

            {risks && risks.length > 0 && (
                <div className="space-y-3">
                     <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">{t('nutritionAlerts')}</Label>
                     <div className="flex flex-wrap gap-2">
                        {risks.map((risk, i) => (
                            <Badge key={i} variant="destructive" className="rounded-xl px-3 py-1 font-bold lowercase first-letter:uppercase">
                                {risk} ⚠️
                            </Badge>
                        ))}
                     </div>
                </div>
            )}

            {recommendation && (
                <div className="p-5 rounded-2xl border-2 bg-muted/30">
                    <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground block mb-2">{t('expertTake')}</Label>
                    <p className="text-sm font-medium leading-relaxed">{recommendation}</p>
                </div>
            )}
        </div>
    );
};

function NutritionCard({ label, value, unit, icon: Icon, color }: any) {
  return (
    <Card className="border shadow-none rounded-2xl bg-muted/20">
      <CardContent className="p-4 flex flex-col items-center text-center gap-1">
        <Icon className={cn("h-5 w-5", color)} />
        <div className="text-lg font-black">{Math.round(value)}{unit}</div>
        <div className="text-[10px] uppercase font-black tracking-tighter text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

export default AnalysisDisplay;

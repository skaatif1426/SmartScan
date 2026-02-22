'use client';
import { useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import AnimatedCounter from '../ui/AnimatedCounter';
import { getScoreInfo } from '@/lib/scoring';

const AnalysisDisplay = ({ title, score, risks, recommendation, summary, isLocal = false, warningTitle }: { title: string, score: number, risks?: string[], recommendation?: string, summary?: string, isLocal?: boolean, warningTitle?: string }) => {
    const scoreInfo = getScoreInfo(score);
    
    useEffect(() => {
        // Haptic feedback for success
        if (navigator.vibrate && !isLocal) {
            navigator.vibrate(50);
        }
    }, [isLocal]);

    return (
        <div className="space-y-6">
            {warningTitle && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{warningTitle}</AlertTitle>
                </Alert>
            )}
            
            <div className="text-center space-y-2 relative">
                 <div className={cn('text-6xl font-bold tracking-tighter', scoreInfo.textClassName)}>
                    <AnimatedCounter value={score} />
                </div>
                <Badge variant="outline" className={cn('text-sm', scoreInfo.badgeClassName)}>{scoreInfo.label}</Badge>
                <Progress value={score} className="h-2 mt-2" indicatorClassName={scoreInfo.progressClassName} />
                 {!isLocal && (
                    <div className="absolute -top-4 right-0">
                        <CheckCircle className="w-8 h-8 text-green-500 success-tick" />
                    </div>
                )}
            </div>

            {summary && (
                 <div>
                    <Label className="text-sm font-medium">Summary</Label>
                    <p className="text-sm text-muted-foreground mt-1">{summary}</p>
                </div>
            )}
            
            {isLocal && risks && risks.length > 0 && (
                 <div>
                    <Label className="text-sm font-medium">Score Factors</Label>
                    <p className="text-sm text-muted-foreground mt-1">Score reduced due to: {risks.join(', ')}.</p>
                </div>
            )}

            {recommendation && (
                <div>
                    <Label className="text-sm font-medium">AI Recommendation</Label>
                    <p className="text-sm text-muted-foreground mt-1">{recommendation}</p>
                </div>
            )}

            {!isLocal && risks && risks.length > 0 && (
                <div>
                     <Label className="text-sm font-medium">Potential Risks</Label>
                     <div className="flex flex-wrap gap-2 mt-2">
                        {risks.map((risk, i) => (
                            <Badge key={i} variant="destructive">{risk}</Badge>
                        ))}
                     </div>
                </div>
            )}
        </div>
    );
};

export default AnalysisDisplay;

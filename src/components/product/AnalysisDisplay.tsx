'use client';
import { AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const getHealthScoreColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
};

const getHealthScoreTextColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
};

const AnalysisDisplay = ({ title, score, risks, recommendation, summary, isLocal = false, warningTitle }: { title: string, score: number, risks?: string[], recommendation?: string, summary?: string, isLocal?: boolean, warningTitle?: string }) => (
    <div className="space-y-4">
        {warningTitle && (
            <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{warningTitle}</AlertTitle>
            </Alert>
        )}
        <div>
            <div className="flex justify-between items-center mb-1">
                <Label className="text-sm font-medium">{title}</Label>
                <span className={cn('font-bold text-lg', getHealthScoreTextColor(score))}>{score}/100</span>
            </div>
            <Progress value={score} className="h-2" indicatorClassName={getHealthScoreColor(score)} />
        </div>
        {summary && (
             <div>
                <Label className="text-sm font-medium">Summary</Label>
                <p className="text-sm text-muted-foreground">{summary}</p>
            </div>
        )}
        {isLocal && risks && risks.length > 0 && (
             <div>
                <Label className="text-sm font-medium">Score Factors</Label>
                <p className="text-sm text-muted-foreground">Score reduced due to: {risks.join(', ')}.</p>
            </div>
        )}
        {recommendation && (
            <div>
                <Label className="text-sm font-medium">Recommendation</Label>
                <p className="text-sm text-muted-foreground">{recommendation}</p>
            </div>
        )}
        {!isLocal && risks && risks.length > 0 && (
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

export default AnalysisDisplay;

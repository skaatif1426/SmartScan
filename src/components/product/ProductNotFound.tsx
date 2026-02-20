'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Camera } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAIEstimate } from '@/lib/actions';
import type { NutritionInsightOutput } from '@/lib/types';
import AnalysisDisplay from './AnalysisDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { useDiscovery } from '@/hooks/useDiscovery';

export default function ProductNotFound({ barcode }: { barcode: string }) {
    const router = useRouter();
    const [isEstimating, setIsEstimating] = useState(false);
    const [estimate, setEstimate] = useState<NutritionInsightOutput | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { addDiscovery } = useDiscovery();

    useEffect(() => {
        if (barcode) {
            addDiscovery(barcode);
        }
    }, [barcode, addDiscovery]);

    const handleGetEstimate = async () => {
        setIsEstimating(true);
        setError(null);
        const result = await getAIEstimate(barcode);
        if (result) {
            setEstimate(result);
        } else {
            setError('Could not generate an AI estimate at this time.');
        }
        setIsEstimating(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-full p-4 md:p-6 text-center">
            <Card className="w-full max-w-lg shadow-lg animate-in fade-in zoom-in-95 duration-500">
                <CardHeader>
                    <div className="flex justify-center mb-2">
                        <Badge variant="outline">🆕 You discovered a new item</Badge>
                    </div>
                    <CardTitle className="text-2xl font-bold">✨ New Discovery!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Looks like this product isn’t in our database yet — thanks for scanning something unique! 🙌
                    </p>
                    <p className="text-sm text-muted-foreground pt-2">
                        We’re always expanding and improving our product coverage to make this smarter every day 🚀
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                        <Button className="w-full" onClick={handleGetEstimate} disabled={isEstimating}>
                            <Bot className="mr-2" />
                            {isEstimating ? 'Estimating...' : 'Get AI Estimate'}
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
                            <Camera className="mr-2" />
                            Scan Another
                        </Button>
                    </div>

                    {isEstimating && (
                        <div className="pt-6 space-y-4 animate-pulse text-left">
                             <Skeleton className="h-5 w-1/3" />
                             <Skeleton className="h-2 w-full" />
                             <div className="pt-4 space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-full" />
                             </div>
                             <div className="pt-2 space-y-2">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-4 w-3/4" />
                             </div>
                        </div>
                    )}

                    {estimate && (
                        <div className="pt-6 text-left border-t mt-6">
                            <AnalysisDisplay
                                warningTitle="⚠️ AI Estimated Analysis (may not be exact)"
                                title="AI Health Score Estimate"
                                score={estimate.healthScore}
                                summary={estimate.summary}
                                recommendation={estimate.recommendation}
                                risks={estimate.risks}
                            />
                        </div>
                    )}

                    {error && (
                         <p className="text-destructive text-sm pt-4">{error}</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

'use client';

import React, { useMemo } from 'react';
import { Scan, Flame, Compass, HeartPulse } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/AppProviders';
import { useDiscovery } from '@/hooks/useDiscovery';
import { useScanHistory } from '@/hooks/useScanHistory';
import { cn } from '@/lib/utils';
import AnimatedCounter from '../ui/AnimatedCounter';
import { getScoreInfo } from '@/lib/scoring';

function StatsCards() {
    const { t } = useLanguage();
    const { discoveryStreak } = useDiscovery();
    const { scanStreak, history } = useScanHistory();
    const totalScans = history.length;

    const averageScore = useMemo(() => {
        const scores = history.map(item => item.healthScore).filter(score => score !== undefined) as number[];
        if (scores.length === 0) return null;
        const sum = scores.reduce((a, b) => a + b, 0);
        return Math.round(sum / scores.length);
    }, [history]);

    const scoreInfo = getScoreInfo(averageScore);

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('totalScans')}</CardTitle>
                    <Scan className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalScans}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Health Score</CardTitle>
                    <HeartPulse className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                     <div className={cn("text-2xl font-bold", scoreInfo.textClassName)}>
                        {averageScore !== null ? <><AnimatedCounter value={averageScore} /><span className="text-base font-normal text-muted-foreground">/100</span></> : '-'}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('scanStreak')}</CardTitle>
                    <Flame className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{scanStreak} <span className="text-sm text-muted-foreground">{t('days')}</span></div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('discoveryStreak')}</CardTitle>
                    <Compass className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{discoveryStreak} <span className="text-sm text-muted-foreground">{t('days')}</span></div>
                     {discoveryStreak > 0 && <p className="text-xs text-muted-foreground">On a discovery journey! 🔥</p>}
                </CardContent>
            </Card>
        </div>
    );
}

export default React.memo(StatsCards);
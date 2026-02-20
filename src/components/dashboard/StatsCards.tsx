'use client';

import React from 'react';
import { Scan, Flame, Compass } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/AppProviders';
import { useDiscovery } from '@/hooks/useDiscovery';
import { useScanHistory } from '@/hooks/useScanHistory';

function StatsCards() {
    const { t } = useLanguage();
    const { discoveryStreak } = useDiscovery();
    const { scanStreak, history } = useScanHistory();
    const totalScans = history.length;


    return (
        <div className="grid gap-6 md:grid-cols-3">
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

'use client';

import React, { useMemo } from 'react';
import { Scan, Flame, Compass } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ScanHistoryItem } from '@/lib/types';
import { useLanguage, usePreferences } from '@/contexts/AppProviders';
import { useDiscovery } from '@/hooks/useDiscovery';

function calculateScanStreak(history: ScanHistoryItem[]): number {
    if (history.length === 0) return 0;

    let streak = 0;
    
    const uniqueDaysScanned = [...new Set(history.map(scan => new Date(scan.scanDate).setHours(0, 0, 0, 0)))].sort((a, b) => b - a);

    if (uniqueDaysScanned.length === 0) return 0;

    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (uniqueDaysScanned[0] !== today && uniqueDaysScanned[0] !== new Date(yesterday).getTime()) {
        return 0;
    }
    
    streak = 1;
    for (let i = 1; i < uniqueDaysScanned.length; i++) {
        const dayDiff = (uniqueDaysScanned[i-1] - uniqueDaysScanned[i]) / (1000 * 3600 * 24);
        if (dayDiff === 1) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}


function StatsCards({ history }: { history: ScanHistoryItem[] }) {
    const { t } = useLanguage();
    const { preferences } = usePreferences();
    const { discoveryCount } = useDiscovery();
    const totalScans = history.length;
    const scanStreak = useMemo(() => calculateScanStreak(history), [history]);

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
                    {preferences.advancedUiMode && <p className="text-xs text-muted-foreground">Advanced detail visible!</p>}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('newProductsDiscovered')}</CardTitle>
                    <Compass className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{discoveryCount}</div>
                    {discoveryCount > 0 && <p className="text-xs text-muted-foreground">Curious Explorer 🧭</p>}
                </CardContent>
            </Card>
        </div>
    );
}

export default React.memo(StatsCards);

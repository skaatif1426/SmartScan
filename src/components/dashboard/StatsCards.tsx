'use client';

import { useMemo } from 'react';
import { isSameDay, differenceInCalendarDays } from 'date-fns';
import { Scan, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ScanHistoryItem } from '@/lib/types';
import { useSettings } from '@/contexts/SettingsContext';

function calculateScanStreak(history: ScanHistoryItem[]): number {
    if (history.length === 0) return 0;

    let streak = 0;
    let lastScanDate = new Date();

    // Check if latest scan is today or yesterday
    if (!isSameDay(new Date(history[0].scanDate), lastScanDate)) {
        lastScanDate.setDate(lastScanDate.getDate() - 1);
        if (!isSameDay(new Date(history[0].scanDate), lastScanDate)) {
            return 0; // No scans today or yesterday
        }
    }
    
    streak = 1;
    lastScanDate = new Date(history[0].scanDate);

    const uniqueDays = history.filter((scan, index, self) => 
        index === self.findIndex(s => isSameDay(new Date(s.scanDate), new Date(scan.scanDate)))
    );

    for (let i = 1; i < uniqueDays.length; i++) {
        const currentDate = new Date(uniqueDays[i].scanDate);
        if (differenceInCalendarDays(lastScanDate, currentDate) === 1) {
            streak++;
            lastScanDate = currentDate;
        } else {
            break;
        }
    }

    return streak;
}


export default function StatsCards({ history }: { history: ScanHistoryItem[] }) {
    const { t, settings } = useSettings();
    const totalScans = history.length;
    const scanStreak = useMemo(() => calculateScanStreak(history), [history]);

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('totalScans')}</CardTitle>
                    <Scan className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalScans}</div>
                </CardContent>
            </Card>
            <Card className="animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('scanStreak')}</CardTitle>
                    <Flame className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{scanStreak} <span className="text-sm text-muted-foreground">{t('days')}</span></div>
                    {settings.advancedUiMode && <p className="text-xs text-muted-foreground">Advanced detail visible!</p>}
                </CardContent>
            </Card>
        </div>
    );
}

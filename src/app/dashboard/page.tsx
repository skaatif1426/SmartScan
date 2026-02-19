'use client';

import { LayoutGrid } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import StatsCards from '@/components/dashboard/StatsCards';
import Achievements from '@/components/dashboard/Achievements';
import CategoryChart from '@/components/dashboard/CategoryChart';
import { useScanHistory } from '@/hooks/useScanHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/contexts/SettingsContext';

export default function DashboardPage() {
    const { history, isLoaded } = useScanHistory();
    const { t } = useSettings();

    if (!isLoaded) {
        return (
            <div className="p-4 md:p-6 space-y-4">
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                </div>
                <Skeleton className="h-64" />
                <Skeleton className="h-48" />
            </div>
        );
    }
    return (
        <div className="p-4 md:p-6 space-y-4">
            <h1 className="text-3xl font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
                <LayoutGrid className="text-primary" /> {t('dashboardTitle')}
            </h1>
            
            <StatsCards history={history} />

            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <CardHeader>
                    <CardTitle>{t('scannedCategories')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <CategoryChart history={history} />
                </CardContent>
            </Card>

            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                <CardHeader>
                    <CardTitle>{t('achievements')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Achievements history={history} />
                </CardContent>
            </Card>
        </div>
    );
}

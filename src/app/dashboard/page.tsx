'use client';
import dynamic from 'next/dynamic';
import { LayoutGrid, ScanLine } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import StatsCards from '@/components/dashboard/StatsCards';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useLanguage } from '@/contexts/AppProviders';
import { Skeleton } from '@/components/ui/skeleton';

const Achievements = dynamic(() => import('@/components/dashboard/Achievements'), { 
    loading: () => <Skeleton className="h-24 w-full" />,
});
const CategoryChart = dynamic(() => import('@/components/dashboard/CategoryChart'), {
    loading: () => <Skeleton className="h-[250px] w-full" />,
});

export default function DashboardPage() {
    const { history, isLoaded } = useScanHistory();
    const { t } = useLanguage();

    if (isLoaded && history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <ScanLine className="mx-auto h-16 w-16 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold">{t('dashboardEmptyTitle')}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t('dashboardEmptyDescription')}</p>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <h1 className="text-3xl font-bold flex items-center gap-2 animate-in fade-in duration-300">
                <LayoutGrid className="text-primary" /> {t('dashboardTitle')}
            </h1>
            
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100">
                <StatsCards history={history} />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
                    <CardHeader>
                        <CardTitle>{t('scannedCategories')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <CategoryChart history={history} />
                    </CardContent>
                </Card>

                <Card className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
                    <CardHeader>
                        <CardTitle>{t('achievements')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Achievements history={history} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

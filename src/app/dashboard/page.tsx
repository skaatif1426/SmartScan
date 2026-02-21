'use client';
import dynamic from 'next/dynamic';
import { LayoutGrid, ScanLine, CheckCircle, AlertTriangle, ShieldQuestion } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import StatsCards from '@/components/dashboard/StatsCards';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useLanguage } from '@/contexts/AppProviders';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { ScanHistoryItem } from '@/lib/types';

const Achievements = dynamic(() => import('@/components/dashboard/Achievements'), { 
    loading: () => <Skeleton className="h-24 w-full" />,
});
const CategoryChart = dynamic(() => import('@/components/dashboard/CategoryChart'), {
    loading: () => <Skeleton className="h-[250px] w-full" />,
});

const DashboardSummary = ({ history }: { history: ScanHistoryItem[] }) => {
    const summary = useMemo(() => {
        const scores = history.map(item => item.healthScore).filter((score): score is number => score !== undefined);
        if (scores.length < 1) return null;

        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        let tendency: string;
        let Icon: React.ElementType;
        let className: string;

        if (avgScore >= 70) {
            tendency = "You tend to scan healthy products. Keep it up! 👍";
            Icon = CheckCircle;
            className = "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700";
        } else if (avgScore >= 45) {
            tendency = "Your choices are mixed. Look for items with higher scores. ⚖️";
            Icon = AlertTriangle;
            className = "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700";
        } else {
            tendency = "You mostly scan products with lower health scores. 🧐";
            Icon = ShieldQuestion;
            className = "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700";
        }
        return { tendency, Icon, className };
    }, [history]);

    if (!summary) return null;

    const { tendency, Icon, className: summaryClassName } = summary;

    return (
        <Card className={cn("animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200", summaryClassName)}>
            <CardContent className="p-4">
                <div className={cn("p-3 rounded-lg text-sm flex items-center gap-3")}>
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <p className="font-medium">{tendency}</p>
                </div>
            </CardContent>
        </Card>
    );
};


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
                <StatsCards />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <DashboardSummary history={history} />
                <Card className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
                    <CardHeader>
                        <CardTitle>{t('scannedCategories')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <CategoryChart history={history} />
                    </CardContent>
                </Card>

                <Card className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-400">
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

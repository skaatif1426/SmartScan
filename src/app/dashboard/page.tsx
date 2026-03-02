'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useDiscovery } from '@/hooks/useDiscovery';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Scan, Flame, Sparkles, ScanLine, Compass, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { ScanHistoryItem } from '@/lib/types';
import Loading from './loading';
import { getScoreInfo } from '@/lib/scoring';
import { cn } from '@/lib/utils';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { useLanguage } from '@/contexts/AppProviders';

const HealthOverview = ({ history }: { history: ScanHistoryItem[] }) => {
    const { t } = useLanguage();
    
    const [greetingText, setGreetingText] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreetingText(t('goodMorning'));
        else if (hour < 18) setGreetingText(t('goodAfternoon'));
        else setGreetingText(t('goodEvening'));
    }, [t]);

    const { averageScore, trendIcon: TrendIcon, trendColor } = useMemo(() => {
        const scores = history.map(item => item.healthScore).filter(score => score !== undefined) as number[];
        if (scores.length === 0) return { averageScore: null, trendIcon: null, trendColor: 'text-muted-foreground' };

        const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        
        let trendIcon = Minus;
        let trendColor = 'text-muted-foreground';

        if (scores.length >= 2) {
            const lastScore = scores[0];
            const secondLastScore = scores[1];
            if (lastScore > secondLastScore + 2) {
                trendIcon = ArrowUp;
                trendColor = 'text-green-500';
            } else if (lastScore < secondLastScore - 2) {
                trendIcon = ArrowDown;
                trendColor = 'text-red-500';
            }
        }
        
        return { averageScore, trendIcon, trendColor };
    }, [history]);
    
    const { message, scoreInfo } = useMemo(() => {
        const scoreInfo = getScoreInfo(averageScore);
        let message = t('startScanMsg');

        if (history.length < 3) return { message, scoreInfo };
        
        if (averageScore! > 75) message = t('smartChoiceMsg');
        else if (averageScore! < 45) message = t('lowScoreMsg');
        else message = t('trackingMsg');
        
        return { message, scoreInfo };

    }, [history, averageScore, t]);
    
    return (
        <div className="text-center animate-in fade-in slide-in-from-top-4 duration-500 px-2">
            <h1 className="text-2xl font-black tracking-tight min-h-[32px]">{greetingText}</h1>
            <p className="text-muted-foreground font-bold text-sm mt-0.5">{message}</p>
            
            <div className="mt-8">
                <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-1">{t('healthIndex')}</p>
                <div className="flex items-center justify-center gap-1.5">
                    <div className={cn("text-6xl font-black tracking-tighter", scoreInfo.textClassName)}>
                         {averageScore !== null ? <AnimatedCounter value={averageScore} /> : '-'}
                    </div>
                    {TrendIcon && <TrendIcon className={cn("h-6 w-6", trendColor)} />}
                </div>
                <div className={cn("text-base font-black mt-1", scoreInfo.textClassName)}>{scoreInfo.label}</div>
            </div>
        </div>
    );
};

const QuickStats = ({ history }: { history: ScanHistoryItem[] }) => {
    const { scanStreak } = useScanHistory();
    const { discoveryCount } = useDiscovery();
    const { t } = useLanguage();
    
    return (
        <div className="space-y-3">
            <Card className="border shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-4 grid grid-cols-3 divide-x divide-border text-center">
                    <div className="space-y-0.5">
                        <Scan className="mx-auto h-4 w-4 text-muted-foreground" />
                        <div className="text-lg font-black">{history.length}</div>
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">{t('scans')}</p>
                    </div>
                    <div className="space-y-0.5">
                        <Flame className="mx-auto h-4 w-4 text-muted-foreground" />
                        <div className="text-lg font-black">{scanStreak}</div>
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">{t('streak')}</p>
                    </div>
                    <div className="space-y-0.5">
                        <Compass className="mx-auto h-4 w-4 text-muted-foreground" />
                        <div className="text-lg font-black">{discoveryCount}</div>
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">{t('found')}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
};

const RecentScan = ({ lastScan }: { lastScan: ScanHistoryItem }) => {
    const { t } = useLanguage();
    const scoreInfo = getScoreInfo(lastScan.healthScore);
    return (
        <div className="space-y-3">
            <h2 className="font-black text-sm uppercase tracking-widest text-muted-foreground">{t('latestAnalysis')}</h2>
            <Link href={lastScan.type === 'image' && lastScan.imageAnalysis ? '#' : `/product/${lastScan.barcode}`} passHref className="block transition-all active:scale-[0.98] rounded-2xl">
                <Card className="hover:bg-muted/50 border shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="p-4 flex items-center gap-4">
                        {lastScan.imageUrl ? (
                            <div className="relative w-14 h-14 bg-white rounded-xl border p-1 shadow-sm">
                                <Image src={lastScan.imageUrl} alt={lastScan.productName} fill className="object-contain p-1.5" />
                            </div>
                        ) : (
                            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center"><ScanLine className="w-6 h-6 text-muted-foreground" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-base truncate leading-none mb-1">{lastScan.productName}</p>
                            <div className="flex items-center gap-2">
                                <div className={cn("text-xs font-black", scoreInfo.textClassName)}>{lastScan.healthScore} / 100</div>
                                <div className={cn("text-[8px] uppercase font-black px-2 py-0.5 rounded-full border", scoreInfo.badgeClassName)}>{scoreInfo.label}</div>
                            </div>
                        </div>
                        <ArrowRight className="text-muted-foreground w-5 h-5 flex-shrink-0" />
                    </CardContent>
                </Card>
            </Link>
        </div>
    );
};

export default function DashboardPage() {
    const { history, isLoaded } = useScanHistory();
    const { isLoaded: isDiscoveryLoaded } = useDiscovery();
    const { t } = useLanguage();

    if (!isLoaded || !isDiscoveryLoaded) {
        return <Loading />;
    }

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-in fade-in slide-in-from-bottom-6 duration-500">
                <div className="mb-6 p-8 bg-primary/5 rounded-full relative">
                    <Sparkles className="h-16 w-16 text-primary animate-pulse" />
                    <Scan className="absolute -bottom-1 -right-1 h-8 w-8 text-primary animate-bounce" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">{t('readyToStart')}</h2>
                <p className="mt-2 max-w-[240px] text-muted-foreground font-bold text-sm leading-relaxed">{t('dashboardWelcome')}</p>
                <Link href="/" className="mt-8 w-full max-w-[240px]">
                    <Button 
                        size="lg" 
                        className={cn(
                            "w-full rounded-2xl h-14 text-lg font-bold transition-all",
                            "bg-gradient-to-b from-[#22C55E] to-[#16A34A] text-white",
                            "shadow-lg active:scale-95"
                        )}
                    >
                        <ScanLine className="mr-2 h-6 w-6" />
                        {t('analyzeProduct')}
                    </Button>
                </Link>
            </div>
        );
    }

    const lastScan = history[0];

    return (
        <div className="px-4 py-6 space-y-8 max-w-2xl mx-auto pb-24 animate-in fade-in duration-500">
            <HealthOverview history={history} />
            
            <div className="text-center">
                <Link href="/">
                    <Button 
                        size="lg" 
                        className={cn(
                            "rounded-2xl h-16 px-12 text-lg font-bold transition-all",
                            "bg-gradient-to-b from-[#22C55E] to-[#16A34A] text-white",
                            "shadow-lg active:scale-95"
                        )}
                    >
                       <ScanLine className="mr-2 h-6 w-6" />
                        {t('analyzeProduct')}
                    </Button>
                </Link>
            </div>

            <QuickStats history={history} />

            <RecentScan lastScan={lastScan} />
        </div>
    );
}

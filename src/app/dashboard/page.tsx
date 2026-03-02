'use client';

import { useMemo } from 'react';
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

const HealthOverview = ({ history }: { history: ScanHistoryItem[] }) => {
    const greetingText = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    }, []);

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
        let message = "Start scanning to unlock personalized insights.";

        if (history.length < 3) return { message, scoreInfo };
        
        if (averageScore! > 75) message = "You're making consistently smart choices! ✨";
        else if (averageScore! < 45) message = "Let's aim for healthier options today.";
        else message = "Tracking your progress beautifully.";
        
        return { message, scoreInfo };

    }, [history, averageScore]);
    
    return (
        <div className="text-center animate-in fade-in slide-in-from-top-4 duration-500">
            <h1 className="text-3xl font-black tracking-tight">{greetingText}</h1>
            <p className="text-muted-foreground font-bold mt-1">{message}</p>
            
            <div className="mt-12">
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-2">Health Index</p>
                <div className="flex items-center justify-center gap-2">
                    <div className={cn("text-8xl font-black tracking-tighter", scoreInfo.textClassName)}>
                         {averageScore !== null ? <AnimatedCounter value={averageScore} /> : '-'}
                    </div>
                    {TrendIcon && <TrendIcon className={cn("h-8 w-8", trendColor)} />}
                </div>
                <div className={cn("text-xl font-black mt-2", scoreInfo.textClassName)}>{scoreInfo.label}</div>
            </div>
        </div>
    );
};

const QuickStats = ({ history }: { history: ScanHistoryItem[] }) => {
    const { scanStreak } = useScanHistory();
    const { discoveryCount } = useDiscovery();
    
    return (
        <div className="space-y-4">
            <h2 className="font-black text-lg uppercase tracking-widest text-muted-foreground text-center">Your Stats</h2>
            <Card className="border-2 shadow-sm rounded-3xl">
                <CardContent className="p-6 grid grid-cols-3 divide-x-2 divide-border text-center">
                    <div className="space-y-1">
                        <Scan className="mx-auto h-5 w-5 text-muted-foreground" />
                        <div className="text-2xl font-black">{history.length}</div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Scans</p>
                    </div>
                    <div className="space-y-1">
                        <Flame className="mx-auto h-5 w-5 text-muted-foreground" />
                        <div className="text-2xl font-black">{scanStreak}</div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Streak</p>
                    </div>
                    <div className="space-y-1">
                        <Compass className="mx-auto h-5 w-5 text-muted-foreground" />
                        <div className="text-2xl font-black">{discoveryCount}</div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Found</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
};

const RecentScan = ({ lastScan }: { lastScan: ScanHistoryItem }) => {
    const scoreInfo = getScoreInfo(lastScan.healthScore);
    return (
        <div className="space-y-4">
            <h2 className="font-black text-lg uppercase tracking-widest text-muted-foreground">Latest Analysis</h2>
            <Link href={lastScan.type === 'image' && lastScan.imageAnalysis ? '#' : `/product/${lastScan.barcode}`} passHref className="block transition-all active:scale-[0.98] rounded-3xl">
                <Card className="hover:bg-muted/50 border-2 shadow-sm rounded-3xl overflow-hidden">
                    <CardContent className="p-5 flex items-center gap-5">
                        {lastScan.imageUrl ? (
                            <div className="relative w-16 h-16 bg-white rounded-2xl border p-1 shadow-sm">
                                <Image src={lastScan.imageUrl} alt={lastScan.productName} fill className="object-contain p-2" />
                            </div>
                        ) : (
                            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center"><ScanLine className="w-8 h-8 text-muted-foreground" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-lg truncate leading-none mb-1">{lastScan.productName}</p>
                            <div className="flex items-center gap-2">
                                <div className={cn("text-sm font-black", scoreInfo.textClassName)}>{lastScan.healthScore} / 100</div>
                                <div className={cn("text-[10px] uppercase font-black px-3 py-0.5 rounded-full border-2", scoreInfo.badgeClassName)}>{scoreInfo.label}</div>
                            </div>
                        </div>
                        <ArrowRight className="text-muted-foreground w-6 h-6 flex-shrink-0" />
                    </CardContent>
                </Card>
            </Link>
        </div>
    );
};

export default function DashboardPage() {
    const { history, isLoaded } = useScanHistory();
    const { isLoaded: isDiscoveryLoaded } = useDiscovery();

    if (!isLoaded || !isDiscoveryLoaded) {
        return <Loading />;
    }

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="mb-8 p-10 bg-primary/5 rounded-full relative">
                    <Sparkles className="h-20 w-20 text-primary animate-pulse" />
                    <Scan className="absolute -bottom-2 -right-2 h-10 w-10 text-primary animate-bounce" />
                </div>
                <h2 className="text-4xl font-black tracking-tight">Ready to Start?</h2>
                <p className="mt-4 max-w-xs text-muted-foreground font-bold leading-relaxed">Scan your first product to unlock AI-powered health insights and personalized recommendations.</p>
                <Link href="/" className="mt-12 w-full max-w-xs">
                    <Button 
                        size="lg" 
                        className={cn(
                            "w-full rounded-full h-20 text-xl font-bold transition-all",
                            "bg-gradient-to-b from-[#22C55E] to-[#16A34A] text-white",
                            "shadow-[0_12px_24px_rgba(34,197,94,0.15)] border-t border-white/20",
                            "active:scale-95 active:shadow-sm"
                        )}
                    >
                        <ScanLine className="mr-3 h-8 w-8" />
                        Scan Now
                    </Button>
                </Link>
            </div>
        );
    }

    const lastScan = history[0];

    return (
        <div className="p-6 space-y-12 max-w-2xl mx-auto pb-32 animate-in fade-in duration-500">
            <HealthOverview history={history} />
            
            <div className="text-center">
                <Link href="/">
                    <Button 
                        size="lg" 
                        className={cn(
                            "rounded-full h-20 px-16 text-xl font-bold transition-all",
                            "bg-gradient-to-b from-[#22C55E] to-[#16A34A] text-white",
                            "shadow-[0_12px_24px_rgba(34,197,94,0.15)] border-t border-white/20",
                            "active:scale-95 active:shadow-sm"
                        )}
                    >
                       <ScanLine className="mr-3 h-8 w-8" />
                        Analyze Product
                    </Button>
                </Link>
            </div>

            <QuickStats history={history} />

            <RecentScan lastScan={lastScan} />
        </div>
    );
}

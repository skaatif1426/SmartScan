'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useDiscovery } from '@/hooks/useDiscovery';
import { usePreferences } from '@/contexts/AppProviders';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Lightbulb, Activity, Scan, Flame, Sparkles, ScanLine, Target, Compass, ArrowUp, ArrowDown, Minus } from 'lucide-react';
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
        
        if (averageScore! > 75) message = "You're making consistently smart food choices. Keep it up! ✨";
        else if (averageScore! < 45) message = "Let's focus on improving your food habits today. You can do it!";
        else message = "Log your meals by scanning to track your progress.";
        
        return { message, scoreInfo };

    }, [history, averageScore]);
    
    return (
        <div className="text-center animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold">{greetingText}</h1>
            <p className="text-muted-foreground mt-1">{message}</p>
            
            <div className="mt-6">
                <p className="text-sm text-muted-foreground">Your Food Score</p>
                <div className="flex items-center justify-center gap-2">
                    <div className={cn("text-7xl font-bold tracking-tighter", scoreInfo.textClassName)}>
                         {averageScore !== null ? <AnimatedCounter value={averageScore} /> : '-'}
                    </div>
                    {TrendIcon && <TrendIcon className={cn("h-8 w-8", trendColor)} />}
                </div>
                <div className={cn("text-lg font-semibold", scoreInfo.textClassName)}>{scoreInfo.label}</div>
            </div>
        </div>
    );
};

const ContinueWhereYouLeft = ({ lastScan }: { lastScan: ScanHistoryItem }) => {
    const scoreInfo = getScoreInfo(lastScan.healthScore);
    return (
        <div className="space-y-3">
            <h2 className="font-semibold text-lg">Continue where you left</h2>
            <Link href={`/product/${lastScan.barcode}`} passHref className="block transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-md active:scale-[0.99] rounded-lg">
                <Card className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                        {lastScan.imageUrl ? (
                            <Image src={lastScan.imageUrl} alt={lastScan.productName} width={48} height={48} className="rounded-md bg-white object-contain" />
                        ) : (
                            <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center"><ScanLine className="w-6 h-6 text-muted-foreground" /></div>
                        )}
                        <div className="flex-1">
                            <p className="font-semibold">{lastScan.productName}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className={cn("text-sm font-bold", scoreInfo.textClassName)}>{lastScan.healthScore} / 100</div>
                                <div className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", scoreInfo.badgeClassName)}>{scoreInfo.label}</div>
                            </div>
                        </div>
                        <ArrowRight className="text-muted-foreground" />
                    </CardContent>
                </Card>
            </Link>
        </div>
    );
};

const SmartActions = ({ history }: { history: ScanHistoryItem[] }) => {
    const { preferences } = usePreferences();

    const actions = useMemo(() => {
        const potentialActions = [];
        if (preferences.healthGoal === 'weight-loss') {
            potentialActions.push({
                title: "Focus on Low-Sugar",
                description: "For your goal, try scanning products with less than 10g of sugar.",
                icon: Target,
                href: "/profile"
            });
        } else if (preferences.healthGoal === 'muscle-gain') {
            potentialActions.push({
                title: "Find High-Protein Foods",
                description: "Scan some high-protein snacks to support your muscle gain goal.",
                icon: Target,
                href: "/profile"
            });
        } else {
             potentialActions.push({
                title: "Discover Something New",
                description: "Scan a product you've never tried before to expand your food diary.",
                icon: Sparkles,
                href: "/"
            });
        }

        if (history.length > 1) {
            const last = history[0].healthScore ?? 50;
            const secondLast = history[1].healthScore ?? 50;
            if (last > secondLast + 5) {
                potentialActions.push({
                    title: "Trending Up!",
                    description: `Your last scan was healthier than the one before. Great choice!`,
                    icon: Activity,
                    href: `/product/${history[0].barcode}`
                });
            }
        }

        const healthyItems = history.filter(item => (item.healthScore ?? 0) > 80).slice(0,2);
        if (healthyItems.length > 0 && !potentialActions.some(p => p.href.includes('product'))) {
             potentialActions.push({
                title: `Remember this healthy choice?`,
                description: `${healthyItems[0].productName} is an excellent option.`,
                icon: Lightbulb,
                href: `/product/${healthyItems[0].barcode}`
            });
        }

        return potentialActions.slice(0, 2);
    }, [history, preferences]);

    if (actions.length === 0) return null;

    return (
        <div className="space-y-3">
             <h2 className="font-semibold text-lg">Today's Focus</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {actions.map((action) => (
                    <Link href={action.href} key={action.title} className="block transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-md active:scale-[0.99] rounded-lg">
                        <Card className="h-full hover:bg-muted/50 transition-colors">
                            <CardContent className="p-4">
                                 <div className="flex items-start gap-4">
                                    <action.icon className="text-primary w-6 h-6 flex-shrink-0 mt-1"/>
                                    <div>
                                        <p className="font-semibold">{action.title}</p>
                                        <p className="text-sm text-muted-foreground">{action.description}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
             </div>
        </div>
    );
};

const QuickStats = ({ history }: { history: ScanHistoryItem[] }) => {
    const { scanStreak } = useScanHistory();
    const { discoveryCount } = useDiscovery();
    
    return (
        <div className="space-y-3">
            <h2 className="font-semibold text-lg">Your Progress</h2>
            <Card>
                <CardContent className="p-4 grid grid-cols-3 divide-x divide-border text-center">
                    <div>
                        <Scan className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
                        <div className="text-xl font-bold">{history.length}</div>
                        <p className="text-xs text-muted-foreground">Total Scans</p>
                    </div>
                    <div>
                        <Flame className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
                        <div className="text-xl font-bold">{scanStreak}</div>
                        <p className="text-xs text-muted-foreground">Day Streak</p>
                    </div>
                    <div>
                        <Compass className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
                        <div className="text-xl font-bold">{discoveryCount}</div>
                        <p className="text-xs text-muted-foreground">Discoveries</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
};

export default function DashboardPage() {
    const { history, isLoaded } = useScanHistory();
    const { isLoaded: isDiscoveryLoaded } = useDiscovery();

    if (!isLoaded || !isDiscoveryLoaded) {
        return <Loading />;
    }

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in fade-in duration-500">
                <div className="mb-6">
                    <Sparkles className="mx-auto h-16 w-16 text-primary" />
                </div>
                <h2 className="mt-4 text-2xl font-bold">Start your smart food journey</h2>
                <p className="mt-2 max-w-md text-muted-foreground">Scan your first product to unlock personalized insights, track your habits, and achieve your health goals.</p>
                <Link href="/" className="mt-8">
                    <Button size="lg" className="rounded-full h-14 px-10 text-lg shadow-lg animate-shadow-pulse">
                        <ScanLine className="mr-2 h-5 w-5" />
                        Scan Your First Item
                    </Button>
                </Link>
            </div>
        );
    }

    const lastScan = history[0];

    return (
        <div className="p-4 md:p-6 space-y-8">
            <HealthOverview history={history} />
            
            <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100">
                <Link href="/">
                    <Button size="lg" className="rounded-full h-14 px-12 text-lg shadow-primary/30 shadow-lg animate-shadow-pulse">
                       <ScanLine className="mr-2 h-5 w-5" />
                        Scan a New Item
                    </Button>
                </Link>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
                {lastScan && <ContinueWhereYouLeft lastScan={lastScan} />}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
                <SmartActions history={history} />
            </div>
            
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-400">
                <QuickStats history={history} />
            </div>
        </div>
    );
}

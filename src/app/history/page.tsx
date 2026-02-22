'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { History as HistoryIcon, ScanLine, Package, CheckCircle, AlertTriangle, ShieldQuestion, Rocket, Shield } from 'lucide-react';
import { useState, useMemo } from 'react';

import { useScanHistory } from '@/hooks/useScanHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/AppProviders';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { getScoreInfo } from '@/lib/scoring';
import type { ScanHistoryItem } from '@/lib/types';
import { Button } from '@/components/ui/button';

function HistoryImage({ item }: { item: { imageUrl?: string | null, productName: string } }) {
    const [imageError, setImageError] = useState(false);
    const isProblematicDomain = item.imageUrl?.includes('images.openfoodfacts.org');

    if (item.imageUrl && !imageError) {
        if (isProblematicDomain) {
            // eslint-disable-next-line @next/next/no-img-element
            return <img
                src={item.imageUrl}
                alt={item.productName}
                width={64}
                height={64}
                className="rounded-md object-contain bg-white w-16 h-16"
                onError={() => setImageError(true)}
                data-ai-hint="product image"
            />;
        }
        return (
            <Image
                src={item.imageUrl}
                alt={item.productName}
                width={64}
                height={64}
                className="rounded-md object-contain bg-white"
                onError={() => setImageError(true)}
                data-ai-hint="product image"
            />
        );
    }
    
    return (
         <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
            <Package className="w-8 h-8 text-muted-foreground" />
        </div>
    );
}

const SimpleHealthScore = ({ score }: { score: number }) => {
    const scoreInfo = getScoreInfo(score);
    return (
        <div className={cn(
            "inline-flex items-center justify-center rounded-full h-12 w-12 border-2 font-bold text-lg",
            scoreInfo.badgeClassName
        )}>
            <AnimatedCounter value={score} />
        </div>
    );
};

const HistorySummary = ({ history }: { history: ScanHistoryItem[] }) => {
    const summary = useMemo(() => {
        const scores = history.map(item => item.healthScore).filter((score): score is number => score !== undefined);
        if (scores.length < 3) return null;

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
        <div className={cn("p-3 mb-4 rounded-lg border-2 text-sm flex items-center gap-3", summaryClassName)}>
            <Icon className="h-5 w-5 flex-shrink-0" />
            <p className="font-medium">{tendency}</p>
        </div>
    );
};


export default function HistoryPage() {
  const { history } = useScanHistory();
  const { t } = useLanguage();
  const [sortBy, setSortBy] = useState<'recent' | 'healthiest'>('recent');
  const [filter, setFilter] = useState<'all' | 'known' | 'discovered'>('all');

  const sortedHistory = useMemo(() => {
      const historyCopy = [...history];
      if (sortBy === 'healthiest') {
          return historyCopy.sort((a, b) => (b.healthScore ?? -1) - (a.healthScore ?? -1));
      }
      return historyCopy; // Already sorted by recent
  }, [history, sortBy]);

  const filteredHistory = useMemo(() => {
    if (filter === 'known') {
        return sortedHistory.filter(item => !item.isDiscovery);
    }
    if (filter === 'discovered') {
        return sortedHistory.filter(item => item.isDiscovery);
    }
    return sortedHistory;
  }, [sortedHistory, filter]);


  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <HistoryIcon className="text-primary" />
            {t('historyTitle')}
          </CardTitle>
           <CardDescription>View, sort, and get insights from your scanned products.</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-10 animate-in fade-in zoom-in-95">
              <ScanLine className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">{t('historyEmpty')}</p>
              <Link href="/" className="mt-4 inline-block">
                <Button>Scan Your First Product</Button>
              </Link>
            </div>
          ) : (
            <>
                <HistorySummary history={history} />

                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
                        <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="known">Scanned</TabsTrigger>
                            <TabsTrigger value="discovered">Discovered</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as 'recent' | 'healthiest')}>
                        <TabsList>
                            <TabsTrigger value="recent">Recent</TabsTrigger>
                            <TabsTrigger value="healthiest">Healthiest</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <ul className="space-y-4">
                  {filteredHistory.map((item, index) => {
                     const itemScoreInfo = item.healthScore !== undefined ? getScoreInfo(item.healthScore) : null;
                     return (
                        <li 
                        key={`${item.barcode}-${item.scanDate}`}
                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                        style={{ animationDelay: `${Math.min(index * 80, 800)}ms` }}
                        >
                        <Link 
                            href={`/product/${item.barcode}`} 
                            className={cn(
                                "block p-4 border rounded-lg transition-all duration-200 ease-in-out active:scale-[0.98] hover:shadow-md",
                                item.isDiscovery ? "border-primary/50 bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
                            )}
                        >
                            <div className="flex items-center gap-4">
                            <HistoryImage item={item} />
                            <div className="flex-1">
                                <p className="font-semibold">{item.productName}</p>
                                <p className="text-sm text-muted-foreground">{item.brand}</p>
                                {item.isDiscovery ? (
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <Rocket className="h-4 w-4 text-primary" />
                                        <span className="text-xs font-semibold text-primary">Discovered by you</span>
                                    </div>
                                ) : itemScoreInfo && (
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <itemScoreInfo.icon className={cn("h-4 w-4", itemScoreInfo.textClassName)} />
                                        <span className={cn("text-xs font-semibold", itemScoreInfo.textClassName)}>{itemScoreInfo.label} Choice</span>
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                Scanned {formatDistanceToNow(new Date(item.scanDate), { addSuffix: true })}
                                </p>
                            </div>
                            {!item.isDiscovery && item.healthScore !== undefined && (
                                <div className="flex-shrink-0">
                                    <SimpleHealthScore score={item.healthScore} />
                                </div>
                            )}
                            </div>
                        </Link>
                        </li>
                     )
                    })}
                </ul>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

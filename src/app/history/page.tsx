'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { History as HistoryIcon, ScanLine, Package, CheckCircle, AlertTriangle, ShieldQuestion, Rocket } from 'lucide-react';
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
    if (item.imageUrl && !imageError) {
        return (
            <Image
                src={item.imageUrl}
                alt={item.productName}
                width={64}
                height={64}
                className="rounded-md object-contain bg-white"
                onError={() => setImageError(true)}
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

export default function HistoryPage() {
  const { history } = useScanHistory();
  const { t } = useLanguage();
  const [sortBy, setSortBy] = useState<'recent' | 'healthiest'>('recent');
  const [filter, setFilter] = useState<'all' | 'known' | 'discovered'>('all');

  const filteredHistory = useMemo(() => {
    let result = [...history];
    if (filter === 'known') result = result.filter(item => !item.isDiscovery);
    if (filter === 'discovered') result = result.filter(item => item.isDiscovery);
    if (sortBy === 'healthiest') result.sort((a, b) => (b.healthScore ?? -1) - (a.healthScore ?? -1));
    return result;
  }, [history, filter, sortBy]);


  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <HistoryIcon className="text-primary" />
            {t('historyTitle')}
          </CardTitle>
           <CardDescription>{t('historyDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-10 animate-in fade-in zoom-in-95 duration-300">
              <ScanLine className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">{t('historyEmpty')}</p>
              <Link href="/" className="mt-4 inline-block">
                <Button>{t('scanFirstProduct')}</Button>
              </Link>
            </div>
          ) : (
            <>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
                        <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                            <TabsTrigger value="all">{t('all')}</TabsTrigger>
                            <TabsTrigger value="known">{t('scanned')}</TabsTrigger>
                            <TabsTrigger value="discovered">{t('discovered')}</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as 'recent' | 'healthiest')}>
                        <TabsList>
                            <TabsTrigger value="recent">{t('recent')}</TabsTrigger>
                            <TabsTrigger value="healthiest">{t('healthiest')}</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <ul className="space-y-4">
                  {filteredHistory.map((item, index) => {
                     const itemScoreInfo = item.healthScore !== undefined ? getScoreInfo(item.healthScore) : null;
                     return (
                        <li key={`${item.barcode}-${item.scanDate}`} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <Link href={`/product/${item.barcode}`} className={cn("block p-4 border rounded-lg hover:bg-muted/50 transition-all", item.isDiscovery && "border-primary/50 bg-primary/5")}>
                            <div className="flex items-center gap-4">
                            <HistoryImage item={item} />
                            <div className="flex-1">
                                <p className="font-semibold">{item.productName}</p>
                                <p className="text-sm text-muted-foreground">{item.brand}</p>
                                {item.isDiscovery ? (
                                    <div className="flex items-center gap-1.5 mt-1.5 text-primary font-bold text-xs"><Rocket className="h-4 w-4" /> {t('discoveredByYou')}</div>
                                ) : itemScoreInfo && (
                                    <div className={cn("flex items-center gap-1.5 mt-1.5 font-bold text-xs", itemScoreInfo.textClassName)}><itemScoreInfo.icon className="h-4 w-4" /> {itemScoreInfo.label} {t('healthChoice')}</div>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(item.scanDate), { addSuffix: true })}</p>
                            </div>
                            {!item.isDiscovery && item.healthScore !== undefined && <SimpleHealthScore score={item.healthScore} />}
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

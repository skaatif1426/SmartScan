'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { History as HistoryIcon, ScanLine, Package, HeartPulse } from 'lucide-react';
import { useState } from 'react';

import { useScanHistory } from '@/hooks/useScanHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/AppProviders';
import { cn } from '@/lib/utils';

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

const getHealthScoreColorClass = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
};

const SimpleHealthScore = ({ score }: { score: number }) => (
    <div className={cn("font-bold text-lg", getHealthScoreColorClass(score))}>
        {score}
    </div>
);


export default function HistoryPage() {
  const { history } = useScanHistory();
  const { t } = useLanguage();

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <HistoryIcon className="text-primary" />
            {t('historyTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-10 animate-in fade-in zoom-in-95">
              <ScanLine className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">{t('historyEmpty')}</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {history.map((item, index) => (
                <li 
                  key={item.barcode}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${Math.min(index * 80, 800)}ms` }}
                >
                  <Link href={`/product/${item.barcode}`} className="block p-4 border rounded-lg hover:bg-muted transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]">
                    <div className="flex items-center gap-4">
                      <HistoryImage item={item} />
                      <div className="flex-1">
                        <p className="font-semibold">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">{item.brand}</p>
                         <p className="text-xs text-muted-foreground mt-1">
                           Scanned {formatDistanceToNow(new Date(item.scanDate), { addSuffix: true })}
                        </p>
                      </div>
                       {item.healthScore !== undefined && (
                        <div className="text-center px-2">
                            <SimpleHealthScore score={item.healthScore} />
                            <p className="text-xs text-muted-foreground">Score</p>
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

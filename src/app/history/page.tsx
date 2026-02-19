'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { History as HistoryIcon, ScanLine } from 'lucide-react';

import { useScanHistory } from '@/hooks/useScanHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/contexts/SettingsContext';

export default function HistoryPage() {
  const { history, isLoaded } = useScanHistory();
  const { t } = useSettings();

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
          {!isLoaded ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10">
              <ScanLine className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">{t('historyEmpty')}</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {history.map((item) => (
                <li key={item.barcode}>
                  <Link href={`/product/${item.barcode}`} className="block p-4 border rounded-lg hover:bg-muted transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-lg">
                    <div className="flex items-center gap-4">
                      <Image
                        src={item.imageUrl || 'https://picsum.photos/seed/history/100/100'}
                        alt={item.productName}
                        width={64}
                        height={64}
                        className="rounded-md object-contain bg-white"
                        data-ai-hint="product image"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">{item.brand}</p>
                         <p className="text-xs text-muted-foreground mt-1">
                           Scanned {formatDistanceToNow(new Date(item.scanDate), { addSuffix: true })}
                        </p>
                      </div>
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

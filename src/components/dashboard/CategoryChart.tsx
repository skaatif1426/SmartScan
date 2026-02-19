'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ScanHistoryItem } from '@/lib/types';
import { useLanguage } from '@/contexts/AppProviders';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false, loading: () => <Skeleton className="h-[250px] w-full" /> });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const LabelList = dynamic(() => import('recharts').then(mod => mod.LabelList), { ssr: false });

function CategoryChart({ history }: { history: ScanHistoryItem[] }) {
  const { t } = useLanguage();
  const chartData = useMemo(() => {
    const categoryCounts: { [key: string]: number } = {};
    
    history.forEach((item) => {
        const categories = item.categories?.split(',').map(c => c.trim()).filter(Boolean);
        const primaryCategory = categories?.[0] || 'Uncategorized';
        categoryCounts[primaryCategory] = (categoryCounts[primaryCategory] || 0) + 1;
    });

    return Object.entries(categoryCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

  }, [history]);
  
  if (history.length === 0) {
      return <p className="text-muted-foreground text-center py-8">Scan items to see category data.</p>;
  }

  const chartConfig = {
    count: {
      label: t('totalScans'),
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <BarChart 
        accessibilityLayer 
        data={chartData} 
        layout="vertical" 
        margin={{ left: 0, right: 40, top: 10, bottom: 10 }}
      >
        <XAxis type="number" hide />
        <YAxis 
            dataKey="name" 
            type="category" 
            tickLine={false} 
            axisLine={false} 
            tickMargin={8}
            width={130}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickFormatter={(value) => value.length > 18 ? `${value.substring(0, 18)}...` : value}
            />
        <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" layout="vertical" fill="var(--color-count)" radius={8} background={{ fill: 'hsl(var(--muted))', radius: 8 }}>
            <LabelList dataKey="count" position="right" offset={8} className="fill-foreground font-semibold" fontSize={14} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export default React.memo(CategoryChart);

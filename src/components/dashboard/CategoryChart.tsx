'use client';

import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, LabelList } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { ScanHistoryItem } from '@/lib/types';
import { useSettings } from '@/contexts/SettingsContext';

export default function CategoryChart({ history }: { history: ScanHistoryItem[] }) {
  const { t } = useSettings();
  const chartData = useMemo(() => {
    const categoryCounts: { [key: string]: number } = {};
    
    history.forEach((item) => {
        const categories = item.categories?.split(',').map(c => c.trim()).filter(Boolean);
        // Use the first category as the primary one, or 'Uncategorized' as a fallback.
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

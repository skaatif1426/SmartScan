'use client';

import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { ScanHistoryItem } from '@/lib/types';

export default function CategoryChart({ history }: { history: ScanHistoryItem[] }) {
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

  return (
    <ChartContainer config={{
        count: {
            label: 'Scans',
            color: 'hsl(var(--primary))',
        },
    }} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
        <XAxis type="number" hide />
        <YAxis 
            dataKey="name" 
            type="category" 
            tickLine={false} 
            axisLine={false} 
            tickMargin={10}
            width={80}
            />
        <Tooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

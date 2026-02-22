'use client';

import React, { useMemo, useState } from 'react';
import type { ScanHistoryItem } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Award, CheckCircle, Clock, Compass, Layers, Lightbulb, TrendingUp } from 'lucide-react';

type Insight = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
};

function useSmartInsights(history: ScanHistoryItem[]) {
    return useMemo(() => {
        const generatedInsights: Insight[] = [];
        if (history.length < 3) {
            return []; // Not enough data for meaningful insights
        }

        // 1. Top Category Insight
        const categoryCounts: { [key: string]: number } = {};
        let categorizedItems = 0;
        history.forEach(item => {
            const primaryCategory = item.categories?.split(',')[0]?.trim();
            if (primaryCategory && primaryCategory !== 'Other') {
                categorizedItems++;
                categoryCounts[primaryCategory] = (categoryCounts[primaryCategory] || 0) + 1;
            }
        });
        if (Object.keys(categoryCounts).length > 0) {
            const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
            const percentage = Math.round((topCategory[1] / categorizedItems) * 100);
            if (topCategory[1] > 1) {
                 generatedInsights.push({
                    id: 'top-category',
                    title: `You mostly scan ${topCategory[0]}`,
                    description: `${percentage}% of your scans are in this category.`,
                    icon: Layers,
                });
            }
        }

        // 2. Time of Day Insight
        const timeCounts = { Morning: 0, Afternoon: 0, Evening: 0, 'Late Night': 0 };
        history.forEach(item => {
            const hour = new Date(item.scanDate).getHours();
            if (hour >= 5 && hour < 12) timeCounts.Morning++;
            else if (hour >= 12 && hour < 18) timeCounts.Afternoon++;
            else if (hour >= 18 && hour < 22) timeCounts.Evening++;
            else timeCounts['Late Night']++;
        });
        const topTime = Object.entries(timeCounts).sort((a, b) => b[1] - a[1])[0];
        if (topTime[1] > history.length / 3) {
            generatedInsights.push({
                id: 'time-of-day',
                title: `You're an ${topTime[0]} scanner`,
                description: `Most of your scans happen in the ${topTime[0].toLowerCase()}.`,
                icon: Clock,
            });
        }

        // 3. Brand Preference
        const brandCounts: { [key: string]: number } = {};
        history.forEach(item => {
            if (item.brand && item.brand !== 'Unknown Brand' && item.brand !== 'AI Estimate') {
                brandCounts[item.brand] = (brandCounts[item.brand] || 0) + 1;
            }
        });
        if (Object.keys(brandCounts).length > 1) {
            const topBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0];
            if (topBrand[1] > 2) {
                generatedInsights.push({
                    id: 'brand-preference',
                    title: `Brand preference: ${topBrand[0]}`,
                    description: `You frequently scan products from this brand.`,
                    icon: Award,
                });
            }
        }

        // 4. Discovery Insight
        const discoveryCount = history.filter(item => item.isDiscovery).length;
        if (discoveryCount > 0) {
            const percentage = Math.round((discoveryCount / history.length) * 100);
            generatedInsights.push({
                id: 'discovery-rate',
                title: `You're an explorer!`,
                description: `${percentage}% of your scans are new discoveries.`,
                icon: Compass,
            });
        }

        // 5. Health Pattern
        const scores = history.map(item => item.healthScore).filter((s): s is number => s !== undefined);
        if (scores.length > 5) {
            const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            if (avgScore < 45) {
                generatedInsights.push({
                    id: 'health-pattern-low',
                    title: 'Health Pattern Noticed',
                    description: 'Your average scan has a low health score. Look for healthier alternatives.',
                    icon: AlertTriangle,
                });
            } else if (avgScore > 75) {
                 generatedInsights.push({
                    id: 'health-pattern-high',
                    title: 'Great Choices!',
                    description: 'The majority of your scans are products with high health scores.',
                    icon: CheckCircle,
                });
            }
        }
        
        return generatedInsights.slice(0, 5); // Limit to max 5 insights
    }, [history]);
}


function AiSmartInsights({ history }: { history: ScanHistoryItem[] }) {
    const insights = useSmartInsights(history);
    const [showAll, setShowAll] = useState(false);

    if (insights.length === 0) {
        return (
            <Card className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-400">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Lightbulb /> AI Smart Insights</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 font-semibold">Unlock Your Smart Insights</p>
                        <p className="mt-1 text-sm text-muted-foreground">Scan a few more items to get personalized feedback on your habits.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const displayedInsights = showAll ? insights : insights.slice(0, 3);

    return (
        <Card className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-400">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lightbulb /> AI Smart Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {displayedInsights.map((insight, index) => (
                    <div 
                        key={insight.id} 
                        className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg animate-in fade-in slide-in-from-bottom-4 duration-300"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="p-2 bg-background rounded-full border">
                          <insight.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">{insight.title}</p>
                            <p className="text-sm text-muted-foreground">{insight.description}</p>
                        </div>
                    </div>
                ))}
                {insights.length > 3 && (
                    <Button variant="ghost" className="w-full" onClick={() => setShowAll(!showAll)}>
                        {showAll ? 'Show Less' : 'Show More'}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

export default React.memo(AiSmartInsights);

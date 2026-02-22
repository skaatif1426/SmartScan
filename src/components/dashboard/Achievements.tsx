'use client';

import React, { useMemo } from 'react';
import { Award, Bot, BrainCircuit, CalendarDays, Camera, CheckCircle, Compass, Flame, Heart, Layers, ScanLine, ShieldCheck, Trophy } from 'lucide-react';
import type { ScanHistoryItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { useDiscovery } from '@/hooks/useDiscovery';
import { useScanHistory } from '@/hooks/useScanHistory';

const achievementTiers = {
  scanCount: [
    { id: 'scan-1', name: 'First Scan', description: 'Scan your first item.', value: 1, icon: ScanLine },
    { id: 'scan-10', name: 'Scanner', description: 'Scan 10 items.', value: 10, icon: ScanLine },
    { id: 'scan-50', name: 'Super Scanner', description: 'Scan 50 items.', value: 50, icon: Camera },
    { id: 'scan-100', name: 'Scan Master', description: 'Scan 100 items.', value: 100, icon: Trophy },
  ],
  discovery: [
    { id: 'discovery-1', name: 'Explorer', description: 'Discover your first product.', value: 1, icon: Compass },
    { id: 'discovery-5', name: 'Pathfinder', description: 'Discover 5 new products.', value: 5, icon: Compass },
    { id: 'discovery-10', name: 'Data Contributor', description: 'Discover 10 new products.', value: 10, icon: BrainCircuit },
    { id: 'discovery-25', name: 'AI Trainer', description: 'Discover 25 new products.', value: 25, icon: Bot },
  ],
  streak: [
    { id: 'streak-3', name: 'On Fire', description: 'Maintain a 3-day scan streak.', value: 3, icon: Flame },
    { id: 'streak-7', name: 'Inferno', description: 'A 7-day scan streak.', value: 7, icon: Flame },
    { id: 'streak-30', name: 'Unstoppable', description: 'A 30-day scan streak.', value: 30, icon: CalendarDays },
  ],
  categories: [
    { id: 'diverse-5', name: 'Diverse Palette', description: 'Scan items from 5 different categories.', value: 5, icon: Layers },
    { id: 'diverse-10', name: 'Food Critic', description: 'Scan items from 10 different categories.', value: 10, icon: Layers },
  ],
  healthyChoice: [
    { id: 'healthy-10', name: 'Good Start', description: 'Scan 10 healthy items (score > 75).', value: 10, icon: Heart },
    { id: 'healthy-25', name: 'Health Advocate', description: 'Scan 25 healthy items.', value: 25, icon: Heart },
    { id: 'healthy-50', name: 'Wellness Champion', description: 'Scan 50 healthy items.', value: 50, icon: ShieldCheck },
  ],
};

const categoryTitles = {
  scanCount: 'Scanning',
  discovery: 'Exploration',
  streak: 'Consistency',
  categories: 'Variety',
  healthyChoice: 'Healthy Choices',
};

const typeToStatMap: { [key in keyof typeof achievementTiers]: keyof ReturnType<typeof useAchievementStats> } = {
    scanCount: 'scanCount',
    discovery: 'discoveryCount',
    streak: 'scanStreak',
    categories: 'categoryCount',
    healthyChoice: 'healthyScans',
};

function useAchievementStats(history: ScanHistoryItem[]) {
    const { discoveryCount } = useDiscovery();
    const { scanStreak } = useScanHistory();

    return useMemo(() => {
        const scanCount = history.length;
        const uniqueCategories = new Set<string>();
        history.forEach(item => {
            const categories = item.categories?.split(',').map(c => c.trim().toLowerCase()).filter(Boolean);
            if (categories) {
                categories.forEach(cat => uniqueCategories.add(cat));
            }
        });
        const categoryCount = uniqueCategories.size;
        const healthyScans = history.filter(item => item.healthScore && item.healthScore > 75).length;

        return {
            scanCount,
            discoveryCount,
            scanStreak,
            categoryCount,
            healthyScans,
        };
    }, [history, discoveryCount, scanStreak]);
}

function AchievementItem({ achievement, currentValue }: { achievement: typeof achievementTiers.scanCount[0], currentValue: number }) {
    const isUnlocked = currentValue >= achievement.value;
    const Icon = achievement.icon;
    
    return (
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "relative w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                        isUnlocked ? 'border-primary bg-primary/10' : 'border-dashed bg-muted opacity-60'
                    )}>
                        <Icon className={cn("w-8 h-8 transition-colors", isUnlocked ? 'text-primary' : 'text-muted-foreground/80')} />
                        {isUnlocked && <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 bg-background text-green-500 rounded-full" />}
                    </div>
                </TooltipTrigger>
                <TooltipContent className="w-48">
                    <p className="font-bold">{achievement.name}</p>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {!isUnlocked && (
                         <div className="mt-2 w-full">
                            <p className="text-xs font-semibold text-primary">{currentValue} / {achievement.value}</p>
                            <Progress value={(currentValue / achievement.value) * 100} className="h-1 mt-1" />
                        </div>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

function Achievements({ history }: { history: ScanHistoryItem[] }) {
  const stats = useAchievementStats(history);
  const totalAchievements = Object.values(achievementTiers).flat().length;
  const unlockedAchievements = Object.entries(achievementTiers).reduce((acc, [key, tiers]) => {
      const statKey = typeToStatMap[key as keyof typeof achievementTiers];
      const currentValue = stats[statKey];
      return acc + tiers.filter(t => currentValue >= t.value).length;
  }, 0);


  if (stats.scanCount === 0 && stats.discoveryCount === 0) {
      return (
          <div className="text-center text-muted-foreground p-4">
              <p>Scan products to start unlocking achievements!</p>
          </div>
      )
  }

  return (
    <div className="space-y-6">
       <div className="text-center">
            <p className="text-xl font-bold">{unlockedAchievements} / {totalAchievements}</p>
            <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
            <Progress value={(unlockedAchievements / totalAchievements) * 100} className="h-2 mt-2 max-w-sm mx-auto" />
        </div>
      {Object.entries(achievementTiers).map(([key, tiers]) => {
        const categoryKey = key as keyof typeof achievementTiers;
        const statKey = typeToStatMap[categoryKey];
        const currentValue = stats[statKey];

        // Do not show a category if the user hasn't even started it
        if (currentValue === 0 && !['scanCount', 'discovery'].includes(categoryKey)) {
            return null;
        }

        return (
            <div key={key}>
                <h3 className="font-semibold mb-2 text-md">{categoryTitles[categoryKey]}</h3>
                <div className="flex flex-wrap gap-4">
                    {tiers.map(ach => (
                        <AchievementItem key={ach.id} achievement={ach} currentValue={currentValue} />
                    ))}
                </div>
            </div>
        )
      })}
    </div>
  );
}

export default React.memo(Achievements);

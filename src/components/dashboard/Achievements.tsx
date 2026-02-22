'use client';

import React, { useMemo } from 'react';
import { Award, Bot, BrainCircuit, CheckCircle, Compass, Flame, Heart, Layers, Map, Star } from 'lucide-react';
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
    { id: 'scan-1', name: 'First Scan', description: 'Scan your first item.', value: 1, icon: Award },
    { id: 'scan-10', name: 'Scanner Pro', description: 'Scan 10 items.', value: 10, icon: Star },
    { id: 'scan-50', name: 'Master Scanner', description: 'Scan 50 items. Incredible!', value: 50, icon: Star },
  ],
  discovery: [
    { id: 'discovery-1', name: 'Explorer 🧭', description: 'Discover your first product.', value: 1, icon: Compass },
    { id: 'discovery-5', name: 'Pathfinder 🗺️', description: 'Discover 5 new products.', value: 5, icon: Map },
    { id: 'discovery-10', name: 'Data Builder 🧠', description: 'Discover 10 new products.', value: 10, icon: BrainCircuit },
    { id: 'discovery-25', name: 'AI Trainer 🤖', description: 'Discover 25 new products and help train the AI.', value: 25, icon: Bot },
  ],
  streak: [
    { id: 'streak-3', name: 'On Fire!', description: 'Maintain a 3-day scan streak.', value: 3, icon: Flame },
    { id: 'streak-7', name: 'Inferno', description: 'A 7-day scan streak! You\'re unstoppable.', value: 7, icon: Flame },
  ],
  categories: [
    { id: 'diverse-5', name: 'Diverse Palette', description: 'Scan items from 5 different categories.', value: 5, icon: Layers },
    { id: 'diverse-10', name: 'Food Critic', description: 'Scan 10 different categories.', value: 10, icon: Layers },
  ],
  healthyChoice: [
    { id: 'healthy-10', name: 'Good Start', description: 'Scan 10 healthy items (score > 75).', value: 10, icon: Heart },
    { id: 'healthy-25', name: 'Health Advocate', description: 'Scan 25 healthy items.', value: 25, icon: Award },
  ],
};

const allAchievements = Object.values(achievementTiers).flat();

function Achievements({ history }: { history: ScanHistoryItem[] }) {
  const { discoveryCount } = useDiscovery();
  const { scanStreak } = useScanHistory();

  const stats = useMemo(() => {
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
      discovery: discoveryCount,
      streak: scanStreak,
      categories: categoryCount,
      healthyChoice: healthyScans,
    };
  }, [history, discoveryCount, scanStreak]);

  if (history.length === 0 && discoveryCount === 0) {
      return (
          <div className="text-center text-muted-foreground p-4">
              <p>Scan products to start unlocking achievements!</p>
          </div>
      )
  }

  const typeToStatMap: { [key in keyof typeof achievementTiers]: keyof typeof stats } = {
    scanCount: 'scanCount',
    discovery: 'discovery',
    streak: 'streak',
    categories: 'categories',
    healthyChoice: 'healthyChoice',
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {allAchievements.map(ach => {
        const type = Object.keys(achievementTiers).find(key => achievementTiers[key as keyof typeof achievementTiers].some(a => a.id === ach.id)) as keyof typeof achievementTiers | undefined;
        
        if (!type) return null;

        const statKey = typeToStatMap[type];
        const currentValue = stats[statKey];
        const isUnlocked = currentValue >= ach.value;
        const Icon = ach.icon;

        let progressContent = null;
        if (!isUnlocked) {
            const tiers = achievementTiers[type];
            const highestUnlockedTier = [...tiers].reverse().find(t => currentValue >= t.value);
            const currentAchIndex = tiers.findIndex(t => t.id === ach.id);
            const isNextGoal = (!highestUnlockedTier && currentAchIndex === 0) || (highestUnlockedTier && currentAchIndex === tiers.findIndex(t => t.id === highestUnlockedTier.id) + 1);

            if (isNextGoal) {
                progressContent = (
                    <div className="mt-2 w-full">
                        <p className="text-xs font-semibold text-primary">{currentValue} / {ach.value}</p>
                        <Progress value={(currentValue / ach.value) * 100} className="h-1 mt-1" />
                    </div>
                );
            }
        }

        return (
            <TooltipProvider key={ach.id} delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className={cn("relative w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300", isUnlocked ? 'border-primary bg-primary/10' : 'border-dashed bg-muted')}>
                           <Icon className={cn("w-8 h-8 transition-colors", isUnlocked ? 'text-primary' : 'text-muted-foreground/50')}/>
                            {isUnlocked && <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 bg-background text-green-500 rounded-full"/>}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="w-48">
                        <p className="font-bold">{ach.name}</p>
                        <p className="text-sm text-muted-foreground">{ach.description}</p>
                        {progressContent}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
      })}
    </div>
  );
}

export default React.memo(Achievements);

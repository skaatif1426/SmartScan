'use client';

import React, { useMemo } from 'react';
import { Award, CheckCircle, Compass, Flame, Layers } from 'lucide-react';
import type { ScanHistoryItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { differenceInCalendarDays } from 'date-fns';
import { useDiscovery } from '@/hooks/useDiscovery';


const allAchievements = [
  { id: 'scan-1', name: 'First Scan!', description: 'You scanned your first item.', type: 'scanCount', value: 1, icon: Award },
  { id: 'scan-10', name: 'Scanner Pro', description: 'You\'ve scanned 10 items.', type: 'scanCount', value: 10, icon: Award },
  { id: 'scan-50', name: 'Master Scanner', description: '50 items scanned. Incredible!', type: 'scanCount', value: 50, icon: Award },
  { id: 'streak-3', name: 'On Fire!', description: 'You\'ve maintained a 3-day scan streak.', type: 'streak', value: 3, icon: Flame },
  { id: 'diverse-5', name: 'Diverse Palette', description: 'You\'ve scanned items from 5 different categories.', type: 'categories', value: 5, icon: Layers },
  { id: 'discovery-1', name: 'Explorer', description: 'You discovered a product not yet in our database.', type: 'discovery', value: 1, icon: Compass },
];

function calculateScanStreak(history: ScanHistoryItem[]): number {
    if (history.length === 0) return 0;
    let streak = 0;
    const uniqueDaysScanned = [...new Set(history.map(scan => new Date(scan.scanDate).setHours(0, 0, 0, 0)))].sort((a, b) => b - a);
    if (uniqueDaysScanned.length === 0) return 0;

    const today = new Date();
    const mostRecentScanDate = new Date(uniqueDaysScanned[0]);

    if (differenceInCalendarDays(today, mostRecentScanDate) > 1) {
        return 0;
    }
    
    streak = 1;
    for (let i = 1; i < uniqueDaysScanned.length; i++) {
        const dayDiff = differenceInCalendarDays(new Date(uniqueDaysScanned[i-1]), new Date(uniqueDaysScanned[i]));
        if (dayDiff === 1) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}


function Achievements({ history }: { history: ScanHistoryItem[] }) {
  const { discoveryCount } = useDiscovery();

  const unlockedAchievements = useMemo(() => {
    const scanCount = history.length;
    const streak = calculateScanStreak(history);
    
    const uniqueCategories = new Set<string>();
    history.forEach(item => {
        const categories = item.categories?.split(',').map(c => c.trim().toLowerCase()).filter(Boolean);
        if (categories) {
            categories.forEach(cat => uniqueCategories.add(cat));
        }
    });
    const categoryCount = uniqueCategories.size;

    return allAchievements.filter(ach => {
        switch (ach.type) {
            case 'scanCount':
                return scanCount >= ach.value;
            case 'streak':
                return streak >= ach.value;
            case 'categories':
                return categoryCount >= ach.value;
            case 'discovery':
                return discoveryCount >= ach.value;
            default:
                return false;
        }
    });
  }, [history, discoveryCount]);

  if (history.length === 0 && discoveryCount === 0) {
      return (
          <div className="text-center text-muted-foreground p-4">
              <p>Scan products to start unlocking achievements!</p>
          </div>
      )
  }

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {allAchievements.map(ach => {
        const isUnlocked = unlockedAchievements.some(unlocked => unlocked.id === ach.id);
        const Icon = ach.icon;

        return (
            <TooltipProvider key={ach.id} delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className={cn("relative w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300", isUnlocked ? 'border-primary bg-primary/10' : 'border-dashed bg-muted')}>
                           <Icon className={cn("w-8 h-8 transition-colors", isUnlocked ? 'text-primary' : 'text-muted-foreground/50')}/>
                            {isUnlocked && <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 bg-background text-green-500 rounded-full"/>}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="font-bold">{ach.name}</p>
                        <p className="text-sm text-muted-foreground">{ach.description}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
      })}
    </div>
  );
}

export default React.memo(Achievements);

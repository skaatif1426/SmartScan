'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { Award, CheckCircle } from 'lucide-react';
import type { ScanHistoryItem } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


const allAchievements = [
  { id: 'scan-1', name: 'First Scan!', description: 'You scanned your first item.', minScans: 1, imageId: 'achievement-1' },
  { id: 'scan-10', name: 'Scanner Pro', description: 'You\'ve scanned 10 items.', minScans: 10, imageId: 'achievement-10' },
  { id: 'scan-50', name: 'Master Scanner', description: '50 items scanned. Incredible!', minScans: 50, imageId: 'achievement-50' },
];

export default function Achievements({ history }: { history: ScanHistoryItem[] }) {
  const unlockedAchievements = useMemo(() => {
    const scanCount = history.length;
    return allAchievements.filter(ach => scanCount >= ach.minScans);
  }, [history]);

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {allAchievements.map(ach => {
        const isUnlocked = unlockedAchievements.some(unlocked => unlocked.id === ach.id);
        const image = PlaceHolderImages.find(img => img.id === ach.imageId);

        return (
            <TooltipProvider key={ach.id}>
                <Tooltip>
                    <TooltipTrigger>
                        <div className={cn("relative w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all", isUnlocked ? 'border-primary bg-primary/10' : 'border-dashed bg-muted')}>
                            {image && <Image src={image.imageUrl} alt={ach.name} width={48} height={48} className={cn("rounded-full transition-opacity", isUnlocked ? 'opacity-100' : 'opacity-20 grayscale')}/>}
                            {!image && <Award className={cn("w-8 h-8", isUnlocked ? 'text-primary' : 'text-muted-foreground')}/>}
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

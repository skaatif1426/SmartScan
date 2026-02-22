'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from './use-toast';
import type { DiscoveryItem } from '@/lib/types';
import { differenceInCalendarDays } from 'date-fns';

const OLD_DISCOVERY_KEY = 'nutriscan-discoveries';
const DISCOVERY_KEY = 'smartscan-discoveries';

const contributorLevels = [
    { title: 'AI Trainer', icon: '🤖', minDiscoveries: 25 },
    { title: 'Contributor', icon: '🧠', minDiscoveries: 10 },
    { title: 'Explorer', icon: '🧭', minDiscoveries: 3 },
    { title: 'Beginner', icon: '🌱', minDiscoveries: 0 }
];

function getContributorLevel(discoveryCount: number) {
    return contributorLevels.find(level => discoveryCount >= level.minDiscoveries)!;
}

function calculateDiscoveryStreak(discoveries: DiscoveryItem[]): number {
    if (discoveries.length === 0) return 0;
    
    const uniqueDays = [...new Set(discoveries.map(d => new Date(d.date).setHours(0, 0, 0, 0)))].sort((a, b) => b - a);
    if (uniqueDays.length === 0) return 0;

    const today = new Date();
    const mostRecentDate = new Date(uniqueDays[0]);

    if (differenceInCalendarDays(today, mostRecentDate) > 1) {
        return 0;
    }
    
    let streak = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
        const dayDiff = differenceInCalendarDays(new Date(uniqueDays[i-1]), new Date(uniqueDays[i]));
        if (dayDiff === 1) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}


export function useDiscovery() {
    const [discoveries, setDiscoveries] = useState<DiscoveryItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        try {
            const oldItem = window.localStorage.getItem(OLD_DISCOVERY_KEY);
            if (oldItem) {
                const oldDiscoveries = JSON.parse(oldItem);
                setDiscoveries(oldDiscoveries);
                window.localStorage.setItem(DISCOVERY_KEY, JSON.stringify(oldDiscoveries));
                window.localStorage.removeItem(OLD_DISCOVERY_KEY);
            } else {
                const item = window.localStorage.getItem(DISCOVERY_KEY);
                if (item) {
                    setDiscoveries(JSON.parse(item));
                }
            }
        } catch (e) { 
            console.warn('Error reading discoveries from localStorage', e);
        }
        setIsLoaded(true);
    }, []);

    const addDiscovery = useCallback((barcode: string) => {
        if (discoveries.some(d => d.barcode === barcode)) {
            return;
        }

        try {
            const newDiscovery: DiscoveryItem = { barcode, date: new Date().toISOString() };
            const newDiscoveries = [...discoveries, newDiscovery];
            const prevCount = discoveries.length;
            
            setDiscoveries(newDiscoveries);
            window.localStorage.setItem(DISCOVERY_KEY, JSON.stringify(newDiscoveries));

            const newCount = newDiscoveries.length;
            let achievementToast: { title: string; description: string } | null = null;
            
            if (newCount === 1 && prevCount < 1) {
                achievementToast = { title: 'Achievement Unlocked', description: `You've earned "Explorer"` };
            } else if (newCount === 5 && prevCount < 5) {
                achievementToast = { title: 'Achievement Unlocked', description: `You've earned "Pathfinder"` };
            } else if (newCount === 10 && prevCount < 10) {
                achievementToast = { title: 'Achievement Unlocked', description: `You've earned "Data Contributor"` };
            } else if (newCount === 25 && prevCount < 25) {
                achievementToast = { title: 'Achievement Unlocked', description: `You've earned "AI Trainer"` };
            }
            
            if (achievementToast) {
                toast(achievementToast);
            }
        } catch (e) {
            console.warn('Failed to save discovery to localStorage', e);
        }
    }, [discoveries, toast]);

    const discoveryCount = discoveries.length;
    const discoveryStreak = useMemo(() => calculateDiscoveryStreak(discoveries), [discoveries]);
    const contributorLevel = useMemo(() => getContributorLevel(discoveryCount), [discoveryCount]);

    return { discoveryCount, addDiscovery, isLoaded, discoveryStreak, contributorLevel };
}

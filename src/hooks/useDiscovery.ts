'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from './use-toast';
import type { DiscoveryItem } from '@/lib/types';
import { differenceInCalendarDays } from 'date-fns';

const DISCOVERY_KEY = 'nutriscan-discoveries';

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
            const item = window.localStorage.getItem(DISCOVERY_KEY);
            if (item) {
                // Add validation in a real app, e.g. with Zod
                setDiscoveries(JSON.parse(item));
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
            const wasFirstDiscovery = discoveries.length === 0;
            const newDiscovery: DiscoveryItem = { barcode, date: new Date().toISOString() };
            const newDiscoveries = [...discoveries, newDiscovery];
            
            setDiscoveries(newDiscoveries);
            window.localStorage.setItem(DISCOVERY_KEY, JSON.stringify(newDiscoveries));

            if (wasFirstDiscovery) {
                 toast({
                    title: '🎉 Achievement Unlocked!',
                    description: `You've earned the "Explorer I" achievement.`,
                });
            } else if (newDiscoveries.length === 5) {
                toast({
                    title: '🎉 Achievement Unlocked!',
                    description: `You've earned the "Explorer II" achievement.`,
                });
            } else if (newDiscoveries.length === 10) {
                 toast({
                    title: '🎉 Achievement Unlocked!',
                    description: `You've earned the "Explorer Pro" achievement.`,
                });
            }
        } catch (e) {
            console.warn('Failed to save discovery to localStorage', e);
        }
    }, [discoveries, toast]);

    const discoveryCount = discoveries.length;
    const discoveryStreak = useMemo(() => calculateDiscoveryStreak(discoveries), [discoveries]);

    return { discoveryCount, addDiscovery, isLoaded, discoveryStreak };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

const DISCOVERY_KEY = 'nutriscan-discoveries';

export function useDiscovery() {
    const [discoveries, setDiscoveries] = useState<string[]>([]); // array of barcodes
    const [isLoaded, setIsLoaded] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        try {
            const item = window.localStorage.getItem(DISCOVERY_KEY);
            if (item) {
                setDiscoveries(JSON.parse(item));
            }
        } catch (e) { 
            console.warn('Error reading discoveries from localStorage', e);
        }
        setIsLoaded(true);
    }, []);

    const addDiscovery = useCallback((barcode: string) => {
        if (discoveries.includes(barcode)) {
            return;
        }

        try {
            const wasFirstDiscovery = discoveries.length === 0;
            const newDiscoveries = [...discoveries, barcode];
            setDiscoveries(newDiscoveries);
            window.localStorage.setItem(DISCOVERY_KEY, JSON.stringify(newDiscoveries));

            if (wasFirstDiscovery) {
                 toast({
                    title: '🎉 Achievement Unlocked!',
                    description: `You've earned the "Explorer" achievement.`,
                });
            }
        } catch (e) {
            console.warn('Failed to save discovery to localStorage', e);
        }
    }, [discoveries, toast]);

    const discoveryCount = discoveries.length;

    return { discoveryCount, addDiscovery, isLoaded };
}

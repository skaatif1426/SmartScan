'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ScanHistoryItem } from '@/lib/types';
import { differenceInCalendarDays } from 'date-fns';
import { usePreferences } from '@/contexts/AppProviders';

const OLD_HISTORY_KEY = 'nutriscan-history';
const HISTORY_KEY = 'smartscan-history';
const MAX_HISTORY_ITEMS = 100;

function calculateScanStreak(history: ScanHistoryItem[]): number {
    if (history.length === 0) return 0;
    
    const uniqueDaysScanned = [...new Set(history.map(scan => new Date(scan.scanDate).setHours(0, 0, 0, 0)))].sort((a, b) => b - a);
    if (uniqueDaysScanned.length === 0) return 0;

    const today = new Date();
    const mostRecentScanDate = new Date(uniqueDaysScanned[0]);

    if (differenceInCalendarDays(today, mostRecentScanDate) > 1) {
        return 0;
    }
    
    let streak = 1;
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


export function useScanHistory() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { preferences, isSettingsLoaded } = usePreferences();

  useEffect(() => {
    try {
      const oldHistoryItem = window.localStorage.getItem(OLD_HISTORY_KEY);
      if (oldHistoryItem) {
          const oldHistory = JSON.parse(oldHistoryItem);
          setHistory(oldHistory);
          window.localStorage.setItem(HISTORY_KEY, JSON.stringify(oldHistory));
          window.localStorage.removeItem(OLD_HISTORY_KEY);
      } else {
          const item = window.localStorage.getItem(HISTORY_KEY);
          if (item) {
            setHistory(JSON.parse(item));
          } else {
            setHistory([]);
          }
      }
    } catch (error) {
      console.warn('Error reading scan history from localStorage', error);
      setHistory([]);
    }
    setIsLoaded(true);
  }, []);

  const addScanToHistory = useCallback((item: Omit<ScanHistoryItem, 'scanDate'>) => {
    try {
      setHistory((prev) => {
        const newHistoryItem: ScanHistoryItem = {
          ...item,
          scanDate: new Date().toISOString(),
        };

        // Avoid duplicates by removing existing item with same barcode
        const filteredHistory = prev.filter(h => h.barcode !== item.barcode);
        
        const updatedHistory = [newHistoryItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        return updatedHistory;
      });
    } catch (error) {
      console.warn('Error saving scan history to localStorage', error);
    }
  }, []);

  const clearHistory = useCallback(() => {
    try {
      setHistory([]);
      window.localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.warn('Error clearing scan history from localStorage', error);
    }
  }, []);

  const scanStreak = useMemo(() => calculateScanStreak(history), [history]);

  useEffect(() => {
    if (isSettingsLoaded) {
      const now = new Date();
      const retentionDays = {
        '30d': 30,
        '90d': 90,
        'forever': Infinity
      }[preferences.dataRetention];

      if (retentionDays !== Infinity) {
        setHistory(currentHistory => {
            const filtered = currentHistory.filter(item => {
              const itemDate = new Date(item.scanDate);
              return differenceInCalendarDays(now, itemDate) < retentionDays;
            });

            if (filtered.length < currentHistory.length) {
                window.localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
                return filtered;
            }
            return currentHistory;
        });
      }
    }
  }, [isSettingsLoaded, preferences.dataRetention]);

  return { history, addScanToHistory, clearHistory, isLoaded, scanStreak };
}

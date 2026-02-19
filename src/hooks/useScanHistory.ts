'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ScanHistoryItem } from '@/lib/types';

const HISTORY_KEY = 'nutriscan-history';
const MAX_HISTORY_ITEMS = 50;

export function useScanHistory() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(HISTORY_KEY);
      if (item) {
        // You might want to add validation here (e.g. with Zod)
        setHistory(JSON.parse(item));
      } else {
        setHistory([]);
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

  return { history, addScanToHistory, clearHistory, isLoaded };
}

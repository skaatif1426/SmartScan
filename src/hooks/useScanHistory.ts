'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ScanHistoryItem } from '@/lib/types';

const HISTORY_KEY = 'nutriscan-history';
const MAX_HISTORY_ITEMS = 50;

// Sample data for showcase purposes
const sampleHistory: ScanHistoryItem[] = [
  {
    barcode: '5449000000996',
    productName: 'Coca-Cola Classic',
    brand: 'Coca-Cola',
    imageUrl: 'https://images.openfoodfacts.org/images/products/544/900/000/0996/front_en.117.400.jpg',
    scanDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    categories: 'Beverages, Sodas',
  },
  {
    barcode: '7622210449283',
    productName: 'Oreo Original',
    brand: 'Oreo',
    imageUrl: 'https://images.openfoodfacts.org/images/products/762/221/044/9283/front_en.138.400.jpg',
    scanDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    categories: 'Snacks, Biscuits',
  },
  {
    barcode: '3017620422003',
    productName: 'Nutella',
    brand: 'Ferrero',
    imageUrl: 'https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.161.400.jpg',
    scanDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    categories: 'Spreads, Sweet spreads',
  },
    {
    barcode: '5000159461222',
    productName: 'Pringles Original',
    brand: 'Pringles',
    imageUrl: 'https://images.openfoodfacts.org/images/products/500/015/946/1222/front_en.59.400.jpg',
    scanDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    categories: 'Snacks, Salty snacks',
  },
];


export function useScanHistory() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(HISTORY_KEY);
      if (item && JSON.parse(item).length > 0) {
        setHistory(JSON.parse(item));
      } else {
        // For showcase purposes, initialize with sample data if history is empty
        setHistory(sampleHistory);
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(sampleHistory));
      }
    } catch (error) {
      console.warn('Error handling scan history', error);
      // Fallback to sample data on error as well for showcase
      setHistory(sampleHistory);
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

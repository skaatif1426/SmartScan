'use client';

import { useState, useEffect, useCallback } from 'react';

const ANALYTICS_KEY = 'nutriscan-analytics';

interface AnalyticsData {
  errorCount: number;
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({ errorCount: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(ANALYTICS_KEY);
      if (item) {
        setAnalytics(JSON.parse(item));
      }
    } catch (error) {
      console.warn('Error reading analytics from localStorage', error);
    }
    setIsLoaded(true);
  }, []);

  const trackError = useCallback(() => {
    try {
      setAnalytics((prev) => {
        const updated = { ...prev, errorCount: prev.errorCount + 1 };
        window.localStorage.setItem(ANALYTICS_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.warn('Error saving analytics to localStorage', error);
    }
  }, []);

  const resetErrorCount = useCallback(() => {
    try {
        setAnalytics((prev) => {
            const updated = { ...prev, errorCount: 0 };
            window.localStorage.setItem(ANALYTICS_KEY, JSON.stringify(updated));
            return updated;
        });
    } catch (error) {
        console.warn('Error resetting analytics in localStorage', error);
    }
  }, []);

  return { analytics, trackError, resetErrorCount, isLoaded };
}

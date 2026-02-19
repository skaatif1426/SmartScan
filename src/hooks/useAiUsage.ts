'use client';

import { useState, useEffect, useCallback } from 'react';

const AI_USAGE_KEY = 'nutriscan-ai-usage';

interface AiUsage {
  callCount: number;
}

export function useAiUsage() {
  const [usage, setUsage] = useState<AiUsage>({ callCount: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(AI_USAGE_KEY);
      if (item) {
        setUsage(JSON.parse(item));
      }
    } catch (error) {
      console.warn('Error reading AI usage from localStorage', error);
    }
    setIsLoaded(true);
  }, []);

  const incrementAiCallCount = useCallback(() => {
    try {
      setUsage((prev) => {
        const updatedUsage = { ...prev, callCount: prev.callCount + 1 };
        window.localStorage.setItem(AI_USAGE_KEY, JSON.stringify(updatedUsage));
        return updatedUsage;
      });
    } catch (error) {
      console.warn('Error saving AI usage to localStorage', error);
    }
  }, []);

  const resetAiCallCount = useCallback(() => {
    try {
        const resetUsage = { callCount: 0 };
        setUsage(resetUsage);
        window.localStorage.setItem(AI_USAGE_KEY, JSON.stringify(resetUsage));
    } catch (error) {
        console.warn('Error resetting AI usage in localStorage', error);
    }
  }, []);

  return { usage, incrementAiCallCount, resetAiCallCount, isLoaded };
}

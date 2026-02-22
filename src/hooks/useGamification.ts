'use client';

import { useState, useEffect, useCallback } from 'react';

const GAMIFICATION_KEY = 'smartscan-gamification';

export const XP_PER_SCAN = 10;
export const XP_PER_DISCOVERY = 50;
export const XP_PER_LEVEL = 200;

interface GamificationState {
  xp: number;
  level: number;
}

const calculateLevel = (xp: number) => {
    return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function useGamification() {
  const [state, setState] = useState<GamificationState>({ xp: 0, level: 1 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(GAMIFICATION_KEY);
      if (item) {
        const storedState = JSON.parse(item);
        setState({ ...storedState, level: calculateLevel(storedState.xp) });
      }
    } catch (error) {
      console.warn('Error reading gamification state from localStorage', error);
    }
    setIsLoaded(true);
  }, []);

  const addXp = useCallback((amount: number) => {
    try {
      setState((prev) => {
        const newXp = prev.xp + amount;
        const newLevel = calculateLevel(newXp);
        const updatedState = { xp: newXp, level: newLevel };
        
        // This logic ensures that even if a large amount of XP is added,
        // we only update localStorage once.
        window.localStorage.setItem(GAMIFICATION_KEY, JSON.stringify({ xp: newXp }));
        
        // Optional: Toast notification on level up
        // if (newLevel > prev.level) { ... }

        return { ...updatedState, level: newLevel };
      });
    } catch (error) {
      console.warn('Error saving gamification state to localStorage', error);
    }
  }, []);

  const getLevelProgress = () => {
    if (!isLoaded) return 0;
    const currentLevelXp = (state.level - 1) * XP_PER_LEVEL;
    const xpIntoLevel = state.xp - currentLevelXp;
    return (xpIntoLevel / XP_PER_LEVEL) * 100;
  }

  return { 
      ...state, 
      isLoaded, 
      addXp,
      getLevelProgress,
      XP_PER_SCAN,
      XP_PER_DISCOVERY,
      XP_PER_LEVEL,
    };
}

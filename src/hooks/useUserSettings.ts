'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserSettings, Language } from '@/lib/types';

const SETTINGS_KEY = 'nutriscan-settings';

const defaultSettings: UserSettings = {
  language: 'English',
  isVeg: false,
  isNonVeg: false,
  allergies: [],
  advancedUiMode: false,
};

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(SETTINGS_KEY);
      if (item) {
        setSettings(JSON.parse(item));
      }
    } catch (error) {
      console.warn('Error reading user settings from localStorage', error);
    }
    setIsLoaded(true);
  }, []);

  const saveSettings = useCallback((newSettings: Partial<UserSettings>) => {
    try {
      setSettings((prev) => {
        const updatedSettings = { ...prev, ...newSettings };
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
        return updatedSettings;
      });
    } catch (error) {
      console.warn('Error saving user settings to localStorage', error);
    }
  }, []);

  return { settings, saveSettings, isLoaded };
}

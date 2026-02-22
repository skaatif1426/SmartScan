'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserSettings } from '@/lib/types';

const OLD_SETTINGS_KEY = 'nutriscan-settings';
const SETTINGS_KEY = 'smartscan-settings';

const defaultSettings: Omit<UserSettings, 'isVeg' | 'isNonVeg'> = {
  language: 'English',
  diet: 'none',
  allergies: [],
  healthGoal: 'general',
  healthFocus: [],
  aiVerbosity: 'balanced',
  advancedUiMode: false,
  aiChatEnabled: true,
  aiInsightsEnabled: true,
  dataRetention: 'forever',
};

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings as UserSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      let settingsToLoad: UserSettings | null = null;
      
      const oldSettingsItem = window.localStorage.getItem(OLD_SETTINGS_KEY);
      if (oldSettingsItem) {
          settingsToLoad = JSON.parse(oldSettingsItem);
          window.localStorage.removeItem(OLD_SETTINGS_KEY);
      } else {
        const item = window.localStorage.getItem(SETTINGS_KEY);
        if (item) {
          settingsToLoad = JSON.parse(item);
        }
      }

      if (settingsToLoad) {
        // Migrate old isVeg/isNonVeg to new diet property
        if (settingsToLoad.isNonVeg) {
          settingsToLoad.diet = 'non-vegetarian';
        } else if (settingsToLoad.isVeg) {
          settingsToLoad.diet = 'vegetarian';
        }
        delete settingsToLoad.isVeg;
        delete settingsToLoad.isNonVeg;
        
        // Merge with defaults to ensure new settings are present
        setSettings({ ...defaultSettings, ...settingsToLoad } as UserSettings);
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...defaultSettings, ...settingsToLoad }));
      } else {
        setSettings(defaultSettings as UserSettings);
      }
    } catch (error) {
      console.warn('Error reading user settings from localStorage', error);
      setSettings(defaultSettings as UserSettings);
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

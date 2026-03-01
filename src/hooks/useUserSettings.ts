'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserSettings } from '@/lib/types';

const OLD_SETTINGS_KEY = 'nutriscan-settings';
const SETTINGS_KEY = 'smartscan-settings';

const defaultSettings: UserSettings = {
  name: 'User',
  email: '',
  profilePicUrl: null,
  language: 'English',
  theme: 'system',
  units: 'metric',
  diet: 'none',
  allergies: [],
  healthGoal: 'general',
  healthFocus: [],
  aiVerbosity: 'balanced',
  aiFocusPriority: 'health',
  autoLanguageReply: true,
  advancedUiMode: false,
  aiChatEnabled: true,
  aiInsightsEnabled: true,
  dataRetention: 'forever',
  strictMode: false,
  notifications: {
    master: true,
    smart: true,
    goalReminders: true,
    scanReminders: false,
    insightAlerts: true,
  },
};

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      let settingsToLoad: any = null;
      
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
        const merged = { ...defaultSettings, ...settingsToLoad };
        setSettings(merged);
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
      } else {
        setSettings(defaultSettings);
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
      }
    } catch (error) {
      console.warn('Error reading user settings from localStorage', error);
      setSettings(defaultSettings);
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
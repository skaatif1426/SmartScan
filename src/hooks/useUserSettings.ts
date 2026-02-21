'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserSettings } from '@/lib/types';

const OLD_SETTINGS_KEY = 'nutriscan-settings';
const SETTINGS_KEY = 'smartscan-settings';

const defaultSettings: UserSettings = {
  language: 'English',
  isVeg: false,
  isNonVeg: false,
  allergies: [],
  advancedUiMode: false,
  aiChatEnabled: true,
  aiInsightsEnabled: true,
  aiVerbosity: 'concise',
  healthGoal: 'general',
  dataRetention: 'forever',
};

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const oldSettingsItem = window.localStorage.getItem(OLD_SETTINGS_KEY);
      if (oldSettingsItem) {
          const oldSettings = JSON.parse(oldSettingsItem);
          const migratedSettings = { ...defaultSettings, ...oldSettings };
          setSettings(migratedSettings);
          window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(migratedSettings));
          window.localStorage.removeItem(OLD_SETTINGS_KEY);
      } else {
        const item = window.localStorage.getItem(SETTINGS_KEY);
        if (item) {
          // Merge with defaults to ensure new settings are present for returning users
          setSettings({ ...defaultSettings, ...JSON.parse(item) });
        } else {
          setSettings(defaultSettings);
        }
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

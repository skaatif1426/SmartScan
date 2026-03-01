'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserSettings } from '@/lib/types';
import { getProfileImage, setProfileImage, deleteProfileImage } from '@/lib/idb';

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
    const loadSettings = async () => {
      try {
        const item = window.localStorage.getItem(SETTINGS_KEY);
        let settingsToLoad = item ? JSON.parse(item) : defaultSettings;

        // Load large profile image from IndexedDB
        const storedImage = await getProfileImage();
        
        const merged = { 
          ...defaultSettings, 
          ...settingsToLoad,
          profilePicUrl: storedImage || settingsToLoad.profilePicUrl 
        };
        
        setSettings(merged);
        
        // Ensure settings are synced to localStorage (excluding the large image)
        const { profilePicUrl, ...rest } = merged;
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(rest));

      } catch (error) {
        console.warn('Error reading user settings', error);
        setSettings(defaultSettings);
      }
      setIsLoaded(true);
    };

    loadSettings();
  }, []);

  const saveSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    try {
      // If updating the profile pic, save it to IndexedDB separately
      if (newSettings.profilePicUrl !== undefined) {
        if (newSettings.profilePicUrl) {
          await setProfileImage(newSettings.profilePicUrl);
        } else {
          await deleteProfileImage();
        }
      }

      setSettings((prev) => {
        const updatedSettings = { ...prev, ...newSettings };
        
        // Save only small settings to localStorage
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { profilePicUrl, ...rest } = updatedSettings;
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(rest));
        
        return updatedSettings;
      });
    } catch (error) {
      console.warn('Error saving user settings', error);
    }
  }, []);

  return { settings, saveSettings, isLoaded };
}

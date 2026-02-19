'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import type { UserSettings, Language } from '@/lib/types';
import { useUserSettings } from '@/hooks/useUserSettings';
import { translations } from '@/lib/translations';

type SettingsContextType = {
  settings: UserSettings;
  saveSettings: (newSettings: Partial<UserSettings>) => void;
  isSettingsLoaded: boolean;
  t: (key: keyof typeof translations) => string;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { settings, saveSettings, isLoaded } = useUserSettings();

  const t = useMemo(() => (key: keyof typeof translations): string => {
    const translationSet = translations[key];
    if (translationSet) {
      return translationSet[settings.language] || translationSet['English'];
    }
    return key;
  }, [settings.language]);


  const value = {
    settings,
    saveSettings,
    isSettingsLoaded: isLoaded,
    t,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

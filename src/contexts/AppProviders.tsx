'use client';

import { createContext, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { UserSettings, Language, UserPreferences, Theme, AiFocusPriority } from '@/lib/types';
import { useUserSettings } from '@/hooks/useUserSettings';
import { translations } from '@/lib/translations';

// --- Language Context ---
type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof typeof translations) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within an AppProviders');
  }
  return context;
}

// --- Preferences Context ---
type PreferencesContextType = {
  preferences: UserPreferences & { 
      name: string;
      email: string;
      theme: Theme;
      advancedUiMode: boolean;
      aiChatEnabled: boolean;
      aiInsightsEnabled: boolean;
      aiFocusPriority: AiFocusPriority;
      autoLanguageReply: boolean;
      dataRetention: UserSettings['dataRetention'];
      notifications: UserSettings['notifications'];
      units: UserSettings['units'];
  };
  savePreferences: (newPreferences: Partial<UserSettings>) => void;
  isSettingsLoaded: boolean;
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function usePreferences() {
    const context = useContext(PreferencesContext);
    if (context === undefined) {
        throw new Error('usePreferences must be used within an AppProviders');
    }
    return context;
}

// --- Combined Provider ---
export function AppProviders({ children }: { children: ReactNode }) {
  const { settings, saveSettings, isLoaded } = useUserSettings();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (settings.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings.theme]);

  useEffect(() => {
    if (typeof window === 'undefined' || settings.theme !== 'system') {
      return;
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  const t = useMemo(() => (key: keyof typeof translations): string => {
    const translationSet = translations[key];
    if (translationSet) {
      return translationSet[settings.language] || translationSet['English'];
    }
    return key;
  }, [settings.language]);

  const setLanguage = useCallback((language: Language) => {
    saveSettings({ language });
  }, [saveSettings]);

  const savePreferences = useCallback((newPreferences: Partial<UserSettings>) => {
    saveSettings(newPreferences);
  }, [saveSettings]);

  const languageValue: LanguageContextType = useMemo(() => ({
    language: settings.language,
    setLanguage,
    t,
  }), [settings.language, setLanguage, t]);

  const preferencesValue: PreferencesContextType = useMemo(() => ({
    preferences: {
        name: settings.name,
        email: settings.email,
        diet: settings.diet,
        allergies: settings.allergies,
        healthGoal: settings.healthGoal,
        healthFocus: settings.healthFocus,
        aiVerbosity: settings.aiVerbosity,
        aiFocusPriority: settings.aiFocusPriority,
        autoLanguageReply: settings.autoLanguageReply,
        strictMode: settings.strictMode,
        theme: settings.theme,
        units: settings.units,
        advancedUiMode: settings.advancedUiMode,
        aiChatEnabled: settings.aiChatEnabled,
        aiInsightsEnabled: settings.aiInsightsEnabled,
        dataRetention: settings.dataRetention,
        notifications: settings.notifications,
    },
    savePreferences,
    isSettingsLoaded: isLoaded,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [settings, savePreferences, isLoaded]);

  return (
    <LanguageContext.Provider value={languageValue}>
      <PreferencesContext.Provider value={preferencesValue}>
        {children}
      </PreferencesContext.Provider>
    </LanguageContext.Provider>
  );
}

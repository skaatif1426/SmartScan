'use client';

import { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { UserSettings, Language } from '@/lib/types';
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
  preferences: Omit<UserSettings, 'language'>;
  savePreferences: (newPreferences: Partial<Omit<UserSettings, 'language'>>) => void;
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

  const savePreferences = useCallback((newPreferences: Partial<Omit<UserSettings, 'language'>>) => {
    saveSettings(newPreferences);
  }, [saveSettings]);

  const languageValue: LanguageContextType = useMemo(() => ({
    language: settings.language,
    setLanguage,
    t,
  }), [settings.language, setLanguage, t]);

  const preferencesValue: PreferencesContextType = useMemo(() => ({
    preferences: {
        isVeg: settings.isVeg,
        isNonVeg: settings.isNonVeg,
        allergies: settings.allergies,
        advancedUiMode: settings.advancedUiMode,
        aiChatEnabled: settings.aiChatEnabled,
        aiInsightsEnabled: settings.aiInsightsEnabled,
    },
    savePreferences,
    isSettingsLoaded: isLoaded,
  }), [settings.isVeg, settings.isNonVeg, settings.allergies, settings.advancedUiMode, settings.aiChatEnabled, settings.aiInsightsEnabled, savePreferences, isLoaded]);

  return (
    <LanguageContext.Provider value={languageValue}>
      <PreferencesContext.Provider value={preferencesValue}>
        {children}
      </PreferencesContext.Provider>
    </LanguageContext.Provider>
  );
}

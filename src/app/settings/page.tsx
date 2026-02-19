'use client';

import { Settings as SettingsIcon, Languages, Leaf, Drumstick, ShieldAlert, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/contexts/SettingsContext';
import type { Language } from '@/lib/types';

const languages: Language[] = ['English', 'Hindi', 'Marathi', 'Hinglish'];

export default function SettingsPage() {
  const { settings, saveSettings, t } = useSettings();

  const handleAllergyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const allergies = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    saveSettings({ allergies });
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-3xl font-bold flex items-center gap-2 animate-in fade-in duration-300">
        <SettingsIcon className="text-primary" /> {t('settingsTitle')}
      </h1>
      
      <Card className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Languages /> {t('language')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={settings.language}
            onValueChange={(value: Language) => saveSettings({ language: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('language')} />
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Leaf /> {t('preferences')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="vegetarian-switch" className="flex items-center gap-2"><Leaf className="text-green-600" /> {t('vegetarian')}</Label>
            <Switch
              id="vegetarian-switch"
              checked={settings.isVeg}
              onCheckedChange={(checked) => saveSettings({ isVeg: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="non-vegetarian-switch" className="flex items-center gap-2"><Drumstick className="text-red-600" /> {t('nonVegetarian')}</Label>
            <Switch
              id="non-vegetarian-switch"
              checked={settings.isNonVeg}
              onCheckedChange={(checked) => saveSettings({ isNonVeg: checked })}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldAlert /> {t('allergies')}</CardTitle>
        </CardHeader>
        <CardContent>
            <Label htmlFor="allergies-input">{t('allergies')}</Label>
            <Input 
                id="allergies-input"
                placeholder={t('allergiesPlaceholder')}
                defaultValue={settings.allergies.join(', ')}
                onChange={handleAllergyChange}
            />
        </CardContent>
      </Card>

      <Card className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-400">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap /> {t('advancedSettings')}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="advanced-ui-switch">{t('advancedUiMode')}</Label>
                    <p className="text-sm text-muted-foreground">{t('advancedUiModeDescription')}</p>
                </div>
                <Switch 
                    id="advanced-ui-switch"
                    checked={settings.advancedUiMode}
                    onCheckedChange={(checked) => saveSettings({ advancedUiMode: checked })}
                />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

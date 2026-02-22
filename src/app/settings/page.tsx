'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Settings, Palette, Languages, Sparkles, Bell, HardDrive, Shield, HelpCircle, Info, Trash2, LogOut, FileText, FileQuestion, MessageSquareWarning, Sun, Moon, Laptop, BrainCircuit, BarChart2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useLanguage, usePreferences } from '@/contexts/AppProviders';
import { useAiUsage } from '@/hooks/useAiUsage';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { Language, DataRetention, Theme } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const languages: Language[] = ['English', 'Hindi', 'Marathi', 'Hinglish'];
const retentionPeriods: DataRetention[] = ['30d', '90d', 'forever'];
const verbosityLevels: {id: any, label: string}[] = [
    {id: 'concise', label: 'Concise'},
    {id: 'balanced', label: 'Balanced'},
    {id: 'detailed', label: 'Detailed'},
];
const themes: {id: Theme, label: string, icon: React.ElementType}[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Laptop },
];

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { preferences, savePreferences } = usePreferences();
  const { usage, resetAiCallCount } = useAiUsage();
  const { clearHistory } = useScanHistory();
  const { analytics, resetErrorCount } = useAnalytics();
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const handleClearHistory = () => {
    setIsClearing(true);
    clearHistory();
    toast({ title: 'History Cleared', description: 'Your scan history has been deleted.' });
  };
  
  const handleThemeChange = (theme: Theme) => {
    savePreferences({ theme });
    toast({ title: "Theme Updated", description: `Switched to ${theme} mode.` });
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    toast({ title: "Language Changed", description: `App language set to ${lang}.` });
  };

  const retentionLabels: { [key in DataRetention]: string } = {
    '30d': t('retention30d'),
    '90d': t('retention90d'),
    'forever': t('retentionForever'),
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Settings /> Settings
      </h1>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette /> App Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Language</Label>
              <Select value={language} onValueChange={(value: Language) => handleLanguageChange(value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Theme</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {themes.map(({ id, label, icon: Icon }) => (
                  <Button key={id} variant={preferences.theme === id ? 'default' : 'outline'} onClick={() => handleThemeChange(id)}>
                    <Icon className="mr-2" /> {label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles /> AI Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>AI Response Style</Label>
               <div className="grid grid-cols-3 gap-2 mt-2">
                  {verbosityLevels.map(({ id, label }) => (
                      <Button key={id} variant={preferences.aiVerbosity === id ? 'default' : 'outline'} onClick={() => savePreferences({ aiVerbosity: id })}>
                          {label}
                      </Button>
                  ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="advanced-ui-switch">Advanced UI Mode</Label>
                <p className="text-sm text-muted-foreground">Show extra details and dev tools.</p>
              </div>
              <Switch
                id="advanced-ui-switch"
                checked={preferences.advancedUiMode}
                onCheckedChange={(checked) => savePreferences({ advancedUiMode: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell /> Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="goal-reminders-switch">Goal Reminders</Label>
                <p className="text-sm text-muted-foreground">Receive encouragement for your goals.</p>
              </div>
              <Switch
                id="goal-reminders-switch"
                checked={preferences.notifications.goalReminders}
                onCheckedChange={(checked) => savePreferences({ notifications: { ...preferences.notifications, goalReminders: checked } })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="scan-reminders-switch">Scan Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminded to maintain your streak.</p>
              </div>
              <Switch
                id="scan-reminders-switch"
                checked={preferences.notifications.scanReminders}
                onCheckedChange={(checked) => savePreferences({ notifications: { ...preferences.notifications, scanReminders: checked } })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="insight-alerts-switch">New Insight Alerts</Label>
                <p className="text-sm text-muted-foreground">Be notified when new insights are found.</p>
              </div>
              <Switch
                id="insight-alerts-switch"
                checked={preferences.notifications.insightAlerts}
                onCheckedChange={(checked) => savePreferences({ notifications: { ...preferences.notifications, insightAlerts: checked } })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><HardDrive /> Data & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Scan History Retention</Label>
              <Select value={preferences.dataRetention} onValueChange={(value: DataRetention) => savePreferences({ dataRetention: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {retentionPeriods.map(p => <SelectItem key={p} value={p}>{retentionLabels[p]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2"><BrainCircuit/> AI Usage</div>
                <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{usage.callCount} calls</span>
                    <Button variant="ghost" size="sm" onClick={resetAiCallCount}>Reset</Button>
                </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2"><BarChart2/> Tracked Errors</div>
                <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{analytics.errorCount} errors</span>
                    <Button variant="ghost" size="sm" onClick={resetErrorCount}>Reset</Button>
                </div>
            </div>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Trash2 className="mr-2" /> Clear Scan History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete all scan history. This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearHistory} disabled={isClearing}>
                    {isClearing ? "Clearing..." : "Confirm & Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Info /> About & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                 <Button variant="outline" className="w-full justify-start gap-2"><HelpCircle/> Help Center</Button>
                 <Button variant="outline" className="w-full justify-start gap-2"><MessageSquareWarning/> Report a Problem</Button>
                 <Button variant="outline" className="w-full justify-start gap-2"><FileText/> Terms & Conditions</Button>
                 <Button variant="outline" className="w-full justify-start gap-2"><Shield/> Privacy Policy</Button>
            </CardContent>
            <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground text-center">App Version 1.0.0</p>
            </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive"><Shield /> Account</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
             <Button variant="outline"><LogOut className="mr-2"/> Logout</Button>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive"><Trash2 className="mr-2"/> Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>This action is permanent and will erase all your data, including scan history and preferences.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction disabled>Confirm Deletion</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Settings, User, Palette, Languages, Sparkles, Bell, HardDrive, Shield, HelpCircle, Info, Trash2, LogOut, Sun, Moon, Laptop, ChevronLeft, Target, Mail, Edit3, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage, usePreferences } from '@/contexts/AppProviders';
import { useAiUsage } from '@/hooks/useAiUsage';
import { useScanHistory } from '@/hooks/useScanHistory';
import type { Language, DataRetention, Theme, AiVerbosity, UnitSystem, HealthGoal, DietType, AiFocusPriority } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const languages: Language[] = ['English', 'Hindi', 'Marathi', 'Hinglish'];
const retentionPeriods: DataRetention[] = ['30d', '90d', 'forever'];
const verbosityLevels: {id: AiVerbosity, label: string}[] = [
    {id: 'concise', label: 'Concise'},
    {id: 'balanced', label: 'Balanced'},
    {id: 'detailed', label: 'Detailed'},
];
const aiFocusOptions: {id: AiFocusPriority, label: string}[] = [
    {id: 'health', label: 'Health'},
    {id: 'budget', label: 'Budget'},
    {id: 'ingredients', label: 'Ingredients'},
    {id: 'eco', label: 'Eco'},
    {id: 'performance', label: 'Performance'},
];
const themes: {id: Theme, label: string, icon: any}[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Laptop },
];
const unitSystems: {id: UnitSystem, label: string}[] = [
    { id: 'metric', label: 'Metric' },
    { id: 'imperial', label: 'Imperial' },
];
const healthGoals: {id: HealthGoal, label: string}[] = [
    {id: 'general', label: 'General Wellness'},
    {id: 'weight-loss', label: 'Weight Loss'},
    {id: 'muscle-gain', label: 'Muscle Gain'},
    {id: 'maintain-weight', label: 'Maintain Weight'},
    {id: 'improve-diet', label: 'Improve Diet'},
    {id: 'manage-condition', label: 'Manage Health'},
];
const dietTypes: DietType[] = ['none', 'vegetarian', 'vegan', 'non-vegetarian', 'keto', 'paleo', 'eggetarian'];

export default function SettingsPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { preferences, savePreferences } = usePreferences();
  const { usage } = useAiUsage();
  const { clearHistory } = useScanHistory();
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const handleClearHistory = () => {
    setIsClearing(true);
    clearHistory();
    toast({ title: 'History Cleared', description: 'Your scan history has been deleted.' });
    setIsClearing(false);
  };
  
  const handleSettingChange = (key: string, value: any) => {
    savePreferences({ [key]: value });
    toast({ 
        title: "Setting saved", 
        description: `${key.charAt(0).toUpperCase() + key.slice(1)} updated.`,
        duration: 2000 
    });
  };

  const handleSupportClick = (title: string) => {
    toast({
        title,
        description: "This feature is coming soon. Stay tuned!",
        icon: <Info className="h-4 w-4 text-blue-500" />
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ChevronLeft />
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-2">
            Settings
        </h1>
      </div>

      <div className="space-y-6">
        {/* ACCOUNT */}
        <Card id="account" className="border shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5 text-primary" /> Account</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             <div className="grid gap-4">
                <div className="space-y-2">
                    <Label htmlFor="user-name">Display Name</Label>
                    <div className="relative">
                        <Input 
                            id="user-name" 
                            value={preferences.name} 
                            onChange={(e) => savePreferences({ name: e.target.value })}
                            onBlur={() => toast({ title: "Name saved" })}
                            placeholder="Enter your name"
                        />
                        <Edit3 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="user-email">Email Address</Label>
                    <div className="relative">
                        <Input 
                            id="user-email" 
                            value={preferences.email} 
                            onChange={(e) => savePreferences({ email: e.target.value })}
                            placeholder="user@example.com"
                        />
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>
             </div>
             <Separator />
             <div className="flex flex-col gap-2">
                <Button variant="outline" className="w-full justify-start gap-2 h-11"><LogOut className="h-4 w-4" /> Logout</Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 h-11">
                            <Trash2 className="h-4 w-4" /> Delete Account
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action is permanent and will instantly erase your profile, history, and achievements. This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Confirm Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
             </div>
          </CardContent>
        </Card>

        {/* DIETARY & GOALS */}
        <Card id="dietary" className="border shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Target className="h-5 w-5 text-primary" /> Dietary & Goals</CardTitle>
                <CardDescription>Personalize the scan analysis for your body.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <Label>Primary Health Goal</Label>
                    <Select value={preferences.healthGoal} onValueChange={(v: HealthGoal) => handleSettingChange('healthGoal', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {healthGoals.map(goal => <SelectItem key={goal.id} value={goal.id}>{goal.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-3">
                    <Label>Diet Type</Label>
                    <Select value={preferences.diet} onValueChange={(v: DietType) => handleSettingChange('diet', v)}>
                        <SelectTrigger><SelectValue className="capitalize" /></SelectTrigger>
                        <SelectContent>
                            {dietTypes.map(diet => <SelectItem key={diet} value={diet} className="capitalize">{diet}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                    <div className="space-y-0.5">
                        <Label>Strict Mode</Label>
                        <p className="text-xs text-muted-foreground">High sensitivity alerts for allergies.</p>
                    </div>
                    <Switch checked={preferences.strictMode} onCheckedChange={(v) => handleSettingChange('strictMode', v)} />
                </div>
            </CardContent>
        </Card>

        {/* AI CONFIGURATION */}
        <Card id="ai" className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="h-5 w-5 text-primary" /> AI Configuration</CardTitle>
            <CardDescription>Control the intelligence layer of the app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Response Style</Label>
               <div className="grid grid-cols-3 gap-2">{verbosityLevels.map(({ id, label }) => (
                  <Button key={id} variant={preferences.aiVerbosity === id ? 'default' : 'outline'} onClick={() => handleSettingChange('aiVerbosity', id)} className="h-10 text-xs">{label}</Button>
              ))}</div>
            </div>
            <div className="space-y-3">
              <Label>Focus Priority</Label>
               <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">{aiFocusOptions.map(({ id, label }) => (
                  <Button key={id} variant={preferences.aiFocusPriority === id ? 'default' : 'outline'} onClick={() => handleSettingChange('aiFocusPriority', id)} className="h-10 text-[10px] sm:text-xs">{label}</Button>
              ))}</div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border">
                <div className="space-y-0.5">
                    <Label>Auto Language Reply</Label>
                    <p className="text-xs text-muted-foreground">AI matches your chat language automatically.</p>
                </div>
                <Switch checked={preferences.autoLanguageReply} onCheckedChange={(v) => handleSettingChange('autoLanguageReply', v)} />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border">
              <div className="space-y-0.5">
                <Label>Advanced UI Mode</Label>
                <p className="text-xs text-muted-foreground">Show extra technical details on scans.</p>
              </div>
              <Switch checked={preferences.advancedUiMode} onCheckedChange={(c) => handleSettingChange('advancedUiMode', c)} />
            </div>
          </CardContent>
        </Card>

        {/* APP PREFERENCES */}
        <Card className="border shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Palette className="h-5 w-5 text-primary" /> App Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Interface Language</Label>
              <Select value={language} onValueChange={(l: Language) => { setLanguage(l); toast({ title: `Language set to ${l}` }); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Appearance</Label>
              <div className="grid grid-cols-3 gap-2">{themes.map(({ id, label, icon: Icon }) => (
                  <Button key={id} variant={preferences.theme === id ? 'default' : 'outline'} onClick={() => handleSettingChange('theme', id)} className="h-10 text-xs"><Icon className="mr-2 h-3 w-3" /> {label}</Button>
              ))}</div>
            </div>
             <div className="space-y-3">
              <Label>Measurement Units</Label>
               <div className="grid grid-cols-2 gap-2">{unitSystems.map(({ id, label }) => (
                  <Button key={id} variant={preferences.units === id ? 'default' : 'outline'} onClick={() => handleSettingChange('units', id)} className="h-10">{label}</Button>
              ))}</div>
            </div>
          </CardContent>
        </Card>

        {/* NOTIFICATIONS */}
        <Card className="border shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Bell className="h-5 w-5 text-primary" /> Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="space-y-0.5">
                <Label className="text-primary font-bold">Master Toggle</Label>
                <p className="text-xs text-primary/70">Enable or disable all app alerts.</p>
              </div>
              <Switch checked={preferences.notifications.master} onCheckedChange={(v) => handleSettingChange('notifications', { ...preferences.notifications, master: v })} />
            </div>
            
            <div className={cn("space-y-4 pt-2 transition-opacity", !preferences.notifications.master && "opacity-50 pointer-events-none")}>
                <div className="flex items-center justify-between">
                    <Label htmlFor="smart-alerts">Smart Notifications</Label>
                    <Switch checked={preferences.notifications.smart} onCheckedChange={(v) => handleSettingChange('notifications', { ...preferences.notifications, smart: v })} />
                </div>
                <div className="flex items-center justify-between">
                    <Label>Goal Reminders</Label>
                    <Switch checked={preferences.notifications.goalReminders} onCheckedChange={(c) => handleSettingChange('notifications', { ...preferences.notifications, goalReminders: c })}/>
                </div>
                <div className="flex items-center justify-between">
                    <Label>Scan Reminders</Label>
                    <Switch checked={preferences.notifications.scanReminders} onCheckedChange={(c) => handleSettingChange('notifications', { ...preferences.notifications, scanReminders: c })}/>
                </div>
                <div className="flex items-center justify-between">
                    <Label>Insight Alerts</Label>
                    <Switch checked={preferences.notifications.insightAlerts} onCheckedChange={(c) => handleSettingChange('notifications', { ...preferences.notifications, insightAlerts: c })}/>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* DATA & PRIVACY */}
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30"><CardTitle className="flex items-center gap-2 text-lg"><HardDrive className="h-5 w-5 text-primary" /> Data & Privacy</CardTitle></CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-3">
              <Label>Scan History Retention</Label>
              <Select value={preferences.dataRetention} onValueChange={(v: DataRetention) => handleSettingChange('dataRetention', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{retentionPeriods.map(p => <SelectItem key={p} value={p}>{t(`retention${p}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/10">
                <div className="space-y-0.5">
                    <p className="text-sm font-semibold">AI Usage Transparency</p>
                    <p className="text-xs text-muted-foreground">Tracks how often AI is used for transparency.</p>
                </div>
                <Badge variant="secondary" className="px-3 py-1 font-mono">AI Requests Used: {usage.callCount}</Badge>
            </div>
            <div className="flex flex-col gap-2">
                <Button variant="outline" className="w-full h-11 justify-center gap-2"><HardDrive className="h-4 w-4" /> Export All Data</Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="outline" className="w-full h-11 text-destructive hover:bg-destructive/5"><Trash2 className="mr-2 h-4 w-4" /> Clear Local History</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Clear History?</AlertDialogTitle><AlertDialogDescription>This will remove all scans from your local device. This action is irreversible.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleClearHistory} disabled={isClearing} className="bg-destructive text-destructive-foreground">{isClearing ? "Clearing..." : "Confirm"}</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
          </CardContent>
        </Card>
        
        {/* HELP, SUPPORT & ABOUT */}
        <div className="grid gap-4">
            <Card>
                <CardContent className="p-2 divide-y">
                     <Button variant="ghost" className="w-full justify-between h-12" onClick={() => handleSupportClick("Help Center")}>
                        <div className="flex items-center gap-2"><HelpCircle className="h-4 w-4" /> Help Center</div>
                        <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                     </Button>
                     <Button variant="ghost" className="w-full justify-between h-12" onClick={() => handleSupportClick("Report a Problem")}>
                        <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Report a Problem</div>
                        <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                     </Button>
                     <Button variant="ghost" className="w-full justify-between h-12" onClick={() => handleSupportClick("Terms & Conditions")}>
                        <div className="flex items-center gap-2"><Shield className="h-4 w-4" /> Terms & Conditions</div>
                        <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                     </Button>
                </CardContent>
            </Card>
            <div className="text-center space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">SmartScan AI • v1.0.0</p>
                <p className="text-[10px] text-muted-foreground">Built for healthier choices • 2024</p>
            </div>
        </div>
      </div>
    </div>
  );
}

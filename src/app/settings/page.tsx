'use client';

import { useState, useRef } from 'react';
import { Settings, User, Palette, Languages, Sparkles, HardDrive, LogOut, ChevronLeft, Target, Mail, Camera, Trash2, ShieldAlert, HelpCircle } from 'lucide-react';
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
import type { Language, DataRetention, AiVerbosity, UnitSystem, HealthGoal, DietType, AiFocusPriority, Theme, HealthFocus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/settings/ThemeToggle';

const languages: Language[] = ['English', 'Hindi', 'Marathi', 'Hinglish'];
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
const healthGoals: {id: HealthGoal, label: string}[] = [
    {id: 'general', label: 'General Wellness'},
    {id: 'weight-loss', label: 'Weight Loss'},
    {id: 'muscle-gain', label: 'Muscle Gain'},
    {id: 'maintain-weight', label: 'Maintain Weight'},
    {id: 'improve-diet', label: 'Improve Diet'},
    {id: 'manage-condition', label: 'Manage Health'},
];
const healthFocusOptions: { id: HealthFocus; label: string }[] = [
    { id: 'low-sugar', label: 'Low Sugar' },
    { id: 'low-fat', label: 'Low Fat' },
    { id: 'high-protein', label: 'High Protein' },
    { id: 'low-carb', label: 'Low Carb' },
    { id: 'low-sodium', label: 'Low Sodium' },
    { id: 'clean-ingredients', label: 'Clean Ingredients' },
    { id: 'organic', label: 'Organic' },
    { id: 'eco-friendly', label: 'Eco-Friendly' },
];
const dietTypes: DietType[] = ['none', 'vegetarian', 'vegan', 'non-vegetarian', 'keto', 'paleo', 'eggetarian'];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function SettingsPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { preferences, savePreferences } = usePreferences();
  const { usage } = useAiUsage();
  const { clearHistory } = useScanHistory();
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClearHistory = () => {
    setIsClearing(true);
    clearHistory();
    toast({ title: t('historyTitle'), description: t('clearHistoryConfirmDescription') });
    setIsClearing(false);
  };
  
  const handleSettingChange = (key: string, value: any) => {
    savePreferences({ [key]: value });
    toast({ 
        title: t('confirm'), 
        description: `${key.charAt(0).toUpperCase() + key.slice(1)} updated.`,
        duration: 2000 
    });
  };

  const toggleHealthFocus = (id: HealthFocus) => {
    const current = preferences.healthFocus || [];
    const updated = current.includes(id) 
        ? current.filter(item => item !== id)
        : [...current, id];
    handleSettingChange('healthFocus', updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: 'destructive',
          title: 'Image too large',
          description: 'Max size 10MB.',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        savePreferences({ profilePicUrl: reader.result as string });
        toast({ title: 'Photo updated' });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ChevronLeft />
        </Button>
        <h1 className="text-3xl font-bold">{t('settingsTitle')}</h1>
      </div>

      <div className="space-y-6">
        <Card id="account" className="border shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5 text-primary" /> {t('account')}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
             <div className="flex flex-col items-center gap-4">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Avatar className="h-20 w-20 border-2 border-primary/20 group-hover:opacity-90 transition-opacity">
                        <AvatarImage src={preferences.profilePicUrl || undefined} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                            {preferences.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-5 h-5 text-white bg-black/40 rounded-full p-1" />
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Change Photo</Button>
             </div>

             <div className="grid gap-4">
                <div className="space-y-2">
                    <Label htmlFor="user-name">{t('name')}</Label>
                    <Input id="user-name" value={preferences.name} onChange={(e) => savePreferences({ name: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="user-email">{t('email')}</Label>
                    <Input id="user-email" value={preferences.email} onChange={(e) => savePreferences({ email: e.target.value })} />
                </div>
             </div>
             <Separator />
             <Button variant="outline" className="w-full justify-start gap-2 h-11"><LogOut className="h-4 w-4" /> {t('logout')}</Button>
          </CardContent>
        </Card>

        <Card id="dietary" className="border shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Target className="h-5 w-5 text-primary" /> {t('dietaryGoals')}</CardTitle>
                <CardDescription>Master source for all health preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <Label>{t('healthGoal')}</Label>
                    <Select value={preferences.healthGoal} onValueChange={(v: HealthGoal) => handleSettingChange('healthGoal', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {healthGoals.map(goal => <SelectItem key={goal.id} value={goal.id}>{goal.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="space-y-3">
                    <Label>{t('dietType')}</Label>
                    <Select value={preferences.diet} onValueChange={(v: DietType) => handleSettingChange('diet', v)}>
                        <SelectTrigger><SelectValue className="capitalize" /></SelectTrigger>
                        <SelectContent>
                            {dietTypes.map(diet => <SelectItem key={diet} value={diet} className="capitalize">{diet}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3">
                    <Label>{t('specificFocus')}</Label>
                    <div className="flex flex-wrap gap-2">
                        {healthFocusOptions.map((option) => (
                            <Badge 
                                key={option.id} 
                                variant={preferences.healthFocus?.includes(option.id) ? 'default' : 'outline'}
                                className="cursor-pointer py-1.5"
                                onClick={() => toggleHealthFocus(option.id)}
                            >
                                {option.label}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                    <div className="space-y-0.5">
                        <Label>{t('strictMode')}</Label>
                        <p className="text-xs text-muted-foreground">High sensitivity alerts for allergens.</p>
                    </div>
                    <Switch checked={preferences.strictMode} onCheckedChange={(v) => handleSettingChange('strictMode', v)} />
                </div>
            </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Palette className="h-5 w-5 text-primary" /> {t('appStyle')}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>{t('theme')}</Label>
              <ThemeToggle theme={preferences.theme} onThemeChange={(t: Theme) => handleSettingChange('theme', t)} />
            </div>
            <div className="space-y-3">
              <Label>{t('language')}</Label>
              <Select value={language} onValueChange={(l: Language) => { setLanguage(l); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card id="ai" className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="h-5 w-5 text-primary" /> {t('aiSettings')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>{t('responseStyle')}</Label>
               <div className="grid grid-cols-3 gap-2">{verbosityLevels.map(({ id, label }) => (
                  <Button key={id} variant={preferences.aiVerbosity === id ? 'default' : 'outline'} onClick={() => handleSettingChange('aiVerbosity', id)} className="h-10 text-xs">{label}</Button>
              ))}</div>
            </div>
            <div className="space-y-3">
              <Label>{t('analysisPriority')}</Label>
               <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">{aiFocusOptions.map(({ id, label }) => (
                  <Button key={id} variant={preferences.aiFocusPriority === id ? 'default' : 'outline'} onClick={() => handleSettingChange('aiFocusPriority', id)} className="h-10 text-[10px] sm:text-xs">{label}</Button>
              ))}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><HardDrive className="h-5 w-5 text-primary" /> {t('privacy')}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/10">
                <div className="space-y-0.5">
                    <p className="text-sm font-semibold">AI API Usage</p>
                    <p className="text-xs text-muted-foreground">Transparency on AI usage.</p>
                </div>
                <Badge variant="secondary" className="px-3 py-1 font-mono">{usage.callCount} Calls</Badge>
            </div>
            <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="outline" className="w-full h-11 text-destructive hover:bg-destructive/5"><Trash2 className="mr-2 h-4 w-4" /> {t('clearHistory')}</Button></AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>{t('clearHistoryConfirmTitle')}</AlertDialogTitle><AlertDialogDescription>{t('clearHistoryConfirmDescription')}</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel disabled={isClearing}>{t('cancel')}</AlertDialogCancel><AlertDialogAction onClick={handleClearHistory} disabled={isClearing} className="bg-destructive text-destructive-foreground">{t('confirm')}</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
        
        <div className="grid gap-4">
            <Card>
                <CardContent className="p-2 divide-y">
                     <Button variant="ghost" className="w-full justify-between h-12">
                        <div className="flex items-center gap-2"><HelpCircle className="h-4 w-4" /> {t('support')}</div>
                        <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                     </Button>
                     <Button variant="ghost" className="w-full justify-between h-12 text-destructive hover:bg-destructive/10">
                        <div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Request Deletion</div>
                        <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                     </Button>
                </CardContent>
            </Card>
            <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">SmartScan AI • v1.0.0 • 2026</p>
            </div>
        </div>
      </div>
    </div>
  );
}

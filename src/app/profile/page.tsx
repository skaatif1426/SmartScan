'use client';
import { useState } from 'react';
import { Settings as SettingsIcon, Languages, Leaf, ShieldAlert, Zap, BrainCircuit, MessageCircle, Sparkles, BarChart2, HeartPulse, History, Scan, Compass, Trash2, Award, Nut, Wheat, Milk, Egg, Fish, Bean, UtensilsCrossed, X, Vegan, Beef, Donut, Salad, Dumbbell, Car, CircleDollarSign, Target, EggFried, Wallet, Recycle, BookOpen, HeartHandshake, ShieldCheck, Bookmark, Bell, ArrowRight, Flame } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useLanguage, usePreferences } from '@/contexts/AppProviders';
import { useAiUsage } from '@/hooks/useAiUsage';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useDiscovery } from '@/hooks/useDiscovery';
import type { Language, AiVerbosity, HealthGoal, DataRetention, DietType, HealthFocus } from '@/lib/types';
import { cn } from '@/lib/utils';
import Achievements from '@/components/dashboard/Achievements';
import { useGamification } from '@/hooks/useGamification';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const languages: Language[] = ['English', 'Hindi', 'Marathi', 'Hinglish'];
const verbosityLevels: {id: AiVerbosity, label: string}[] = [
    {id: 'concise', label: 'Concise'},
    {id: 'balanced', label: 'Balanced'},
    {id: 'detailed', label: 'Detailed'},
];
const dietTypes: {id: DietType, label: string, icon: React.ElementType}[] = [
    {id: 'none', label: 'None', icon: UtensilsCrossed},
    {id: 'vegetarian', label: 'Vegetarian', icon: Leaf},
    {id: 'vegan', label: 'Vegan', icon: Vegan},
    {id: 'non-vegetarian', label: 'Non-Veg', icon: Beef},
    {id: 'eggetarian', label: 'Eggetarian', icon: EggFried},
    {id: 'keto', label: 'Keto', icon: Donut},
    {id: 'paleo', label: 'Paleo', icon: Salad},
]
const healthGoals: {id: HealthGoal, label: string}[] = [
    {id: 'general', label: 'General Wellness'},
    {id: 'weight-loss', label: 'Weight Loss'},
    {id: 'muscle-gain', label: 'Muscle Gain'},
    {id: 'maintain-weight', label: 'Maintain Weight'},
    {id: 'improve-diet', label: 'Improve Diet'},
    {id: 'manage-condition', label: 'Manage Condition'},
];
const healthFocuses: {id: HealthFocus, label: string, icon: React.ElementType}[] = [
    {id: 'low-sugar', label: 'Low Sugar', icon: Donut},
    {id: 'low-fat', label: 'Low Fat', icon: Donut},
    {id: 'high-protein', label: 'High Protein', icon: Dumbbell},
    {id: 'low-carb', label: 'Low Carb', icon: Car},
    {id: 'high-fiber', label: 'High Fiber', icon: Leaf},
    {id: 'low-sodium', label: 'Low Sodium', icon: Donut},
    {id: 'organic', label: 'Organic', icon: Leaf},
    {id: 'budget-friendly', label: 'Budget-Friendly', icon: CircleDollarSign},
    {id: 'overall-health', label: 'Overall Health', icon: HeartHandshake },
    {id: 'price-conscious', label: 'Price Conscious', icon: Wallet },
    {id: 'clean-ingredients', label: 'Clean Ingredients', icon: BookOpen },
    {id: 'eco-friendly', label: 'Eco-Friendly', icon: Recycle },
]
const retentionPeriods: DataRetention[] = ['30d', '90d', 'forever'];

const ProfileStatCard = ({ title, value, icon: Icon, isLoading }: { title: string, value: React.ReactNode, icon: React.ElementType, isLoading: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <Skeleton className="h-7 w-16" />
            ) : (
                <div className="text-2xl font-bold">{value}</div>
            )}
        </CardContent>
    </Card>
);

const commonAllergies = [
    { name: 'Nuts', icon: Nut },
    { name: 'Gluten', icon: Wheat },
    { name: 'Dairy', icon: Milk },
    { name: 'Eggs', icon: Egg },
    { name: 'Seafood', icon: Fish },
    { name: 'Soy', icon: Bean },
];

export default function ProfilePage() {
  const { language, setLanguage, t } = useLanguage();
  const { preferences, savePreferences } = usePreferences();
  const { usage, resetAiCallCount, isLoaded: isAiUsageLoaded } = useAiUsage();
  const { history, clearHistory, isLoaded: isHistoryLoaded, scanStreak } = useScanHistory();
  const { analytics, resetErrorCount, isLoaded: isAnalyticsLoaded } = useAnalytics();
  const { discoveryCount, contributorLevel, isLoaded: isDiscoveryLoaded } = useDiscovery();
  const [isClearing, setIsClearing] = useState(false);
  const { level, xp, getLevelProgress, isLoaded: isGamificationLoaded } = useGamification();
  const [customAllergyInput, setCustomAllergyInput] = useState('');

  const handleAllergyToggle = (allergy: string) => {
      const lowerCaseAllergy = allergy.toLowerCase();
      const newAllergies = preferences.allergies.map(a => a.toLowerCase()).includes(lowerCaseAllergy)
          ? preferences.allergies.filter(a => a.toLowerCase() !== lowerCaseAllergy)
          : [...preferences.allergies, allergy];
      savePreferences({ allergies: newAllergies });
  };
  
  const handleAddCustomAllergy = () => {
      const newAllergy = customAllergyInput.trim();
      const lowerCaseNewAllergy = newAllergy.toLowerCase();
      if (newAllergy && !preferences.allergies.map(a => a.toLowerCase()).includes(lowerCaseNewAllergy)) {
          const newAllergies = [...preferences.allergies, newAllergy];
          savePreferences({ allergies: newAllergies });
          setCustomAllergyInput('');
      }
  };

  const handleCustomAllergyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleAddCustomAllergy();
    }
  };
  
  const handleRemoveAllergy = (allergy: string) => {
      const newAllergies = preferences.allergies.filter(a => a.toLowerCase() !== allergy.toLowerCase());
      savePreferences({ allergies: newAllergies });
  };
  
  const handleClearHistory = () => {
    setIsClearing(true);
    clearHistory();
  }

  const handleHealthFocusToggle = (focus: HealthFocus) => {
      const newFocuses = preferences.healthFocus.includes(focus)
          ? preferences.healthFocus.filter(f => f !== focus)
          : [...preferences.healthFocus, focus];
      savePreferences({ healthFocus: newFocuses });
  }

  const retentionLabels: { [key in DataRetention]: string } = {
    '30d': t('retention30d'),
    '90d': t('retention90d'),
    'forever': t('retentionForever'),
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
        <div className="animate-in fade-in duration-300 space-y-2">
            {(isDiscoveryLoaded && isGamificationLoaded) ? (
                <>
                    <div className="flex justify-between items-center">
                         <h1 className="text-3xl font-bold flex items-center gap-2">
                            {contributorLevel.title} {contributorLevel.icon}
                        </h1>
                        <div className="font-bold text-lg">Level {level}</div>
                    </div>
                    <Progress value={getLevelProgress()} className="h-2" />
                    <p className="text-sm text-muted-foreground text-right">{Math.floor(xp % 200)} / 200 XP</p>
                </>
            ) : (
                <>
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-2 w-full mt-2" />
                </>
            )}
        </div>

        <div className="grid gap-4 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100">
             <ProfileStatCard 
                title="Total Scans"
                value={history.length}
                icon={Scan}
                isLoading={!isHistoryLoaded}
             />
             <ProfileStatCard 
                title="Discoveries"
                value={discoveryCount}
                icon={Compass}
                isLoading={!isDiscoveryLoaded}
             />
             <ProfileStatCard 
                title="Scan Streak"
                value={<>{scanStreak} <span className="text-base text-muted-foreground">days</span></>}
                icon={Flame}
                isLoading={!isHistoryLoaded}
             />
        </div>

        <Separator className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200" />
        
        <Card className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Award /> {t('achievements')}</CardTitle>
            </CardHeader>
            <CardContent>
                <Achievements history={history} />
            </CardContent>
        </Card>
      
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <SettingsIcon className="text-primary" /> {t('settingsTitle')}
            </h2>

             <Accordion type="multiple" className="w-full space-y-4">
                <Card>
                  <AccordionItem value="language-settings" className="border-b-0">
                      <AccordionTrigger className="p-6 hover:no-underline">
                        <CardTitle className="flex items-center gap-2"><Languages /> {t('language')}</CardTitle>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pt-0 pb-6">
                        <Select
                            value={language}
                            onValueChange={(value: Language) => setLanguage(value)}
                        >
                            <SelectTrigger aria-label={t('language')}>
                            <SelectValue placeholder={t('language')} />
                            </SelectTrigger>
                            <SelectContent>
                            {languages.map(lang => (
                                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                      </AccordionContent>
                  </AccordionItem>
                </Card>

                <Card>
                  <AccordionItem value="food-preferences" className="border-b-0">
                     <AccordionTrigger className="p-6 hover:no-underline text-left">
                        <CardTitle className="flex items-center gap-2"><Leaf /> Food Preferences</CardTitle>
                        <CardDescription className="!mt-1">Your diet, allergies, and restrictions.</CardDescription>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pt-0 pb-6 space-y-6">
                          <div>
                              <Label className="font-semibold text-base">Diet</Label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                  {dietTypes.map(({ id, label, icon: Icon }) => (
                                      <Button key={id} variant={preferences.diet === id ? 'default' : 'outline'} onClick={() => savePreferences({ diet: id })} className="justify-start h-12">
                                          <Icon className="mr-2 h-4 w-4" /> {label}
                                      </Button>
                                  ))}
                              </div>
                          </div>
                           <div className="space-y-4">
                              <Label className="font-semibold text-base">Allergies</Label>
                              <div className="flex flex-wrap gap-2">
                                  {commonAllergies.map(({ name, icon: Icon }) => (
                                      <Button
                                          key={name}
                                          variant={preferences.allergies.map(a=>a.toLowerCase()).includes(name.toLowerCase()) ? 'default' : 'outline'}
                                          onClick={() => handleAllergyToggle(name)}
                                      >
                                          <Icon className="mr-2 h-4 w-4" />
                                          {name}
                                      </Button>
                                  ))}
                              </div>
                              <div className="flex flex-wrap gap-2 pt-2">
                                  {preferences.allergies.map((allergy) => (
                                      <Badge key={allergy} variant="secondary" className="text-base py-1 pl-3 pr-1">
                                          {allergy}
                                          <Button size="icon" variant="ghost" className="h-6 w-6 ml-1" onClick={() => handleRemoveAllergy(allergy)}>
                                              <X className="h-3 w-3" />
                                          </Button>
                                      </Badge>
                                  ))}
                              </div>
                              <div className="flex gap-2">
                                  <Input 
                                      placeholder="Add other allergies..."
                                      value={customAllergyInput}
                                      onChange={(e) => setCustomAllergyInput(e.target.value)}
                                      onKeyDown={handleCustomAllergyKeyDown}
                                  />
                                  <Button onClick={handleAddCustomAllergy}>Add</Button>
                              </div>
                          </div>
                           <div className="flex items-center justify-between rounded-lg border p-4">
                              <div>
                                  <Label htmlFor="strict-mode-switch" className="flex items-center gap-2 font-semibold"><ShieldCheck/> Strict Mode</Label>
                                  <p className="text-sm text-muted-foreground">Enable high-sensitivity alerts for allergens.</p>
                              </div>
                              <Switch
                                  id="strict-mode-switch"
                                  checked={preferences.strictMode}
                                  onCheckedChange={(checked) => savePreferences({ strictMode: Boolean(checked) })}
                                  aria-label="Strict mode for allergies"
                              />
                          </div>
                      </AccordionContent>
                  </AccordionItem>
                </Card>
                
                <Card>
                  <AccordionItem value="ai-personalization" className="border-b-0">
                      <AccordionTrigger className="p-6 hover:no-underline text-left">
                        <CardTitle className="flex items-center gap-2"><Sparkles /> {t('personalizationTitle')}</CardTitle>
                        <CardDescription className="!mt-1">Customize the AI's personality and focus.</CardDescription>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pt-0 pb-6 space-y-6">
                          <div>
                              <Label>{t('aiVerbosity')}</Label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                                  {verbosityLevels.map(({ id, label }) => (
                                      <Button key={id} variant={preferences.aiVerbosity === id ? 'default' : 'outline'} onClick={() => savePreferences({ aiVerbosity: id })}>
                                          {label}
                                      </Button>
                                  ))}
                              </div>
                          </div>
                          <div>
                              <Label>{t('healthGoal')}</Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                  {healthGoals.map(({ id, label }) => (
                                      <Button key={id} variant={preferences.healthGoal === id ? 'default' : 'outline'} onClick={() => savePreferences({ healthGoal: id })}>
                                          {label}
                                      </Button>
                                  ))}
                              </div>
                          </div>
                          <div>
                              <Label className="flex items-center gap-2"><Target /> Focus Areas</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                  {healthFocuses.map(({ id, label, icon: Icon }) => (
                                      <Button
                                          key={id}
                                          variant={preferences.healthFocus.includes(id) ? 'default' : 'outline'}
                                          onClick={() => handleHealthFocusToggle(id)}
                                      >
                                          <Icon className="mr-2 h-4 w-4" />
                                          {label}
                                      </Button>
                                  ))}
                              </div>
                          </div>
                      </AccordionContent>
                  </AccordionItem>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bookmark /> Saved Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground text-center py-4">You have no saved items yet.</p>
                    </CardContent>
                </Card>

                <Card>
                    <AccordionItem value="notifications" className="border-b-0">
                        <AccordionTrigger className="p-6 hover:no-underline text-left">
                            <CardTitle className="flex items-center gap-2"><Bell /> Notifications</CardTitle>
                            <CardDescription className="!mt-1">Manage app alerts and reminders.</CardDescription>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pt-0 pb-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="goal-reminders-switch">Goal Reminders</Label>
                                    <p className="text-sm text-muted-foreground">Receive encouragement for your goals.</p>
                                </div>
                                <Switch
                                    id="goal-reminders-switch"
                                    checked={preferences.notifications.goalReminders}
                                    onCheckedChange={(checked) => savePreferences({ notifications: { ...preferences.notifications, goalReminders: checked } })}
                                    aria-label="Goal Reminders"
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
                                    aria-label="Scan Reminders"
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
                                    aria-label="New Insight Alerts"
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Card>

                <Card>
                  <AccordionItem value="data-privacy" className="border-b-0">
                      <AccordionTrigger className="p-6 hover:no-underline text-left">
                        <CardTitle className="flex items-center gap-2"><History />{t('dataPrivacy')}</CardTitle>
                        <CardDescription className="!mt-1">{t('dataPrivacyDescription')}</CardDescription>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pt-0 pb-6 space-y-6">
                           <div>
                              <Label htmlFor="data-retention-select">{t('dataRetention')}</Label>
                              <Select
                                  value={preferences.dataRetention}
                                  onValueChange={(value: DataRetention) => savePreferences({ dataRetention: value })}
                              >
                                  <SelectTrigger id="data-retention-select" aria-label={t('dataRetention')}>
                                      <SelectValue placeholder={t('dataRetention')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {retentionPeriods.map(period => (
                                          <SelectItem key={period} value={period}>{retentionLabels[period]}</SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                          </div>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="destructive" className="w-full sm:w-auto">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      {t('clearHistory')}
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                  <AlertDialogTitle>{t('clearHistoryConfirmTitle')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('clearHistoryConfirmDescription')}
                                  </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                  <AlertDialogCancel disabled={isClearing}>{t('cancel')}</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleClearHistory} disabled={isClearing}>
                                      {isClearing ? t('clearing') : t('confirm')}
                                  </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                      </AccordionContent>
                  </AccordionItem>
                </Card>

                <Card>
                    <AccordionItem value="advanced" className="border-b-0">
                        <AccordionTrigger className="p-6 hover:no-underline">
                           <CardTitle className="flex items-center gap-2"><Zap /> {t('advancedSettings')}</CardTitle>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pt-0 pb-6 space-y-6">
                          <div className="flex items-center justify-between">
                              <div>
                                  <Label htmlFor="advanced-ui-switch">{t('advancedUiMode')}</Label>
                                  <p className="text-sm text-muted-foreground">{t('advancedUiModeDescription')}</p>
                              </div>
                              <Switch
                                  id="advanced-ui-switch"
                                  checked={preferences.advancedUiMode}
                                  onCheckedChange={(checked) => savePreferences({ advancedUiMode: Boolean(checked) })}
                                  aria-label={t('advancedUiMode')}
                              />
                          </div>
                          {preferences.advancedUiMode && (
                              <>
                              <div className="border-t pt-6 space-y-4">
                                  <div className="flex items-center justify-between">
                                      <Label htmlFor="ai-insights-switch" className="flex items-center gap-2"><Sparkles /> {t('aiInsights')}</Label>
                                      <Switch
                                      id="ai-insights-switch"
                                      checked={preferences.aiInsightsEnabled}
                                      onCheckedChange={(checked) => savePreferences({ aiInsightsEnabled: Boolean(checked) })}
                                      aria-label={t('aiInsights')}
                                      />
                                  </div>
                                  <div className="flex items-center justify-between">
                                      <Label htmlFor="ai-chat-switch" className="flex items-center gap-2"><MessageCircle /> {t('aiChat')}</Label>
                                      <Switch
                                      id="ai-chat-switch"
                                      checked={preferences.aiChatEnabled}
                                      onCheckedChange={(checked) => savePreferences({ aiChatEnabled: Boolean(checked) })}
                                      aria-label={t('aiChat')}
                                      />
                                  </div>
                              </div>
                              <div className="border-t pt-6">
                                  <div className="flex items-center justify-between">
                                      <div>
                                          <Label htmlFor="ai-usage-stats" className="flex items-center gap-2"><BrainCircuit /> {t('aiUsage')}</Label>
                                          <p className="text-sm text-muted-foreground">{t('aiUsageDescription')}</p>
                                      </div>
                                      <Button variant="ghost" size="sm" onClick={resetAiCallCount}>{t('reset')}</Button>
                                  </div>
                                  {isAiUsageLoaded ? (
                                      <div id="ai-usage-stats" className="mt-2 text-lg font-semibold">{usage.callCount} <span className="text-sm text-muted-foreground font-normal">{t('aiApiCalls')}</span></div>
                                  ) : (
                                      <Skeleton className="h-7 w-32 mt-2" />
                                  )}
                              </div>
                              <div className="border-t pt-6">
                                      <div className="flex items-center justify-between">
                                          <div>
                                              <Label htmlFor="analytics-stats" className="flex items-center gap-2"><BarChart2 /> {t('analytics')}</Label>
                                              <p className="text-sm text-muted-foreground">{t('analyticsDescription')}</p>
                                          </div>
                                          <Button variant="ghost" size="sm" onClick={resetErrorCount}>{t('resetErrors')}</Button>
                                      </div>
                                      {(isHistoryLoaded && isAnalyticsLoaded) ? (
                                          <div id="analytics-stats" className="mt-2 grid grid-cols-2 gap-4 text-center">
                                              <div>
                                                  <p className="text-lg font-semibold">{history.length}</p>
                                                  <p className="text-sm text-muted-foreground font-normal">{t('totalScans')}</p>
                                              </div>
                                              <div>
                                                  <p className="text-lg font-semibold">{analytics.errorCount}</p>
                                                  <p className="text-sm text-muted-foreground font-normal">{t('errorsTracked')}</p>
                                              </div>
                                          </div>
                                      ) : (
                                          <Skeleton className="h-12 w-full mt-2" />
                                      )}
                                  </div>
                              </>
                          )}
                        </AccordionContent>
                    </AccordionItem>
                </Card>
            </Accordion>
        </div>
    </div>
  );
}
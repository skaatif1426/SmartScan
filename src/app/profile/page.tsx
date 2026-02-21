'use client';
import { useMemo } from 'react';
import { Settings as SettingsIcon, Languages, Leaf, Drumstick, ShieldAlert, Zap, BrainCircuit, MessageCircle, Sparkles, BarChart2, HeartPulse, History, Scan, Compass } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useLanguage, usePreferences } from '@/contexts/AppProviders';
import { useAiUsage } from '@/hooks/useAiUsage';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useDiscovery } from '@/hooks/useDiscovery';
import type { Language, AiVerbosity, HealthGoal, DataRetention } from '@/lib/types';
import { cn } from '@/lib/utils';

const languages: Language[] = ['English', 'Hindi', 'Marathi', 'Hinglish'];
const verbosityLevels: AiVerbosity[] = ['concise', 'detailed'];
const healthGoals: HealthGoal[] = ['general', 'weight-loss', 'muscle-gain'];
const retentionPeriods: DataRetention[] = ['30d', '90d', 'forever'];

const getHealthScoreTextColor = (score: number | null) => {
    if (score === null) return '';
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
};

const ProfileStatCard = ({ title, value, icon: Icon, valueClassName, isLoading }: { title: string, value: React.ReactNode, icon: React.ElementType, valueClassName?: string, isLoading: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <Skeleton className="h-7 w-16" />
            ) : (
                <div className={cn("text-2xl font-bold", valueClassName)}>{value}</div>
            )}
        </CardContent>
    </Card>
);

export default function ProfilePage() {
  const { language, setLanguage, t } = useLanguage();
  const { preferences, savePreferences } = usePreferences();
  const { usage, resetAiCallCount, isLoaded: isAiUsageLoaded } = useAiUsage();
  const { history, isLoaded: isHistoryLoaded } = useScanHistory();
  const { analytics, resetErrorCount, isLoaded: isAnalyticsLoaded } = useAnalytics();
  const { discoveryCount, contributorLevel, isLoaded: isDiscoveryLoaded } = useDiscovery();

  const handleAllergyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const allergies = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    savePreferences({ allergies });
  };
  
  const averageScore = useMemo(() => {
    const scores = history.map(item => item.healthScore).filter(score => score !== undefined) as number[];
    if (scores.length === 0) return null;
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round(sum / scores.length);
  }, [history]);

  const healthGoalLabels: { [key in HealthGoal]: string } = {
    'general': t('generalWellness'),
    'weight-loss': t('weightLoss'),
    'muscle-gain': t('muscleGain'),
  };

  const retentionLabels: { [key in DataRetention]: string } = {
    '30d': t('retention30d'),
    '90d': t('retention90d'),
    'forever': t('retentionForever'),
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
        {/* Profile Header */}
        <div className="animate-in fade-in duration-300 space-y-1">
            {isDiscoveryLoaded ? (
                <>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        {contributorLevel.title} {contributorLevel.icon}
                    </h1>
                    <p className="text-lg text-muted-foreground">Building smarter food choices</p>
                </>
            ) : (
                <>
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-7 w-64" />
                </>
            )}
        </div>

        {/* User Info Stats */}
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
                title="Avg. Score"
                value={averageScore !== null ? (
                    <>{averageScore}<span className="text-sm font-normal text-muted-foreground">/100</span></>
                ) : '-'}
                icon={HeartPulse}
                valueClassName={getHealthScoreTextColor(averageScore)}
                isLoading={!isHistoryLoaded}
             />
        </div>

        <Separator className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200" />
      
        {/* Settings Section */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <SettingsIcon className="text-primary" /> {t('settingsTitle')}
            </h2>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Languages /> {t('language')}</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2"><Leaf /> {t('preferences')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="vegetarian-switch" className="flex items-center gap-2"><Leaf className="text-green-600" /> {t('vegetarian')}</Label>
                    <Switch
                    id="vegetarian-switch"
                    checked={preferences.isVeg}
                    onCheckedChange={(checked) => savePreferences({ isVeg: checked })}
                    aria-label={t('vegetarian')}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor="non-vegetarian-switch" className="flex items-center gap-2"><Drumstick className="text-red-600" /> {t('nonVegetarian')}</Label>
                    <Switch
                    id="non-vegetarian-switch"
                    checked={preferences.isNonVeg}
                    onCheckedChange={(checked) => savePreferences({ isNonVeg: checked })}
                    aria-label={t('nonVegetarian')}
                    />
                </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldAlert /> {t('allergies')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Label htmlFor="allergies-input">{t('allergiesPlaceholder')}</Label>
                    <Input 
                        id="allergies-input"
                        placeholder={t('allergiesPlaceholder')}
                        defaultValue={preferences.allergies.join(', ')}
                        onBlur={handleAllergyChange}
                        aria-label={t('allergies')}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><HeartPulse /> {t('personalizationTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label htmlFor="ai-verbosity-select">{t('aiVerbosity')}</Label>
                        <Select
                            value={preferences.aiVerbosity}
                            onValueChange={(value: AiVerbosity) => savePreferences({ aiVerbosity: value })}
                        >
                            <SelectTrigger id="ai-verbosity-select" aria-label={t('aiVerbosity')}>
                                <SelectValue placeholder={t('aiVerbosity')} />
                            </SelectTrigger>
                            <SelectContent>
                                {verbosityLevels.map(level => (
                                    <SelectItem key={level} value={level}>{t(level as 'concise' | 'detailed')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="health-goal-select">{t('healthGoal')}</Label>
                        <Select
                            value={preferences.healthGoal}
                            onValueChange={(value: HealthGoal) => savePreferences({ healthGoal: value })}
                        >
                            <SelectTrigger id="health-goal-select" aria-label={t('healthGoal')}>
                                <SelectValue placeholder={t('healthGoal')} />
                            </SelectTrigger>
                            <SelectContent>
                                {healthGoals.map(goal => (
                                    <SelectItem key={goal} value={goal}>{healthGoalLabels[goal]}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Zap /> {t('advancedSettings')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="advanced-ui-switch">{t('advancedUiMode')}</Label>
                            <p className="text-sm text-muted-foreground">{t('advancedUiModeDescription')}</p>
                        </div>
                        <Switch 
                            id="advanced-ui-switch"
                            checked={preferences.advancedUiMode}
                            onCheckedChange={(checked) => savePreferences({ advancedUiMode: checked })}
                            aria-label={t('advancedUiMode')}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="ai-insights-switch" className="flex items-center gap-2"><Sparkles /> {t('aiInsights')}</Label>
                        <Switch
                        id="ai-insights-switch"
                        checked={preferences.aiInsightsEnabled}
                        onCheckedChange={(checked) => savePreferences({ aiInsightsEnabled: checked })}
                        aria-label={t('aiInsights')}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="ai-chat-switch" className="flex items-center gap-2"><MessageCircle /> {t('aiChat')}</Label>
                        <Switch
                        id="ai-chat-switch"
                        checked={preferences.aiChatEnabled}
                        onCheckedChange={(checked) => savePreferences({ aiChatEnabled: checked })}
                        aria-label={t('aiChat')}
                        />
                    </div>

                    {preferences.advancedUiMode && (
                        <>
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
                            <div className="border-t pt-6">
                            <div>
                                <Label htmlFor="data-retention-select" className="flex items-center gap-2"><History />{t('dataPrivacy')}</Label>
                                <p className="text-sm text-muted-foreground">{t('dataRetention')}</p>
                            </div>
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
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

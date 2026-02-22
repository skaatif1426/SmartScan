'use client';
import { useState } from 'react';
import { Settings as SettingsIcon, Languages, Leaf, ShieldAlert, Zap, BrainCircuit, MessageCircle, Sparkles, BarChart2, HeartPulse, History, Scan, Compass, Trash2, Award, Nut, Wheat, Milk, Egg, Fish, Bean, UtensilsCrossed, X, Vegan, Beef, Donut, Salad, Dumbbell, Car, CircleDollarSign, Target, EggFried, Wallet, Recycle, BookOpen, HeartHandshake, ShieldCheck, Bookmark, Bell, ArrowRight, Flame, ChevronRight } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { usePreferences } from '@/contexts/AppProviders';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useDiscovery } from '@/hooks/useDiscovery';
import type { DietType, HealthFocus } from '@/lib/types';
import { cn } from '@/lib/utils';
import Achievements from '@/components/dashboard/Achievements';
import { useGamification } from '@/hooks/useGamification';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const dietTypes: {id: DietType, label: string, icon: React.ElementType}[] = [
    {id: 'none', label: 'None', icon: UtensilsCrossed},
    {id: 'vegetarian', label: 'Vegetarian', icon: Leaf},
    {id: 'vegan', label: 'Vegan', icon: Vegan},
    {id: 'non-vegetarian', label: 'Non-Veg', icon: Beef},
    {id: 'eggetarian', label: 'Eggetarian', icon: EggFried},
    {id: 'keto', label: 'Keto', icon: Donut},
    {id: 'paleo', label: 'Paleo', icon: Salad},
]
const healthGoals: {id: any, label: string}[] = [
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
  const { preferences, savePreferences } = usePreferences();
  const { history, isLoaded: isHistoryLoaded, scanStreak } = useScanHistory();
  const { discoveryCount, contributorLevel, isLoaded: isDiscoveryLoaded } = useDiscovery();
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
  
  const handleHealthFocusToggle = (focus: HealthFocus) => {
      const newFocuses = preferences.healthFocus.includes(focus)
          ? preferences.healthFocus.filter(f => f !== focus)
          : [...preferences.healthFocus, focus];
      savePreferences({ healthFocus: newFocuses });
  }

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
      
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
            <Accordion type="multiple" className="w-full space-y-4" defaultValue={['achievements']}>
                <Card>
                    <AccordionItem value="achievements" className="border-b-0">
                        <AccordionTrigger className="p-6 hover:no-underline">
                            <CardTitle className="flex items-center gap-2"><Award /> Achievements</CardTitle>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                            <Achievements history={history} />
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
                        <CardTitle className="flex items-center gap-2"><Sparkles /> AI Personalization</CardTitle>
                        <CardDescription className="!mt-1">Customize the AI's analysis for your goals.</CardDescription>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pt-0 pb-6 space-y-6">
                          <div>
                              <Label>Primary Goal</Label>
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
            </Accordion>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bookmark /> Saved Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">You have no saved items yet.</p>
                </CardContent>
            </Card>

            <Link href="/settings" className="block">
                <Card className="hover:bg-muted/50 active:scale-[0.98] transition-all">
                    <CardHeader className="flex-row items-center justify-between p-4">
                        <CardTitle className="flex items-center gap-2 text-lg"><SettingsIcon /> System Settings</CardTitle>
                        <ChevronRight />
                    </CardHeader>
                </Card>
            </Link>
        </div>
    </div>
  );
}

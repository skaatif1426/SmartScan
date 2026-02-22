'use client';
import { useState } from 'react';
import { Settings as SettingsIcon, Award, Leaf, Sparkles, Scan, Compass, Flame, ChevronRight, Bookmark } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { usePreferences } from '@/contexts/AppProviders';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useDiscovery } from '@/hooks/useDiscovery';
import { useGamification } from '@/hooks/useGamification';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import Achievements from '@/components/dashboard/Achievements';

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

export default function ProfilePage() {
  const { preferences, savePreferences } = usePreferences();
  const { history, isLoaded: isHistoryLoaded, scanStreak } = useScanHistory();
  const { discoveryCount, contributorLevel, isLoaded: isDiscoveryLoaded } = useDiscovery();
  const { level, xp, getLevelProgress, isLoaded: isGamificationLoaded } = useGamification();

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
                        <CardTitle className="flex items-center gap-2"><Leaf /> Food &amp; Diet</CardTitle>
                        <CardDescription className="!mt-1">Your diet, allergies, and health goals.</CardDescription>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pt-0 pb-6 space-y-6">
                          {/* Food and Diet settings remain here as they are user personalization */}
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
                           {/* AI personalization settings remain here */}
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

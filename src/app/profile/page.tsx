'use client';

import { Settings as SettingsIcon, Award, User as UserIcon, Mail, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePreferences } from '@/contexts/AppProviders';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useDiscovery } from '@/hooks/useDiscovery';
import { useGamification } from '@/hooks/useGamification';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import Achievements from '@/components/dashboard/Achievements';

export default function ProfilePage() {
  const { preferences } = usePreferences();
  const { history } = useScanHistory();
  const { contributorLevel } = useDiscovery();
  const { level, xp, getLevelProgress } = useGamification();

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-2xl mx-auto pb-20">
        {/* IDENTITY BLOCK */}
        <div className="flex flex-col items-center text-center space-y-4 pt-4">
            <div className="relative">
                <Avatar className="h-28 w-28 border-4 border-background shadow-2xl">
                    <AvatarImage src={preferences.profilePicUrl || undefined} className="object-cover" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
                        {preferences.name?.charAt(0) || <UserIcon className="h-10 w-10" />}
                    </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full border-4 border-background shadow-lg">
                    LVL {level}
                </div>
            </div>
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">{preferences.name || 'Smart Scanner'}</h1>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> {preferences.email || 'Welcome to SmartScan AI'}
                </p>
            </div>
        </div>

        {/* PROGRESS BLOCK */}
        <Card className="border shadow-sm">
            <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Contributor Rank</p>
                        <div className="text-lg font-bold text-primary flex items-center gap-2">
                            {contributorLevel.icon} {contributorLevel.title}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">XP Progress</p>
                        <p className="text-sm font-bold">{Math.floor(xp % 200)} / 200</p>
                    </div>
                </div>
                <Progress value={getLevelProgress()} className="h-3 bg-muted border" />
                <p className="text-[10px] text-center text-muted-foreground">Scan more items to reach Level {level + 1}</p>
            </CardContent>
        </Card>

        <Separator />

        {/* ACHIEVEMENTS */}
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" /> 
                    Unlocked Rewards
                </h2>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Collection
                </span>
            </div>
            <Card className="border shadow-sm">
                <CardContent className="p-6">
                    <Achievements history={history} />
                </CardContent>
            </Card>
        </div>

        {/* SYSTEM CONTROLS - SINGLE SOURCE */}
        <div className="pt-4">
            <Link href="/settings" className="block transition-transform active:scale-[0.98]">
                <Button variant="outline" className="w-full justify-between h-16 px-6 text-lg font-bold rounded-2xl border-2 hover:bg-muted/50 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <SettingsIcon className="h-6 w-6 text-primary" />
                        </div>
                        Settings & Preferences
                    </div>
                    <ChevronRight className="h-6 w-6 text-muted-foreground" />
                </Button>
            </Link>
        </div>
    </div>
  );
}

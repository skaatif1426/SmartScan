'use client';

import { useRef } from 'react';
import { Settings as SettingsIcon, Award, Leaf, Sparkles, Scan, Compass, Flame, ChevronRight, User as UserIcon, Mail, Camera } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePreferences } from '@/contexts/AppProviders';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useDiscovery } from '@/hooks/useDiscovery';
import { useGamification } from '@/hooks/useGamification';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import Achievements from '@/components/dashboard/Achievements';
import { useToast } from '@/hooks/use-toast';

const StatBox = ({ label, value, icon: Icon, isLoading }: { label: string, value: string | number, icon: any, isLoading: boolean }) => (
    <div className="flex flex-col items-center justify-center p-3 bg-muted/30 rounded-xl border">
        <Icon className="h-4 w-4 text-muted-foreground mb-1" />
        {isLoading ? (
            <Skeleton className="h-6 w-10" />
        ) : (
            <div className="text-lg font-bold">{value}</div>
        )}
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
    </div>
);

const PreviewSection = ({ title, icon: Icon, value, href }: { title: string, icon: any, value: string, href: string }) => (
    <Link href={href}>
        <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{value}</p>
                </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
    </Link>
);

export default function ProfilePage() {
  const { preferences, savePreferences, isSettingsLoaded } = usePreferences();
  const { history, isLoaded: isHistoryLoaded, scanStreak } = useScanHistory();
  const { discoveryCount, contributorLevel, isLoaded: isDiscoveryLoaded } = useDiscovery();
  const { level, xp, getLevelProgress } = useGamification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const dietaryPreview = [
    preferences.diet !== 'none' ? preferences.diet : 'No diet set',
    preferences.allergies.length > 0 ? `${preferences.allergies.length} allergies` : 'No allergies'
  ].join(' • ');

  const aiPreview = [
    `${preferences.aiVerbosity} responses`,
    `${preferences.aiFocusPriority} focus`
  ].join(' • ');

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 2MB limit
      if (file.size > 2 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'Image too large',
          description: 'Please select an image smaller than 2MB.',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        savePreferences({ profilePicUrl: reader.result as string });
        toast({
          title: 'Profile updated',
          description: 'Your profile picture has been saved.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
        {/* IDENTITY BLOCK */}
        <div className="flex flex-col items-center text-center space-y-4 pt-2">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl group-hover:opacity-90 transition-opacity">
                    <AvatarImage src={preferences.profilePicUrl || undefined} className="object-cover" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                        {preferences.name?.charAt(0) || <UserIcon />}
                    </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/40 rounded-full p-2">
                        <Camera className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full border-2 border-background">
                    LVL {level}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
            </div>
            <div>
                <h1 className="text-2xl font-bold">{preferences.name || 'User'}</h1>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Mail className="h-3 w-3" /> {preferences.email || 'No email set'}
                </p>
            </div>
        </div>

        {/* PROGRESS BLOCK */}
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                 <div className="text-sm font-semibold text-primary">{contributorLevel.title} {contributorLevel.icon}</div>
                 <div className="text-xs text-muted-foreground">XP: {Math.floor(xp % 200)} / 200</div>
            </div>
            <Progress value={getLevelProgress()} className="h-2 bg-muted border" />
        </div>

        {/* QUICK STATS STRIP */}
        <div className="grid grid-cols-3 gap-3">
             <StatBox label="Scans" value={history.length} icon={Scan} isLoading={!isHistoryLoaded} />
             <StatBox label="Streak" value={scanStreak} icon={Flame} isLoading={!isHistoryLoaded} />
             <StatBox label="Found" value={discoveryCount} icon={Compass} isLoading={!isDiscoveryLoaded} />
        </div>

        <Separator />

        {/* PERSONALIZATION PREVIEWS */}
        <div className="space-y-4">
            <Card className="overflow-hidden border shadow-sm">
                <div className="divide-y">
                    <PreviewSection 
                        title="Dietary & Allergies" 
                        icon={Leaf} 
                        value={dietaryPreview}
                        href="/settings#dietary"
                    />
                    <PreviewSection 
                        title="AI Preferences" 
                        icon={Sparkles} 
                        value={aiPreview}
                        href="/settings#ai"
                    />
                </div>
            </Card>

            {/* ACHIEVEMENTS */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5 text-primary" /> Achievements</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                    <Achievements history={history} />
                </CardContent>
            </Card>

            {/* SETTINGS ENTRY */}
            <Link href="/settings" className="block">
                <Button variant="outline" className="w-full justify-between h-14 px-4 text-lg font-semibold rounded-xl border-2 hover:bg-muted/50 transition-all">
                    <div className="flex items-center gap-3">
                        <SettingsIcon className="h-5 w-5" />
                        System Settings
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>
            </Link>
        </div>
    </div>
  );
}

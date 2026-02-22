import { Skeleton } from '@/components/ui/skeleton';
import { Settings } from 'lucide-react';

export default function Loading() {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-pulse">
        <div className="flex items-center gap-2">
            <Settings className="h-8 w-8" />
            <Skeleton className="h-9 w-48" />
        </div>
      
        <div className="space-y-4">
            {/* Account Card */}
            <div className="rounded-lg border bg-card p-6 space-y-4">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            {/* App Preferences Card */}
            <div className="rounded-lg border bg-card p-6 space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <div className="grid grid-cols-3 gap-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </div>
             {/* Data & Privacy Card */}
             <div className="rounded-lg border bg-card p-6 space-y-4">
                 <Skeleton className="h-6 w-1/3" />
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <Skeleton className="h-10 w-full" />
            </div>
        </div>
    </div>
  );
}

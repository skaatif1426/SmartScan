import { Skeleton } from '@/components/ui/skeleton';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Loading() {
  return (
    <div className="p-4 md:p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-2">
          <SettingsIcon className="text-primary" />
          <Skeleton className="h-8 w-36" />
      </div>

      {/* Language Card */}
      <div className="rounded-lg border bg-card p-6 space-y-2">
        <Skeleton className="h-5 w-24 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Preferences Card */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <Skeleton className="h-5 w-32 mb-2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-6 w-11 rounded-full" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-6 w-11 rounded-full" />
        </div>
      </div>
      
      {/* Allergies Card */}
      <div className="rounded-lg border bg-card p-6 space-y-2">
        <Skeleton className="h-5 w-28 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Advanced Card */}
      <div className="rounded-lg border bg-card p-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="flex items-center justify-between">
            <div>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64 mt-1" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full" />
        </div>
      </div>
    </div>
  );
}

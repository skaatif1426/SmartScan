import { Skeleton } from '@/components/ui/skeleton';
import { Settings } from 'lucide-react';

export default function Loading() {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-pulse">
        <div className="flex items-center gap-2">
            <Settings />
            <Skeleton className="h-9 w-48" />
        </div>
      
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-lg border bg-card p-6 space-y-4">
                    <Skeleton className="h-6 w-1/3" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            ))}
             <div className="rounded-lg border bg-card p-6 space-y-4">
                 <Skeleton className="h-6 w-1/3" />
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
            </div>
        </div>
    </div>
  );
}

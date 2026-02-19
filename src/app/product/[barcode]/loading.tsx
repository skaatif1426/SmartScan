import { Skeleton } from '@/components/ui/skeleton';
import { Info, Hash, Sparkles, MessageCircle } from 'lucide-react';

export default function Loading() {
  return (
    <div className="p-4 md:p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-6 w-48" />
      </div>

      <div className="space-y-4">
        {/* Image Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <Skeleton className="h-64 w-full rounded-t-lg" />
            <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex flex-wrap gap-2 mt-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            </div>
        </div>

        {/* AI Insight Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-2">
            <div className="flex items-center gap-2"><Sparkles className="text-primary" /> <Skeleton className="h-5 w-40" /></div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
        </div>

        {/* Nutrition Facts Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2"><Info className="text-primary" /> <Skeleton className="h-5 w-40" /></div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
        </div>

        {/* Ingredients Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-2">
            <div className="flex items-center gap-2"><Hash className="text-primary" /> <Skeleton className="h-5 w-32" /></div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Chatbot Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
             <div className="flex items-center gap-2"><MessageCircle className="text-primary" /> <Skeleton className="h-5 w-32" /></div>
             <Skeleton className="h-40 w-full" />
             <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-10" />
             </div>
        </div>
      </div>
    </div>
  );
}

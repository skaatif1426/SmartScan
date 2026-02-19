import { Skeleton } from '@/components/ui/skeleton';
import { LayoutGrid } from 'lucide-react';

export default function Loading() {
    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-center gap-2">
                <LayoutGrid className="text-primary" />
                <Skeleton className="h-8 w-48" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 gap-6">
                 <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-48 w-full" />
                </div>
                 <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <div className="flex justify-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <Skeleton className="h-16 w-16 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

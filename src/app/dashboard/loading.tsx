import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="p-4 md:p-6 space-y-8 animate-pulse">
            {/* Greeting */}
            <div>
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-5 w-64 mt-2" />
            </div>

            {/* Scan Button */}
            <div className="flex justify-center">
                <Skeleton className="h-14 w-48 rounded-full" />
            </div>

            {/* Continue Card */}
            <div className="space-y-3">
                 <Skeleton className="h-6 w-1/3" />
                 <Skeleton className="h-24 w-full rounded-lg" />
            </div>

             {/* Smart Actions */}
            <div className="space-y-3">
                 <Skeleton className="h-6 w-1/3" />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                 </div>
            </div>

             {/* Quick Stats */}
            <div className="space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
}

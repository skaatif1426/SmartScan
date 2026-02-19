import { Skeleton } from '@/components/ui/skeleton';
import { History as HistoryIcon } from 'lucide-react';

export default function Loading() {
    return (
        <div className="p-4 md:p-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col space-y-1.5 p-6">
                    <div className="flex items-center gap-2 text-2xl">
                        <HistoryIcon className="text-primary" />
                        <Skeleton className="h-8 w-40" />
                    </div>
                </div>
                <div className="p-6 pt-0">
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                                <Skeleton className="h-16 w-16 rounded-md" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

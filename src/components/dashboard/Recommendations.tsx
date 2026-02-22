'use client';
import { useScanHistory } from '@/hooks/useScanHistory';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { History, Lightbulb, ScanLine } from 'lucide-react';

export default function Recommendations() {
    const { history } = useScanHistory();

    if (history.length === 0) {
        return null;
    }

    const lastScan = history[0];

    return (
        <Card className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lightbulb /> Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
                <Link href={`/product/${lastScan.barcode}`} passHref>
                   <Card className="p-4 hover:bg-muted transition-colors h-full">
                        <div className="flex items-center gap-3">
                            <History className="text-primary w-6 h-6"/>
                            <div>
                                <p className="font-semibold">Review Last Scan</p>
                                <p className="text-sm text-muted-foreground truncate">{lastScan.productName}</p>
                            </div>
                        </div>
                   </Card>
                </Link>
                 <Link href="/" passHref>
                    <Card className="p-4 hover:bg-muted transition-colors h-full">
                        <div className="flex items-center gap-3">
                            <ScanLine className="text-primary w-6 h-6"/>
                            <div>
                                <p className="font-semibold">Scan Another Item</p>
                                <p className="text-sm text-muted-foreground">Keep your streak going!</p>
                            </div>
                        </div>
                    </Card>
                </Link>
            </CardContent>
        </Card>
    );
}

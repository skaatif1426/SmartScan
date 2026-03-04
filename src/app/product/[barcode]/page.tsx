import { getProduct, getExternalProduct } from '@/lib/actions';
import { AlertCircle, WifiOff, Search, Database, RefreshCw, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ProductDetailsClient from '@/components/product/ProductDetailsClient';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductNotFound from '@/components/product/ProductNotFound';

export default async function ProductPage({ params, searchParams }: { params: { barcode: string }, searchParams: { source?: string } }) {
  const { barcode } = params;
  
  // Decides whether to call backend or external API.
  // The service now handles automatic fallback if backend is down.
  const productResult = searchParams.source === 'external' 
    ? await getExternalProduct(barcode)
    : await getProduct(barcode);

  if (productResult.status === 'error') {
    // If we reach here, it means BOTH Backend and External API failed to find the product.
    if (productResult.type === 'not_found') {
      return <ProductNotFound barcode={barcode} />;
    }

    // Full system failure (no internet or both registries down)
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Card className="w-full max-w-md text-center border-2 rounded-3xl overflow-hidden shadow-xl">
          <CardHeader className="pt-8">
            <CardTitle className="flex flex-col items-center gap-4 text-xl text-destructive font-black">
                <WifiOff className="w-14 h-14" />
                Connectivity Issue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pb-10">
            <Alert variant="destructive" className="rounded-2xl border-none bg-destructive/10 text-destructive text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">Network Failure</AlertTitle>
              <AlertDescription className="text-xs">
                Unable to reach any product database. Please check your internet connection.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-3 px-4">
                 <Link href={`/product/${barcode}?retry=${Date.now()}`}>
                    <Button className="w-full h-14 rounded-2xl font-black text-lg gap-2">
                        <RefreshCw className="h-5 w-5" />
                        Try Reconnecting
                    </Button>
                 </Link>
                 <Link href="/">
                    <Button variant="outline" className="w-full h-12 rounded-2xl font-bold border-2">Back to Scanner</Button>
                 </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ProductDetailsClient product={productResult.data} source={productResult.source} />;
}

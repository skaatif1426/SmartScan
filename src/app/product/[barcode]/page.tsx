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
  
  // Decide whether to call backend or external API based on user intent
  const productResult = searchParams.source === 'external' 
    ? await getExternalProduct(barcode)
    : await getProduct(barcode);

  if (productResult.status === 'error') {
    if (productResult.type === 'backend_unavailable' || productResult.type === 'timeout') {
      const isTimeout = productResult.type === 'timeout';
      return (
        <div className="flex items-center justify-center min-h-[70vh] p-6">
          <Card className="w-full max-w-md text-center border-2 border-amber-500/20 rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="pt-8 pb-4">
              <CardTitle className="flex flex-col items-center gap-4 text-2xl font-black text-amber-600">
                  {isTimeout ? <Clock className="w-14 h-14 animate-pulse" /> : <Database className="w-14 h-14 animate-pulse" />}
                  {isTimeout ? "Connection Timeout" : "Server Unavailable"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pb-10">
              <p className="text-muted-foreground text-sm font-medium leading-relaxed px-4">
                {isTimeout 
                  ? "The server took too long to respond. This might be due to a slow network." 
                  : "We couldn't reach our primary data server. Our engineers are notified."}
              </p>
              <div className="flex flex-col gap-3 px-4">
                <Link href={`/product/${barcode}?retry=${Date.now()}`}>
                   <Button className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-lg">
                      <RefreshCw className="h-5 w-5" />
                      Try Again
                   </Button>
                </Link>
                <Link href={`/product/${barcode}?source=external`}>
                   <Button variant="secondary" className="w-full h-12 rounded-2xl font-bold gap-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
                      <Search className="h-5 w-5" />
                      Manual External Search
                   </Button>
                </Link>
                <Link href="/">
                   <Button variant="ghost" className="w-full h-12 rounded-2xl font-bold text-muted-foreground">
                      Cancel and Go Back
                   </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (productResult.type === 'not_found') {
      return <ProductNotFound barcode={barcode} />;
    }

    return (
      <div className="flex items-center justify-center h-full p-6">
        <Card className="w-full max-w-md text-center border-2 rounded-3xl overflow-hidden shadow-xl">
          <CardHeader className="pt-8">
            <CardTitle className="flex flex-col items-center gap-4 text-xl text-destructive font-black">
                <WifiOff className="w-14 h-14" />
                Network Failure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pb-10">
            <Alert variant="destructive" className="rounded-2xl border-none bg-destructive/10 text-destructive text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">Connection Interrupted</AlertTitle>
              <AlertDescription className="text-xs">
                The request could not be completed. Please check your internet connection and try again.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-3 px-4">
                 <Link href={`/product/${barcode}?retry=${Date.now()}`}>
                    <Button className="w-full h-14 rounded-2xl font-black text-lg gap-2">
                        <RefreshCw className="h-5 w-5" />
                        Retry Now
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

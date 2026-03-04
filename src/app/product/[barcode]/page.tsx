import { getProduct, getExternalProduct } from '@/lib/actions';
import { AlertCircle, WifiOff, Search, Database } from 'lucide-react';
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
    if (productResult.type === 'backend_unavailable') {
      return (
        <div className="flex items-center justify-center min-h-[70vh] p-4">
          <Card className="w-full max-w-md text-center border-2 border-amber-500/20">
            <CardHeader>
              <CardTitle className="flex flex-col items-center gap-3 text-2xl font-black text-amber-600">
                  <Database className="w-16 h-16 animate-pulse" />
                  Backend Unavailable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground font-medium">
                We couldn't reach our primary data server. Would you like to try an external search?
              </p>
              <div className="flex flex-col gap-3">
                <Link href={`/product/${barcode}?source=external`}>
                   <Button className="w-full h-14 rounded-2xl font-black text-lg gap-2">
                      <Search className="h-5 w-5" />
                      Try External Search
                   </Button>
                </Link>
                <Link href="/">
                   <Button variant="outline" className="w-full h-12 rounded-2xl font-bold">
                      Scan Another Product
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
      <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex flex-col items-center gap-2 text-xl text-destructive">
                <WifiOff className="w-12 h-12" />
                Network Failure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Interrupted</AlertTitle>
              <AlertDescription>
                The request could not be completed. Please check your internet connection.
              </AlertDescription>
            </Alert>
            <Link href="/">
              <Button variant="outline" className="rounded-xl">Back to Scanner</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ProductDetailsClient product={productResult.data} source={productResult.source} />;
}

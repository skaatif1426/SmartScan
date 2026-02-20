import { getProduct } from '@/lib/actions';
import { AlertCircle, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ProductDetailsClient from '@/components/product/ProductDetailsClient';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { headers } from 'next/headers';

export default async function ProductPage({ params }: { params: { barcode: string } }) {
  const { barcode } = params;
  const productResult = await getProduct(barcode);
  const acceptHeader = headers().get('accept');
  const isFetch = acceptHeader?.includes('application/json') || acceptHeader?.includes('text/x-component');

  if (productResult.status === 'error') {
     return (
      <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex flex-col items-center gap-2 text-xl text-destructive">
                <WifiOff className="w-12 h-12" />
                Network Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Could Not Connect</AlertTitle>
              <AlertDescription>
                There was a problem fetching the product data. This could be due to your internet connection or an issue with our service. Please try again.
              </AlertDescription>
            </Alert>
            <Link href="/">
              <Button variant="outline">Scan Another Product</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!productResult.product) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-xl">Product Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Match Found</AlertTitle>
              <AlertDescription>
                We couldn&apos;t find any product with barcode: <strong className="font-mono">{barcode}</strong>. It might not be in our database.
              </AlertDescription>
            </Alert>
             <Link href="/">
                <Button variant="outline">Scan Another Product</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ProductDetailsClient product={productResult.product} />;
}

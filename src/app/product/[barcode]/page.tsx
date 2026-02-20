import { getProduct } from '@/lib/actions';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ProductDetailsClient from '@/components/product/ProductDetailsClient';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function ProductPage({ params }: { params: { barcode: string } }) {
  const { barcode } = params;
  const productResult = await getProduct(barcode);

  if (productResult.status === 'error') {
     return (
      <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Network Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Could Not Connect</AlertTitle>
              <AlertDescription>
                There was a problem fetching the product data. Please check your internet connection and try again.
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
            <CardTitle>Product Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Product Not Found</AlertTitle>
              <AlertDescription>
                We couldn&apos;t find any product with barcode: {barcode}. It might be incorrect or not in our database.
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

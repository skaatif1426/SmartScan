import { getProduct } from '@/lib/actions';
import ProductDetailsClient from '@/components/product/ProductDetailsClient';
import ProductNotFound from '@/components/product/ProductNotFound';

export default async function ProductPage({ params }: { params: { barcode: string } }) {
  const { barcode } = params;
  
  // The service now handles automatic fallback if backend is down or product is not in database.
  const productResult = await getProduct(barcode);

  if (productResult.status === 'error') {
    // If we reach here, it means BOTH Backend and External API failed to find the product.
    // Trigger the discovery flow (AI estimation).
    return <ProductNotFound barcode={barcode} />;
  }

  return <ProductDetailsClient product={productResult.data} source={productResult.source} />;
}

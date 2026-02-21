'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Wheat, Sparkles, MessageCircle, Info, Hash, ChevronLeft, Package } from 'lucide-react';

import type { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useScanHistory } from '@/hooks/useScanHistory';
import NutritionInsight from './NutritionInsight';
import { usePreferences } from '@/contexts/AppProviders';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { calculateLocalScore } from '@/lib/scoring';
import { cn } from '@/lib/utils';

const ProductChatbot = dynamic(() => import('./ProductChatbot'), {
    loading: () => <Skeleton className="h-96 w-full" />,
    ssr: false,
});

const NutritionValue = ({ label, value, unit }: { label: string; value?: number; unit: string }) => {
    if (value === undefined || value === null) return null;
    return (
        <div className="flex justify-between text-sm py-2 border-b">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value.toFixed(2)} {unit}</span>
        </div>
    );
};

export default function ProductDetailsClient({ product: productData }: { product: Product }) {
    const router = useRouter();
    const { addScanToHistory } = useScanHistory();
    const { product } = productData;
    const { preferences } = usePreferences();
    const [imageError, setImageError] = useState(false);
    const isProblematicDomain = product.image_front_url?.includes('images.openfoodfacts.org');

    const localAnalysis = useMemo(() => calculateLocalScore(product), [product]);

    const decision = useMemo(() => {
        const score = localAnalysis.score;
        if (score >= 75) {
            return {
                text: "Good Choice 👍",
                className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
            };
        }
        if (score >= 50) {
            return {
                text: "Consume Occasionally ⚖️",
                className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700",
            };
        }
        return {
            text: "Limit Consumption ⚠️",
            className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700",
        };
    }, [localAnalysis.score]);

    useEffect(() => {
        if (product) {
            addScanToHistory({
                barcode: productData.code,
                productName: product.product_name,
                brand: product.brands,
                imageUrl: product.image_front_url,
                categories: product.categories,
                healthScore: localAnalysis.score,
                isDiscovery: false,
            });
        }
    }, [addScanToHistory, product, productData.code, localAnalysis]);
    
    const hasAllergens = preferences.allergies.some(allergy => product?.allergens_tags?.some(tag => tag.includes(allergy)));

    const nutritionValues = useMemo(() => [
        { label: "Energy (kcal)", value: product?.nutriments?.['energy-kcal_100g'], unit: "kcal" },
        { label: "Fat", value: product?.nutriments?.fat_100g, unit: "g" },
        { label: "Saturated Fat", value: product?.nutriments?.['saturated-fat_100g'], unit: "g" },
        { label: "Carbohydrates", value: product?.nutriments?.carbohydrates_100g, unit: "g" },
        { label: "Sugars", value: product?.nutriments?.sugars_100g, unit: "g" },
        { label: "Proteins", value: product?.nutriments?.proteins_100g, unit: "g" },
        { label: "Salt", value: product?.nutriments?.salt_100g, unit: "g" }
    ].filter(item => item.value !== undefined && item.value !== null), [product]);

    if (!product) {
        // This case should be handled by the parent page, but it's a good safeguard.
        return null; 
    }

    return (
        <div className="p-4 md:p-6 space-y-4">
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-8 duration-500">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 flex-shrink-0" aria-label="Go back">
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <div className="flex-1 truncate">
                    <h1 className="text-xl font-bold truncate">{product.product_name}</h1>
                    <p className="text-muted-foreground">{product.brands}</p>
                </div>
            </div>
            
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                 <Badge variant="outline" className={cn('font-semibold text-base px-3 py-1 border-2 w-full justify-center whitespace-normal h-auto text-center', decision.className)}>
                    {decision.text}
                </Badge>
            </div>

            <Card className="animate-in fade-in-50 zoom-in-95 duration-500 delay-200">
                <div className="p-0 relative h-64 bg-muted rounded-t-lg flex items-center justify-center">
                    {(product.image_front_url && !imageError) ? (
                        isProblematicDomain ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={product.image_front_url}
                                alt={product.product_name}
                                className="object-contain h-full w-full"
                                onError={() => setImageError(true)}
                                data-ai-hint="product image"
                            />
                        ) : (
                            <Image
                                src={product.image_front_url}
                                alt={product.product_name}
                                fill
                                className="object-contain"
                                onError={() => setImageError(true)}
                                data-ai-hint="product image"
                            />
                        )
                    ) : (
                        <div className="flex flex-col items-center text-muted-foreground">
                            <Package size={48} />
                            <p className="mt-2 text-sm">No image available</p>
                        </div>
                    )}
                </div>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-2">
                        {product.nutriscore_grade && <Badge variant="outline">Nutri-Score: {product.nutriscore_grade.toUpperCase()}</Badge>}
                        {product.nova_group && <Badge variant="outline">NOVA: {product.nova_group}</Badge>}
                        {hasAllergens && <Badge variant="destructive"><Wheat className="mr-1 h-3 w-3" /> Contains Allergens</Badge>}
                    </div>
                </CardContent>
            </Card>

             <Card className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary" /> Health Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <NutritionInsight product={product} barcode={productData.code} localAnalysis={localAnalysis} />
                </CardContent>
            </Card>

            <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="nutrition-facts">
                <Card className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-400">
                    <AccordionItem value="nutrition-facts" className="border-none">
                        <AccordionTrigger className="p-6 hover:no-underline">
                            <CardTitle className="flex items-center gap-2"><Info className="text-primary" /> Nutrition Facts</CardTitle>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pt-0 pb-6">
                            {nutritionValues.length > 0 ? (
                                <>
                                    <p className="text-sm text-muted-foreground pb-4">per 100g serving</p>
                                    {nutritionValues.map(item => <NutritionValue key={item.label} {...item} />)}
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">No nutrition data available for this product.</p>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Card>

                <Card className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-500">
                    <AccordionItem value="ingredients" className="border-none">
                         <AccordionTrigger className="p-6 hover:no-underline">
                            <CardTitle className="flex items-center gap-2"><Hash className="text-primary" /> Ingredients</CardTitle>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pt-0 pb-6">
                             {product.ingredients_text_with_allergens ? (
                                <p className="text-sm text-muted-foreground">{product.ingredients_text_with_allergens}</p>
                            ) : (
                                <p className="text-sm text-muted-foreground">No ingredients information available for this product.</p>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Card>
            </Accordion>
            
            {preferences.aiChatEnabled && (
                <Card className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-600">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MessageCircle className="text-primary" /> AI Assistant</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ProductChatbot productData={JSON.stringify(product, null, 2)} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

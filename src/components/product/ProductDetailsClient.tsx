'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Utensils, Wheat, Beef, Sparkles, MessageCircle, Info, Hash, ChevronLeft } from 'lucide-react';

import type { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useScanHistory } from '@/hooks/useScanHistory';
import NutritionInsight from './NutritionInsight';
import ProductChatbot from './ProductChatbot';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';

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
    const { settings } = useSettings();

    useEffect(() => {
        addScanToHistory({
            barcode: productData.code,
            productName: product.product_name,
            brand: product.brands,
            imageUrl: product.image_front_url,
            categories: product.categories,
        });
    }, [addScanToHistory, product.product_name, product.brands, product.image_front_url, productData.code, product.categories]);
    
    const isVeg = !product.ingredients_text_with_allergens?.toLowerCase().includes('beef') && !product.ingredients_text_with_allergens?.toLowerCase().includes('chicken'); // Simple check
    const matchesDiet = (settings.isVeg && isVeg) || (settings.isNonVeg && !isVeg) || (!settings.isVeg && !settings.isNonVeg);
    const hasAllergens = settings.allergies.some(allergy => product.allergens_tags?.some(tag => tag.includes(allergy)));

    return (
        <div className="p-4 md:p-6 space-y-4">
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 flex-shrink-0">
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold truncate">{product.product_name}</h1>
            </div>

            <Card className="animate-in fade-in-50 zoom-in-95 duration-500">
                <CardHeader className="p-0 relative h-64">
                    <Image
                        src={product.image_front_url || 'https://picsum.photos/seed/product/600/400'}
                        alt={product.product_name}
                        fill
                        className="object-contain rounded-t-lg"
                        data-ai-hint="product image"
                    />
                </CardHeader>
                <CardContent className="pt-6">
                    <p className="text-muted-foreground text-lg">{product.brands}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {product.nutriscore_grade && <Badge variant="outline">Nutri-Score: {product.nutriscore_grade.toUpperCase()}</Badge>}
                        {product.nova_group && <Badge variant="outline">NOVA: {product.nova_group}</Badge>}
                        {matchesDiet ? (isVeg ? <Badge variant="secondary" className="bg-green-100 text-green-800"><Utensils className="mr-1 h-3 w-3" /> Veg</Badge> : <Badge className="bg-red-100 text-red-800"><Beef className="mr-1 h-3 w-3" />Non-Veg</Badge>) : <Badge variant="destructive">Doesn't match preference</Badge>}
                        {hasAllergens && <Badge variant="destructive"><Wheat className="mr-1 h-3 w-3" /> Contains Allergens</Badge>}
                    </div>
                </CardContent>
            </Card>

            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary" /> Nutrition AI Insight</CardTitle>
                </CardHeader>
                <CardContent>
                    <NutritionInsight product={product} />
                </CardContent>
            </Card>

            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info className="text-primary" /> Nutrition Facts</CardTitle>
                    <p className="text-sm text-muted-foreground">per 100g serving</p>
                </CardHeader>
                <CardContent>
                    <NutritionValue label="Energy (kcal)" value={product.nutriments['energy-kcal_100g']} unit="kcal" />
                    <NutritionValue label="Fat" value={product.nutriments.fat_100g} unit="g" />
                    <NutritionValue label="Saturated Fat" value={product.nutriments['saturated-fat_100g']} unit="g" />
                    <NutritionValue label="Carbohydrates" value={product.nutriments.carbohydrates_100g} unit="g" />
                    <NutritionValue label="Sugars" value={product.nutriments.sugars_100g} unit="g" />
                    <NutritionValue label="Proteins" value={product.nutriments.proteins_100g} unit="g" />
                    <NutritionValue label="Salt" value={product.nutriments.salt_100g} unit="g" />
                </CardContent>
            </Card>

            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Hash className="text-primary" /> Ingredients</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{product.ingredients_text_with_allergens || 'Not available'}</p>
                </CardContent>
            </Card>
            
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MessageCircle className="text-primary" /> AI Assistant</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProductChatbot productData={JSON.stringify(product, null, 2)} />
                </CardContent>
            </Card>
        </div>
    );
}

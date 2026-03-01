'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Wheat, Sparkles, ChevronLeft, Package, RotateCcw, Share2, Info, Hash } from 'lucide-react';

import type { Product } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useScanHistory } from '@/hooks/useScanHistory';
import NutritionInsight from './NutritionInsight';
import { usePreferences } from '@/contexts/AppProviders';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { calculateLocalScore } from '@/lib/scoring';
import { useGamification } from '@/hooks/useGamification';
import { getAICategory } from '@/lib/actions';
import ProductChatbot from './ProductChatbot';

export default function ProductDetailsClient({ product: productData }: { product: Product }) {
    const router = useRouter();
    const { addScanToHistory } = useScanHistory();
    const { product } = productData;
    const { preferences } = usePreferences();
    const [imageError, setImageError] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const isProblematicDomain = product.image_front_url?.includes('images.openfoodfacts.org');
    const { addXp, XP_PER_SCAN } = useGamification();

    const localAnalysis = useMemo(() => calculateLocalScore(product), [product]);

    useEffect(() => {
        const addScanWithCategory = async () => {
            if (product) {
                let productCategory = product.categories;
                if (!productCategory || productCategory.trim() === '') {
                    productCategory = await getAICategory({
                        productName: product.product_name,
                        ingredients: product.ingredients_text_with_allergens,
                    });
                }

                addScanToHistory({
                    barcode: productData.code,
                    productName: product.product_name,
                    brand: product.brands,
                    imageUrl: product.image_front_url,
                    categories: productCategory,
                    healthScore: localAnalysis.score,
                    isDiscovery: false,
                });
                addXp(XP_PER_SCAN);
            }
        };

        addScanWithCategory();
    }, [productData.code, localAnalysis.score]);
    
    const hasAllergens = preferences.allergies.some(allergy => product?.allergens_tags?.some(tag => tag.includes(allergy)));

    if (!product) return null;

    return (
        <div className="p-4 md:p-6 space-y-8 max-w-2xl mx-auto pb-40 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* 1. HEADER */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-full flex-shrink-0 bg-muted/50 active:scale-90" aria-label="Go back">
                    <ChevronLeft className="h-8 w-8" />
                </Button>
                <div className="flex-1 truncate">
                    <h1 className="text-2xl font-black truncate leading-tight">{product.product_name}</h1>
                    <p className="text-muted-foreground font-bold">{product.brands}</p>
                </div>
            </div>
            
            <Card className="rounded-3xl border shadow-lg overflow-hidden group">
                <div className="p-0 relative h-72 bg-muted flex items-center justify-center">
                    {(product.image_front_url && !imageError) ? (
                        <Image
                            src={product.image_front_url}
                            alt={product.product_name}
                            fill
                            className="object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="flex flex-col items-center text-muted-foreground opacity-50">
                            <Package size={64} />
                            <p className="mt-4 text-sm font-black uppercase tracking-widest">No Preview</p>
                        </div>
                    )}
                </div>
                <CardContent className="p-6">
                    <div className="flex flex-wrap gap-2">
                        {product.nutriscore_grade && <Badge variant="outline" className="rounded-full px-4 font-black">Grade: {product.nutriscore_grade.toUpperCase()}</Badge>}
                        {product.nova_group && <Badge variant="outline" className="rounded-full px-4 font-black">NOVA: {product.nova_group}</Badge>}
                        {hasAllergens && <Badge variant="destructive" className="rounded-full px-4 font-black"><Wheat className="mr-1 h-3 w-3" /> Allergens</Badge>}
                    </div>
                </CardContent>
            </Card>

            {/* 2-5. PRIMARY INSIGHT, SCORE, NUTRITION (Inside NutritionInsight) */}
            <NutritionInsight 
                product={product} 
                barcode={productData.code} 
                localAnalysis={localAnalysis} 
            />
            
            {/* 6. EXPANDABLE DETAILS */}
            <Accordion type="single" collapsible className="w-full space-y-4">
                <Card className="rounded-2xl border shadow-none overflow-hidden">
                    <AccordionItem value="nutrition-facts" className="border-none">
                        <AccordionTrigger className="px-6 py-5 hover:no-underline font-black">
                            <div className="flex items-center gap-3"><Info className="h-5 w-5 text-primary" /> Full Nutrition</div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                             {Object.entries(product.nutriments).slice(0, 10).map(([key, value]) => (
                                 <div key={key} className="flex justify-between py-2 border-b border-muted last:border-0 text-sm font-medium">
                                     <span className="text-muted-foreground capitalize">{key.replace(/_100g|-/g, ' ')}</span>
                                     <span>{typeof value === 'number' ? value.toFixed(1) : value}</span>
                                 </div>
                             ))}
                        </AccordionContent>
                    </AccordionItem>
                </Card>

                <Card className="rounded-2xl border shadow-none overflow-hidden">
                    <AccordionItem value="ingredients" className="border-none">
                         <AccordionTrigger className="px-6 py-5 hover:no-underline font-black">
                             <div className="flex items-center gap-3"><Hash className="h-5 w-5 text-primary" /> Full Ingredients</div>
                         </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground font-medium">
                             {product.ingredients_text_with_allergens || "No ingredients list available."}
                        </AccordionContent>
                    </AccordionItem>
                </Card>
            </Accordion>

            {/* AI Chat Integration */}
            {preferences.aiChatEnabled && (
                <Card className="overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-all rounded-3xl shadow-lg mt-8 active:scale-98">
                    <Accordion type="single" collapsible value={showChat ? 'chat' : ''} onValueChange={(v) => setShowChat(!!v)}>
                        <AccordionItem value="chat" className="border-none">
                            <AccordionTrigger className="px-6 py-6 hover:no-underline">
                                <div className="flex items-center gap-4 text-left">
                                    <div className="p-3 bg-primary/10 rounded-2xl">
                                        <Sparkles className="h-7 w-7 text-primary animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl">Ask AI Assistant</h3>
                                        <p className="text-sm text-muted-foreground font-medium">Diet safety and expert analysis.</p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6">
                                <ProductChatbot productData={JSON.stringify(product, null, 2)} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </Card>
            )}

            {/* Sticky Bottom Actions */}
            <div className="fixed bottom-24 inset-x-6 z-50 flex gap-4 max-w-2xl mx-auto animate-in slide-in-from-bottom-8 duration-500 delay-400">
                <Button variant="outline" className="flex-1 h-16 rounded-2xl gap-3 font-black shadow-2xl bg-background/80 backdrop-blur-xl border-2 active:scale-95" onClick={() => router.push('/')}>
                    <RotateCcw className="h-6 w-6" />
                    Scan Again
                </Button>
                <Button className="flex-1 h-16 rounded-2xl gap-3 font-black shadow-2xl active:scale-95">
                    <Share2 className="h-6 w-6" />
                    Share Result
                </Button>
            </div>
        </div>
    );
}

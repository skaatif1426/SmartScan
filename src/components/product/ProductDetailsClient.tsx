'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Wheat, Sparkles, ChevronLeft, Package, RotateCcw, Share2, Info, Hash, Database, Globe, BrainCircuit } from 'lucide-react';

import type { UnifiedProduct, DataSource } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useScanHistory } from '@/hooks/useScanHistory';
import NutritionInsight from './NutritionInsight';
import { usePreferences, useLanguage } from '@/contexts/AppProviders';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { calculateLocalScore } from '@/lib/scoring';
import { useGamification } from '@/hooks/useGamification';
import { getAICategory } from '@/lib/actions';
import ProductChatbot from './ProductChatbot';
import { cn } from '@/lib/utils';

export default function ProductDetailsClient({ product, source }: { product: UnifiedProduct, source: DataSource }) {
    const router = useRouter();
    const { addScanToHistory } = useScanHistory();
    const { preferences } = usePreferences();
    const { t } = useLanguage();
    const [imageError, setImageError] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const { addXp, XP_PER_SCAN } = useGamification();

    const localAnalysis = useMemo(() => calculateLocalScore(product), [product]);

    useEffect(() => {
        const addScanWithCategory = async () => {
            if (product) {
                let productCategory = product.nutriscoreGrade || 'Other'; // Fallback logic
                
                addScanToHistory({
                    barcode: product.barcode,
                    productName: product.name,
                    brand: product.brand,
                    imageUrl: product.image,
                    categories: productCategory,
                    healthScore: localAnalysis.score,
                    isDiscovery: false,
                    source: source
                });
                addXp(XP_PER_SCAN);
            }
        };

        addScanWithCategory();
    }, [product.barcode, localAnalysis.score, source]);
    
    // contract does not mandate allergens_tags but we check if mapped
    const hasAllergens = preferences.allergies.some(allergy => product.allergens?.some(tag => tag.includes(allergy)));

    const sourceInfo = {
        'backend': { label: 'Verified Database', icon: Database, color: 'text-primary' },
        'openfoodfacts': { label: 'Global Registry', icon: Globe, color: 'text-blue-500' },
        'ai-estimate': { label: 'AI Prediction', icon: BrainCircuit, color: 'text-purple-500' },
        'image-analysis': { label: 'Visual AI', icon: Sparkles, color: 'text-orange-500' },
    }[source] || { label: 'External Source', icon: Globe, color: 'text-muted-foreground' };

    return (
        <div className="p-4 space-y-6 max-w-2xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header with Source Indicator */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 truncate">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 rounded-full flex-shrink-0 bg-muted/30 active:scale-90">
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <div className="truncate">
                        <h1 className="text-xl font-black truncate leading-tight">{product.name}</h1>
                        <p className="text-muted-foreground text-xs font-bold">{product.brand}</p>
                    </div>
                </div>
                
                <Badge variant="secondary" className="rounded-full gap-1.5 px-3 py-1 font-black text-[10px] uppercase tracking-tighter shadow-inner bg-background/50 border-2">
                    <sourceInfo.icon className={cn("h-3 w-3", sourceInfo.color)} />
                    {sourceInfo.label}
                </Badge>
            </div>
            
            <Card className="rounded-2xl border shadow-md overflow-hidden group">
                <div className="p-0 relative h-60 bg-muted flex items-center justify-center">
                    {(product.image && !imageError) ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="flex flex-col items-center text-muted-foreground opacity-50">
                            <Package size={48} />
                            <p className="mt-2 text-[10px] font-black uppercase tracking-widest">{t('noPreview')}</p>
                        </div>
                    )}
                </div>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                        {product.nutriscoreGrade && <Badge variant="outline" className="rounded-full px-3 py-0.5 font-black text-[10px]">{t('grade')}: {product.nutriscoreGrade.toUpperCase()}</Badge>}
                        {product.novaGroup && <Badge variant="outline" className="rounded-full px-3 py-0.5 font-black text-[10px]">{t('nova')}: {product.novaGroup}</Badge>}
                        {hasAllergens && <Badge variant="destructive" className="rounded-full px-3 py-0.5 font-black text-[10px]"><Wheat className="mr-1 h-3 w-3" /> {t('allergensAlert')}</Badge>}
                    </div>
                </CardContent>
            </Card>

            <NutritionInsight 
                product={product} 
                barcode={product.barcode} 
                localAnalysis={localAnalysis} 
            />
            
            <Accordion type="single" collapsible className="w-full space-y-3">
                <Card className="rounded-xl border shadow-none overflow-hidden">
                    <AccordionItem value="nutrition-facts" className="border-none">
                        <AccordionTrigger className="px-5 py-4 hover:no-underline font-black text-sm">
                            <div className="flex items-center gap-2.5"><Info className="h-4 w-4 text-primary" /> {t('fullNutrition')}</div>
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-4">
                             {product.nutriments ? Object.entries(product.nutriments).map(([key, value]) => (
                                 <div key={key} className="flex justify-between py-1.5 border-b border-muted last:border-0 text-xs font-medium">
                                     <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                     <span>{typeof value === 'number' ? value.toFixed(1) : value}</span>
                                 </div>
                             )) : (
                                 <p className="text-xs text-muted-foreground italic">Nutrition facts unavailable.</p>
                             )}
                        </AccordionContent>
                    </AccordionItem>
                </Card>

                <Card className="rounded-xl border shadow-none overflow-hidden">
                    <AccordionItem value="ingredients" className="border-none">
                         <AccordionTrigger className="px-5 py-4 hover:no-underline font-black text-sm">
                             <div className="flex items-center gap-2.5"><Hash className="h-4 w-4 text-primary" /> {t('fullIngredients')}</div>
                         </AccordionTrigger>
                        <AccordionContent className="px-5 pb-4 text-xs leading-relaxed text-muted-foreground font-medium">
                             {product.ingredients.length > 0 ? product.ingredients.join(', ') : "Ingredients not provided."}
                        </AccordionContent>
                    </AccordionItem>
                </Card>
            </Accordion>

            {preferences.aiChatEnabled && (
                <Card className="overflow-hidden border border-primary/20 hover:border-primary/50 transition-all rounded-2xl shadow-md mt-6 active:scale-98">
                    <Accordion type="single" collapsible value={showChat ? 'chat' : ''} onValueChange={(v) => setShowChat(!!v)}>
                        <AccordionItem value="chat" className="border-none">
                            <AccordionTrigger className="px-5 py-4 hover:no-underline">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="p-2.5 bg-primary/10 rounded-xl">
                                        <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-base">{t('askAiAssistant')}</h3>
                                        <p className="text-[10px] text-muted-foreground font-medium">{t('dietSafetyAnalysis')}</p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-5 pb-4">
                                <ProductChatbot productData={JSON.stringify(product, null, 2)} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </Card>
            )}

            <div className="fixed bottom-20 inset-x-4 z-50 flex gap-3 max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500 delay-400">
                <Button variant="outline" className="flex-1 h-14 rounded-xl gap-2 font-black shadow-lg bg-background/80 backdrop-blur-xl border-2 active:scale-95 text-sm" onClick={() => router.push('/')}>
                    <RotateCcw className="h-5 w-5" />
                    {t('scanAgain')}
                </Button>
                <Button className="flex-1 h-14 rounded-xl gap-2 font-black shadow-lg active:scale-95 text-sm">
                    <Share2 className="h-5 w-5" />
                    {t('shareResult')}
                </Button>
            </div>
        </div>
    );
}

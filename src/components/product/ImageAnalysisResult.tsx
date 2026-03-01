'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  RotateCcw, 
  Share2, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ProductChatbot from './ProductChatbot';
import AnalysisDisplay from './AnalysisDisplay';
import { cn } from '@/lib/utils';

interface ImageAnalysisResultProps {
  result: any;
  image: string | null;
  onReset: () => void;
}

export default function ImageAnalysisResult({ result, image, onReset }: ImageAnalysisResultProps) {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-10 duration-700 max-w-2xl mx-auto px-4">
      {/* 1. HEADER */}
      <div className="relative h-72 w-full rounded-3xl overflow-hidden shadow-2xl bg-muted group">
        {image && <Image src={image} alt={result.productName} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 space-y-2">
             <Badge className="bg-primary/30 backdrop-blur-xl border-primary/20 text-white font-black px-4 py-1.5 rounded-full mb-2">
                Confidence: {result.confidence}
             </Badge>
             <h2 className="text-4xl font-black text-white tracking-tight leading-none">{result.productName}</h2>
             <p className="text-white/60 text-sm font-bold">Image Intelligence Scan</p>
        </div>
      </div>

      {/* 2-5. PRIMARY INSIGHT, SCORE, NUTRITION, WARNINGS */}
      <AnalysisDisplay 
        title={result.productName}
        score={result.healthScore}
        summary={result.summary}
        recommendation={result.insights.healthImpact}
        risks={result.insights.whoShouldAvoid.split(',').map((s: string) => s.trim())}
        nutrition={result.nutrition}
      />

      {/* 6. EXPANDABLE DETAILS */}
      <Accordion type="single" collapsible className="space-y-4">
        <InsightItem title="Likely Ingredients" content={result.insights.ingredients} value="item-1" />
        <InsightItem title="Suggested Alternatives" content={result.insights.betterAlternatives} value="item-4" />
      </Accordion>

      {/* AI Chat Integration */}
      <Card className="overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-all rounded-3xl shadow-lg active:scale-98">
        <Accordion type="single" collapsible value={showChat ? 'chat' : ''} onValueChange={(v) => setShowChat(!!v)}>
            <AccordionItem value="chat" className="border-none">
                <AccordionTrigger className="px-6 py-6 hover:no-underline">
                    <div className="flex items-center gap-4 text-left">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Sparkles className="h-7 w-7 text-primary animate-pulse" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl">Ask AI Assistant</h3>
                            <p className="text-sm text-muted-foreground font-medium">Diet safety, daily intake, and more.</p>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                    <ProductChatbot productData={JSON.stringify(result)} />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </Card>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-24 inset-x-6 z-50 flex gap-4 max-w-2xl mx-auto animate-in slide-in-from-bottom-8 duration-500 delay-300">
        <Button variant="outline" className="flex-1 h-16 rounded-2xl gap-3 font-black shadow-2xl bg-background/80 backdrop-blur-xl border-2 active:scale-95" onClick={onReset}>
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

function InsightItem({ title, content, value }: any) {
  return (
    <Card className="rounded-2xl border shadow-none overflow-hidden">
      <AccordionItem value={value} className="border-none">
        <AccordionTrigger className="px-6 py-5 hover:no-underline font-black text-sm">
          {title}
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground font-medium">
          {content}
        </AccordionContent>
      </AccordionItem>
    </Card>
  );
}

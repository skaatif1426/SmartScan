'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  ChevronRight, 
  RotateCcw, 
  Share2, 
  Bookmark, 
  Info, 
  AlertTriangle, 
  Apple, 
  Flame, 
  ShieldCheck, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ProductChatbot from './ProductChatbot';
import { getScoreInfo } from '@/lib/scoring';
import { cn } from '@/lib/utils';

interface ImageAnalysisResultProps {
  result: any;
  image: string | null;
  onReset: () => void;
}

export default function ImageAnalysisResult({ result, image, onReset }: ImageAnalysisResultProps) {
  const scoreInfo = getScoreInfo(result.healthScore);
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header with Image */}
      <div className="relative h-64 w-full rounded-3xl overflow-hidden border shadow-inner bg-muted">
        {image && <Image src={image} alt={result.productName} fill className="object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
          <div className="space-y-1">
             <Badge className="bg-primary/20 backdrop-blur-md border-primary/30 text-white mb-2">
                Confidence: {result.confidence}
             </Badge>
             <h2 className="text-3xl font-black text-white tracking-tight">{result.productName}</h2>
          </div>
          <div className={cn("text-4xl font-black text-white mb-1", scoreInfo.textClassName)}>
            {result.healthScore}
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5 flex gap-4 items-start">
           <div className="p-2 bg-primary rounded-full">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
           </div>
           <p className="text-sm font-medium leading-relaxed">{result.summary}</p>
        </CardContent>
      </Card>

      {/* Nutrition Grid */}
      <div className="grid grid-cols-2 gap-3">
        <NutritionCard label="Calories" value={result.nutrition.calories} unit="kcal" icon={Flame} color="text-orange-500" />
        <NutritionCard label="Sugar" value={result.nutrition.sugar} unit="g" icon={Apple} color="text-pink-500" />
        <NutritionCard label="Fat" value={result.nutrition.fat} unit="g" icon={Info} color="text-yellow-500" />
        <NutritionCard label="Protein" value={result.nutrition.protein} unit="g" icon={ShieldCheck} color="text-green-500" />
      </div>

      {/* Health Progress */}
      <Card>
        <CardContent className="p-5 space-y-4">
           <div className="flex justify-between items-center">
              <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Health Index</span>
              <span className={cn("text-sm font-black", scoreInfo.textClassName)}>{scoreInfo.label} Choice</span>
           </div>
           <Progress value={result.healthScore} indicatorClassName={scoreInfo.progressClassName} className="h-3" />
        </CardContent>
      </Card>

      {/* Expandable Insights */}
      <Accordion type="single" collapsible className="space-y-3">
        <InsightItem title="Ingredients Breakdown" content={result.insights.ingredients} value="item-1" />
        <InsightItem title="Health Impact" content={result.insights.healthImpact} value="item-2" />
        <InsightItem title="Who Should Avoid" content={result.insights.whoShouldAvoid} value="item-3" />
        <InsightItem title="Better Alternatives" content={result.insights.betterAlternatives} value="item-4" />
      </Accordion>

      {/* AI Chat Trigger */}
      <Card className="overflow-hidden border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => setShowChat(!showChat)}>
        <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl">
                    <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Ask AI about this</h3>
                    <p className="text-sm text-muted-foreground">Diet safety, daily intake, and more.</p>
                </div>
            </div>
            <ChevronDown className={cn("h-6 w-6 text-muted-foreground transition-transform", showChat && "rotate-180")} />
        </CardContent>
      </Card>

      {showChat && (
        <div className="animate-in slide-in-from-top-4 duration-300">
            <ProductChatbot productData={JSON.stringify(result)} />
        </div>
      )}

      {/* Footer Actions */}
      <div className="grid grid-cols-2 gap-4 pt-4 pb-12">
        <Button variant="outline" className="h-14 rounded-2xl gap-2 font-bold" onClick={onReset}>
            <RotateCcw className="h-5 w-5" />
            Scan Again
        </Button>
        <Button className="h-14 rounded-2xl gap-2 font-bold shadow-lg">
            <Share2 className="h-5 w-5" />
            Share Result
        </Button>
      </div>
    </div>
  );
}

function NutritionCard({ label, value, unit, icon: Icon, color }: any) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4 flex flex-col items-center text-center">
        <Icon className={cn("h-5 w-5 mb-2", color)} />
        <div className="text-xl font-black">{value}{unit}</div>
        <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

function InsightItem({ title, content, value }: any) {
  return (
    <Card>
      <AccordionItem value={value} className="border-none">
        <AccordionTrigger className="px-5 py-4 hover:no-underline">
          <span className="font-bold text-sm">{title}</span>
        </AccordionTrigger>
        <AccordionContent className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
          {content}
        </AccordionContent>
      </AccordionItem>
    </Card>
  );
}
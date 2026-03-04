
'use client';

import React, { useRef, useState } from 'react';
import { Share2, Copy, Check, Loader2, Apple, Flame, Info, ShieldCheck } from 'lucide-react';
import { toBlob } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/AppProviders';
import { getScoreInfo } from '@/lib/scoring';
import { cn } from '@/lib/utils';

interface ShareResultProps {
  productName: string;
  healthScore?: number;
  nutrition?: {
    calories: number;
    sugar: number;
    fat: number;
    protein: number;
  };
  summary?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function ShareResult({ 
  productName, 
  healthScore, 
  nutrition, 
  summary,
  className,
  variant = 'default',
  size = 'default'
}: ShareResultProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isPreparing, setIsPreparing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const scoreInfo = getScoreInfo(healthScore);

  const generateShareText = () => {
    let text = `🥗 SmartScan Result\n\n`;
    text += `Product: ${productName || 'Unknown Product'}\n`;
    if (healthScore !== undefined) {
      text += `Health Score: ${healthScore}/100 (${scoreInfo.label})\n`;
    }
    if (nutrition) {
      text += `\nQuick Stats:\n`;
      text += `⚡ ${Math.round(nutrition.calories)} kcal\n`;
      text += `🍎 ${Math.round(nutrition.sugar)}g Sugar\n`;
    }
    if (summary) {
      text += `\nAI Insight: ${summary.split('.')[0]}.\n`;
    }
    text += `\nScan your food with SmartScan AI 🚀`;
    return text;
  };

  const handleShare = async () => {
    setIsPreparing(true);
    const shareText = generateShareText();
    const shareTitle = `SmartScan: ${productName}`;

    try {
      let files: File[] = [];
      
      // 1. Try to generate image card
      if (cardRef.current) {
        try {
          const blob = await toBlob(cardRef.current, {
            quality: 0.95,
            cacheBust: true,
            backgroundColor: '#ffffff'
          });
          
          if (blob) {
            const file = new File([blob], 'smartscan-result.png', { type: 'image/png' });
            files = [file];
          }
        } catch (err) {
          console.warn('Image generation failed, falling back to text only share', err);
        }
      }

      // 2. Try Web Share API
      if (navigator.share) {
        const shareData: ShareData = {
          title: shareTitle,
          text: shareText,
          files: files.length > 0 && navigator.canShare?.({ files }) ? files : undefined
        };

        await navigator.share(shareData);
      } else {
        // 3. Fallback: Copy to Clipboard
        await navigator.clipboard.writeText(shareText);
        toast({
          title: t('shareResult'),
          description: t('copiedToClipboard'),
        });
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast({
          variant: 'destructive',
          title: 'Sharing Error',
          description: 'Could not complete share operation.',
        });
      }
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <>
      <Button 
        variant={variant}
        size={size}
        className={cn("gap-2 font-black transition-all active:scale-95", className)} 
        onClick={handleShare}
        disabled={isPreparing}
      >
        {isPreparing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        {isPreparing ? t('preparingShare') : t('shareResult')}
      </Button>

      {/* Hidden Shareable Card for Image Generation */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        <div 
          ref={cardRef} 
          className="w-[400px] bg-white p-8 rounded-[40px] border-8 border-primary/20 flex flex-col items-center text-center gap-6"
        >
           <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-primary" />
           </div>

           <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight text-neutral-900 leading-none">{productName || 'Unknown Product'}</h1>
              <p className="text-neutral-500 font-bold text-sm uppercase tracking-widest">SmartScan AI Intelligence</p>
           </div>

           {healthScore !== undefined && (
             <div className="space-y-2">
                <div className={cn("text-7xl font-black tracking-tighter", scoreInfo.textClassName)}>
                   {healthScore}
                </div>
                <div className={cn("inline-flex px-4 py-1.5 rounded-full text-xs font-black border-2 uppercase", scoreInfo.badgeClassName)}>
                   {scoreInfo.label} CHOICE
                </div>
             </div>
           )}

           {nutrition && (
             <div className="grid grid-cols-2 gap-3 w-full">
                <div className="bg-neutral-50 p-4 rounded-3xl border flex flex-col items-center gap-1">
                   <Flame className="w-5 h-5 text-orange-500" />
                   <div className="text-lg font-black text-neutral-900">{Math.round(nutrition.calories)} kcal</div>
                   <div className="text-[10px] uppercase font-black text-neutral-400">Calories</div>
                </div>
                <div className="bg-neutral-50 p-4 rounded-3xl border flex flex-col items-center gap-1">
                   <Apple className="w-5 h-5 text-pink-500" />
                   <div className="text-lg font-black text-neutral-900">{Math.round(nutrition.sugar)}g</div>
                   <div className="text-[10px] uppercase font-black text-neutral-400">Sugar</div>
                </div>
             </div>
           )}

           <div className="w-full h-px bg-neutral-100" />

           <div className="text-neutral-600 text-sm font-medium leading-relaxed italic">
              "{summary || 'Generated smart nutritional analysis for a healthier lifestyle.'}"
           </div>

           <div className="mt-4 flex flex-col items-center gap-1">
              <div className="text-primary font-black text-sm tracking-widest uppercase">SmartScan AI</div>
              <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em]">Live Healthy • 2026</div>
           </div>
        </div>
      </div>
    </>
  );
}

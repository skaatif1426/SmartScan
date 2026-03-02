'use client';

import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Loader2, Sparkles, CheckCircle2, Focus, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getFoodImageAnalysis } from '@/lib/actions';
import { useLanguage, usePreferences } from '@/contexts/AppProviders';
import { useAiUsage } from '@/hooks/useAiUsage';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useGamification } from '@/hooks/useGamification';
import ImageAnalysisResult from '../product/ImageAnalysisResult';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

const LOADING_STEPS = [
  "Analyzing image profile...",
  "Detecting food content...",
  "Calculating nutritional values...",
  "Generating smart insights..."
];

export default function ImageScanner() {
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const { preferences } = usePreferences();
  const { incrementAiCallCount } = useAiUsage();
  const { addScanToHistory } = useScanHistory();
  const { addXp, XP_PER_SCAN } = useGamification();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const captureInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      setIsAnalyzing(true);
      setLoadingStep(0);

      const interval = setInterval(() => {
        setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
      }, 1200);

      try {
        incrementAiCallCount();
        const result = await getFoodImageAnalysis({
          imageDataUri: base64,
          language,
          userPreferences: {
            diet: preferences.diet,
            allergies: preferences.allergies,
            healthGoal: preferences.healthGoal,
            healthFocus: preferences.healthFocus,
            aiVerbosity: preferences.aiVerbosity,
            strictMode: preferences.strictMode,
          }
        });

        if (result) {
          setAnalysisResult(result);
          addScanToHistory({
            barcode: `img-${Date.now()}`,
            productName: result.productName,
            brand: 'AI Image Scan',
            imageUrl: base64,
            healthScore: result.healthScore,
            type: 'image',
            imageAnalysis: result
          });
          addXp(XP_PER_SCAN);
        } else {
          throw new Error("Analysis failed");
        }
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'Analysis Error',
          description: 'Could not analyze this image. Please try again.',
        });
      } finally {
        clearInterval(interval);
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  if (isAnalyzing) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-8 bg-background animate-in fade-in duration-500">
        <div className="relative mb-16">
          <div className="w-32 h-32 rounded-full border-4 border-primary/10 flex items-center justify-center">
             <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center animate-shadow-pulse">
                <Sparkles className="w-12 h-12 text-primary animate-pulse" />
             </div>
          </div>
          <Loader2 className="absolute -bottom-2 -right-2 w-10 h-10 text-primary animate-spin" />
        </div>
        
        <div className="space-y-6 w-full max-w-xs">
          <h2 className="text-xl font-bold text-center mb-4">AI Photo Analysis...</h2>
          {LOADING_STEPS.map((step, i) => (
            <div 
              key={i} 
              className={cn(
                "flex items-center gap-4 transition-all duration-500",
                loadingStep > i ? "text-primary opacity-100" : 
                loadingStep === i ? "text-foreground scale-105 opacity-100 font-bold" : 
                "opacity-20"
              )}
            >
               {loadingStep > i ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
               ) : (
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    loadingStep === i ? "border-primary border-t-transparent animate-spin" : "border-current"
                  )} />
               )}
               <p className="text-base">{step}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (analysisResult) {
    return (
      <ImageAnalysisResult 
        result={analysisResult} 
        image={selectedImage} 
        onReset={() => { setAnalysisResult(null); setSelectedImage(null); }} 
      />
    );
  }

  return (
    <div className="p-6 space-y-10 animate-in fade-in zoom-in-95 duration-700">
      {/* 2. HERO SCAN AREA */}
      <div className="relative group">
        <Card className="rounded-[40px] border-none shadow-sm bg-card/50 overflow-hidden aspect-square flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
          
          <div className="relative w-48 h-48 rounded-3xl border-2 border-primary/30 flex items-center justify-center scan-frame-pulse">
            <Focus className="absolute -top-3 -left-3 h-8 w-8 text-primary/40" />
            <Focus className="absolute -top-3 -right-3 h-8 w-8 text-primary/40 rotate-90" />
            <Focus className="absolute -bottom-3 -left-3 h-8 w-8 text-primary/40 -rotate-90" />
            <Focus className="absolute -bottom-3 -right-3 h-8 w-8 text-primary/40 rotate-180" />
            
            <div className="flex flex-col items-center gap-4">
              <Sparkles className="w-16 h-16 text-primary/80" />
              <div className="space-y-1 text-center">
                <p className="text-xs font-black uppercase tracking-widest text-primary/60">AI Vision Engine</p>
                <p className="text-[10px] text-muted-foreground/60 font-bold italic">Detects fruits, meals & more</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. PRIMARY ACTION */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tight leading-none">AI Photo Scan</h2>
          <p className="text-muted-foreground text-sm font-bold">Capture food to identify nutritional profile</p>
        </div>

        <Button 
          size="lg" 
          className="w-full rounded-2xl h-18 text-lg font-black shadow-xl shadow-primary/10 active:scale-[0.97] transition-all bg-gradient-to-r from-primary to-emerald-500 gap-3" 
          onClick={() => captureInputRef.current?.click()}
        >
          <Camera className="h-6 w-6" />
          Capture Photo
        </Button>

        {/* 4. SECONDARY ACTION CARDS (Single for Gallery here, or could be a grid if needed) */}
        <div className="grid grid-cols-1">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center p-6 bg-card border-2 border-border/50 rounded-3xl gap-4 transition-all active:scale-95 hover:bg-muted/50 shadow-sm"
          >
            <div className="p-3 bg-primary/10 rounded-2xl">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground leading-none">Upload from Gallery</p>
              <p className="text-[10px] text-muted-foreground/60 font-bold mt-1">Select an existing photo</p>
            </div>
          </button>
        </div>
      </div>

      <input type="file" ref={captureInputRef} accept="image/*" capture="environment" onChange={onFileChange} className="hidden" />
      <input type="file" ref={fileInputRef} accept="image/*" onChange={onFileChange} className="hidden" />
    </div>
  );
}
'use client';

import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getFoodImageAnalysis } from '@/lib/actions';
import { useLanguage, usePreferences } from '@/contexts/AppProviders';
import { useAiUsage } from '@/hooks/useAiUsage';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useGamification } from '@/hooks/useGamification';
import ImageAnalysisResult from '../product/ImageAnalysisResult';
import { cn } from '@/lib/utils';

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
    <div className="flex flex-col items-center justify-center p-6 space-y-12 animate-in zoom-in-95 duration-500">
      <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center animate-shadow-pulse">
        <Sparkles className="w-14 h-14 text-primary" />
      </div>

      <div className="text-center space-y-3">
        <h2 className="text-3xl font-black tracking-tight">AI Photo Scan</h2>
        <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">Take a photo of any food item to get instant nutritional insights.</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Button size="lg" className="w-full rounded-2xl h-18 text-xl font-bold shadow-xl active:scale-95" onClick={() => captureInputRef.current?.click()}>
          <Camera className="mr-3 h-7 w-7" />
          Capture Photo
        </Button>
        <Button variant="ghost" className="w-full h-14 text-muted-foreground font-bold" onClick={() => fileInputRef.current?.click()}>
          <ImageIcon className="mr-2 h-5 w-5" />
          Upload from Gallery
        </Button>
      </div>

      <input type="file" ref={captureInputRef} accept="image/*" capture="environment" onChange={onFileChange} className="hidden" />
      <input type="file" ref={fileInputRef} accept="image/*" onChange={onFileChange} className="hidden" />
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getFoodImageAnalysis } from '@/lib/actions';
import { useLanguage, usePreferences } from '@/contexts/AppProviders';
import { useAiUsage } from '@/hooks/useAiUsage';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useGamification } from '@/hooks/useGamification';
import ImageAnalysisResult from '../product/ImageAnalysisResult';
import { Skeleton } from '@/components/ui/skeleton';

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

  const LOADING_STEPS = [
    "Analyzing image...",
    "Detecting food content...",
    "Calculating nutrition...",
    "Generating AI insights..."
  ];

  const processImage = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      setIsAnalyzing(true);
      setLoadingStep(0);

      const interval = setInterval(() => {
        setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
      }, 1500);

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
      <div className="flex flex-col items-center justify-center p-8 space-y-8 min-h-[60vh] animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <Loader2 className="absolute -bottom-2 -right-2 w-8 h-8 text-primary animate-spin" />
        </div>
        <div className="space-y-4 w-full max-w-xs">
          {LOADING_STEPS.map((step, i) => (
            <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${loadingStep >= i ? "opacity-100" : "opacity-20"}`}>
               <Skeleton className="h-4 w-4 rounded-full bg-primary" />
               <p className={`text-sm ${loadingStep === i ? "font-bold text-foreground" : "text-muted-foreground"}`}>{step}</p>
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
    <div className="flex flex-col items-center justify-center p-6 space-y-10 animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-shadow-pulse">
        <Sparkles className="w-12 h-12 text-primary" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">AI Photo Scanner</h2>
        <p className="text-muted-foreground text-sm max-w-[280px]">Snap a photo of your food to get instant nutritional insights.</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Button size="lg" className="w-full rounded-2xl h-16 text-lg font-bold shadow-xl" onClick={() => captureInputRef.current?.click()}>
          <Camera className="mr-2 h-6 w-6" />
          Capture Photo
        </Button>
        <Button variant="outline" size="lg" className="w-full rounded-2xl h-14" onClick={() => fileInputRef.current?.click()}>
          <ImageIcon className="mr-2 h-5 w-5" />
          Upload from Gallery
        </Button>
      </div>

      <input type="file" ref={captureInputRef} accept="image/*" capture="environment" onChange={onFileChange} className="hidden" />
      <input type="file" ref={fileInputRef} accept="image/*" onChange={onFileChange} className="hidden" />
    </div>
  );
}
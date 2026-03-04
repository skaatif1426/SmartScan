'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ScanLine, 
  Loader2, 
  ChevronLeft, 
  Zap, 
  ZapOff, 
  CheckCircle2,
  Camera,
  QrCode,
  Sparkles,
  Image as ImageIcon,
  ArrowRight,
  Keyboard,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useLanguage, usePreferences } from '@/contexts/AppProviders';
import { useAiUsage } from '@/hooks/useAiUsage';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useGamification } from '@/hooks/useGamification';
import { cn } from '@/lib/utils';
import { getFoodImageAnalysis } from '@/lib/actions';
import ImageAnalysisResult from '@/components/product/ImageAnalysisResult';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CameraCapture from '@/components/scanner/CameraCapture';

const BARCODE_LOADING_STEPS = [
  'loadingCapture',
  'loadingRead',
  'loadingIngredients',
  'loadingInsights'
];

type ScanMode = 'barcode' | 'photo';

export default function ScannerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { preferences } = usePreferences();
  const { incrementAiCallCount } = useAiUsage();
  const { addScanToHistory } = useScanHistory();
  const { addXp, XP_PER_SCAN } = useGamification();
  
  const [mode, setMode] = useState<ScanMode>('barcode');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [manualBarcode, setManualBarcode] = useState('');
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);

  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  const handleBarcodeAnalysisFlow = useCallback(async (barcode: string) => {
    if (!barcode.trim()) return;

    // Rate limiting: Block repeated scans within 1.5 seconds
    const now = Date.now();
    if (now - lastScanTimeRef.current < 1500) {
        return;
    }
    lastScanTimeRef.current = now;

    // Cancel previous request if any
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsManualDialogOpen(false);
    setIsAnalyzing(true);
    setAnalysisStep(0);

    try {
        for (let i = 0; i < BARCODE_LOADING_STEPS.length; i++) {
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(resolve, 600);
                abortControllerRef.current?.signal.addEventListener('abort', () => {
                    clearTimeout(timeout);
                    reject(new Error('Request cancelled'));
                });
            });
            setAnalysisStep(i + 1);
        }
        router.push(`/product/${barcode}`);
    } catch (err: any) {
        if (err.message === 'Request cancelled') {
            console.log('Previous scan request cancelled.');
        } else {
            setIsAnalyzing(false);
        }
    }
  }, [router]);

  const processPhotoImage = async (base64: string) => {
    // Prevent double requests
    if (isAnalyzing) return;

    setSelectedImage(base64);
    setIsAnalyzing(true);
    setAnalysisStep(0);
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
          source: 'image-analysis',
          imageAnalysis: result
        });
        addXp(XP_PER_SCAN);
      }
    } catch (err) {
      toast({ variant: 'destructive', title: t('support'), description: t('generatingInsightError') });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePhotoCaptured = (image: string) => {
    setIsCameraOpen(false);
    if (mode === 'barcode') {
        handleBarcodeAnalysisFlow('capture');
    } else {
        processPhotoImage(image);
    }
  };

  const handleUploadImage = () => {
    galleryInputRef.current?.click();
  };

  if (isAnalyzing) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-8 bg-background">
        <div className="relative mb-12">
          <div className="w-24 h-24 rounded-full border-4 border-primary/10 flex items-center justify-center">
             <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center animate-shadow-pulse">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
             </div>
          </div>
          <Loader2 className="absolute -bottom-1 -right-1 w-6 h-6 text-primary animate-spin" />
        </div>
        <div className="space-y-3 w-full max-w-xs">
          <h2 className="text-base font-bold text-center">{mode === 'barcode' ? t('processingScan') : t('aiPhotoAnalysis')}</h2>
          {BARCODE_LOADING_STEPS.map((step, idx) => (
            <div key={step} className={cn("flex items-center gap-2 text-xs transition-all duration-500", analysisStep > idx ? "text-primary opacity-100" : "opacity-20")}>
              {analysisStep > idx ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Loader2 className={cn("w-3.5 h-3.5", analysisStep === idx && "animate-spin")} />}
              <p>{t(step as any)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (analysisResult && mode === 'photo') {
    return <ImageAnalysisResult result={analysisResult} image={selectedImage} onReset={() => { setAnalysisResult(null); setSelectedImage(null); }} />;
  }

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {isCameraOpen && (
        <CameraCapture 
            onCapture={handlePhotoCaptured}
            onClose={() => setIsCameraOpen(false)}
        />
      )}

      <div className="pt-2 px-4 flex justify-center z-10">
        <div className="bg-muted p-1 rounded-full flex w-full max-w-[200px]">
          <button onClick={() => setMode('barcode')} className={cn("flex-1 py-1 rounded-full text-[10px] font-bold transition-all", mode === 'barcode' ? "bg-background shadow-sm" : "text-muted-foreground")}>{t('barcodeMode')}</button>
          <button onClick={() => setMode('photo')} className={cn("flex-1 py-1 rounded-full text-[10px] font-bold transition-all", mode === 'photo' ? "bg-background shadow-sm" : "text-muted-foreground")}>{t('photoMode')}</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full px-6">
          <div className="flex flex-col items-center">
            <div className="mb-6 relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse group-hover:bg-primary/30 transition-all duration-700" />
                <div className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 animate-shadow-pulse overflow-hidden">
                    <div className="scanner-line absolute w-full h-1 bg-primary/60 shadow-[0_0_15px_hsl(var(--primary))] z-10" />
                    {mode === 'barcode' ? (
                        <QrCode className="w-10 h-10 text-primary animate-pulse-subtle" />
                    ) : (
                        <ImageIcon className="w-10 h-10 text-primary animate-pulse-subtle" />
                    )}
                </div>
            </div>

            <div className="text-center space-y-1 mb-6">
              <h1 className="text-xl font-black tracking-tight">{mode === 'barcode' ? t('barcodeEntry') : t('photoAnalysis')}</h1>
              <p className="text-muted-foreground text-[10px] max-w-[200px] font-medium leading-relaxed">{mode === 'barcode' ? t('barcodeDesc') : t('photoDesc')}</p>
            </div>

            <div className="w-full space-y-2">
              <Button 
                size="lg" 
                disabled={isAnalyzing}
                className="w-full rounded-xl h-12 text-base font-bold bg-gradient-to-b from-[#22C55E] to-[#16A34A] text-white shadow-lg active:scale-95 transition-all" 
                onClick={() => setIsCameraOpen(true)}
              >
                <Camera className="mr-2 h-4 w-4" /> 
                {t('capturePhoto')}
              </Button>
              <Button 
                variant="outline" 
                disabled={isAnalyzing}
                className="w-full h-12 rounded-xl border-2 font-bold text-sm active:scale-95 transition-all" 
                onClick={handleUploadImage}
              >
                <ImageIcon className="mr-2 h-4 w-4" /> {t('uploadImage')}
              </Button>

              {mode === 'barcode' && (
                <div className="pt-2 w-full flex justify-center">
                  <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" disabled={isAnalyzing} className="text-primary font-bold hover:bg-primary/5 rounded-full px-4 py-1.5 h-auto text-[11px]">
                        <Keyboard className="mr-2 h-3.5 w-3.5" />
                        {t('enterManually')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl border-2 w-[85vw] max-w-md p-5">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-black text-center mb-3 tracking-tight">{t('manualEntry')}</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col gap-4">
                        <div className="space-y-1.5">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t('barcodeMode')}</p>
                          <Input 
                            value={manualBarcode}
                            onChange={(e) => setManualBarcode(e.target.value)}
                            placeholder={t('barcodePlaceholder')}
                            className="h-12 rounded-xl border-2 font-bold px-4 text-base shadow-inner bg-muted/20"
                            type="number"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter') handleBarcodeAnalysisFlow(manualBarcode); }}
                          />
                        </div>
                        <Button 
                          disabled={!manualBarcode || manualBarcode.length < 5 || isAnalyzing}
                          onClick={() => handleBarcodeAnalysisFlow(manualBarcode)}
                          className="h-12 w-full rounded-xl font-black text-base bg-gradient-to-r from-primary to-emerald-600 shadow-xl"
                        >
                          {t('analyzeProduct')}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
            
            <input 
                type="file" 
                ref={galleryInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => { 
                    const file = e.target.files?.[0]; 
                    if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64 = reader.result as string;
                            if (mode === 'barcode') handleBarcodeAnalysisFlow('upload');
                            else processPhotoImage(base64);
                        };
                        reader.readAsDataURL(file);
                    }
                }} 
            />
          </div>
      </div>
    </div>
  );
}

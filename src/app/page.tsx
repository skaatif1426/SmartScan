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
import { useAnalytics } from '@/hooks/useAnalytics';
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

  const handleBarcodeAnalysisFlow = useCallback(async (barcode: string) => {
    if (!barcode.trim()) return;
    setIsManualDialogOpen(false);
    setIsAnalyzing(true);
    setAnalysisStep(0);
    for (let i = 0; i < BARCODE_LOADING_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      setAnalysisStep(i + 1);
    }
    router.push(`/product/${barcode}`);
  }, [router]);

  const processPhotoImage = async (base64: string) => {
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
          <div className="w-28 h-28 rounded-full border-4 border-primary/10 flex items-center justify-center">
             <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center animate-shadow-pulse">
                <Sparkles className="w-10 h-10 text-primary animate-pulse" />
             </div>
          </div>
          <Loader2 className="absolute -bottom-1 -right-1 w-8 h-8 text-primary animate-spin" />
        </div>
        <div className="space-y-4 w-full max-w-xs">
          <h2 className="text-lg font-bold text-center">{mode === 'barcode' ? t('processingScan') : t('aiPhotoAnalysis')}</h2>
          {BARCODE_LOADING_STEPS.map((step, idx) => (
            <div key={step} className={cn("flex items-center gap-3 text-sm transition-all duration-500", analysisStep > idx ? "text-primary opacity-100" : "opacity-20")}>
              {analysisStep > idx ? <CheckCircle2 className="w-4 h-4" /> : <Loader2 className={cn("w-4 h-4", analysisStep === idx && "animate-spin")} />}
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

      <div className="pt-4 px-4 flex justify-center z-10">
        <div className="bg-muted p-1 rounded-full flex w-full max-w-[240px]">
          <button onClick={() => setMode('barcode')} className={cn("flex-1 py-1.5 rounded-full text-xs font-bold transition-all", mode === 'barcode' ? "bg-background shadow-sm" : "text-muted-foreground")}>{t('barcodeMode')}</button>
          <button onClick={() => setMode('photo')} className={cn("flex-1 py-1.5 rounded-full text-xs font-bold transition-all", mode === 'photo' ? "bg-background shadow-sm" : "text-muted-foreground")}>{t('photoMode')}</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full px-4">
          <div className="flex flex-col items-center">
            <div className="mb-8 relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse group-hover:bg-primary/30 transition-all duration-700" />
                <div className="relative w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 animate-shadow-pulse overflow-hidden">
                    <div className="scanner-line absolute w-full h-1 bg-primary/60 shadow-[0_0_15px_hsl(var(--primary))] z-10" />
                    {mode === 'barcode' ? (
                        <QrCode className="w-12 h-12 text-primary animate-pulse-subtle" />
                    ) : (
                        <ImageIcon className="w-12 h-12 text-primary animate-pulse-subtle" />
                    )}
                </div>
            </div>

            <div className="text-center space-y-1.5 mb-8">
              <h1 className="text-2xl font-black tracking-tight">{mode === 'barcode' ? t('barcodeEntry') : t('photoAnalysis')}</h1>
              <p className="text-muted-foreground text-xs max-w-[240px] font-medium leading-relaxed">{mode === 'barcode' ? t('barcodeDesc') : t('photoDesc')}</p>
            </div>

            <div className="w-full space-y-3">
              <Button 
                size="lg" 
                className="w-full rounded-2xl h-14 text-lg font-bold bg-gradient-to-b from-[#22C55E] to-[#16A34A] text-white shadow-lg active:scale-95 transition-all" 
                onClick={() => setIsCameraOpen(true)}
              >
                <Camera className="mr-2 h-5 w-5" /> 
                {t('capturePhoto')}
              </Button>
              <Button variant="outline" className="w-full h-14 rounded-2xl border-2 font-bold text-base active:scale-95 transition-all" onClick={handleUploadImage}>
                <ImageIcon className="mr-2 h-5 w-5" /> {t('uploadImage')}
              </Button>

              {mode === 'barcode' && (
                <div className="pt-4 w-full flex justify-center">
                  <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 rounded-full px-6 py-2 h-auto text-sm">
                        <Keyboard className="mr-2 h-4 w-4" />
                        {t('enterManually')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2rem] border-2 w-[90vw] max-w-md p-6">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-center mb-4 tracking-tight">{t('manualEntry')}</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col gap-6">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t('barcodeMode')}</p>
                          <Input 
                            value={manualBarcode}
                            onChange={(e) => setManualBarcode(e.target.value)}
                            placeholder={t('barcodePlaceholder')}
                            className="h-14 rounded-2xl border-2 font-bold px-6 text-lg shadow-inner bg-muted/20"
                            type="number"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter') handleBarcodeAnalysisFlow(manualBarcode); }}
                          />
                        </div>
                        <Button 
                          disabled={!manualBarcode || manualBarcode.length < 5}
                          onClick={() => handleBarcodeAnalysisFlow(manualBarcode)}
                          className="h-16 w-full rounded-2xl font-black text-lg bg-gradient-to-r from-primary to-emerald-600 shadow-xl"
                        >
                          {t('analyzeProduct')}
                          <ArrowRight className="ml-2 w-5 h-5" />
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

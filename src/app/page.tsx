'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  CheckCircle2,
  Camera,
  QrCode,
  Sparkles,
  Image as ImageIcon,
  Keyboard,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import QrScanner from '@/components/scanner/QrScanner';

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
  const lastScanTimeRef = useRef<number>(0);

  const handleBarcodeDetected = useCallback((barcode: string) => {
    const now = Date.now();
    if (now - lastScanTimeRef.current < 2000) return;
    lastScanTimeRef.current = now;

    setIsCameraOpen(false);
    setIsAnalyzing(true);
    setAnalysisStep(0);

    const runSteps = async () => {
      for (let i = 0; i < BARCODE_LOADING_STEPS.length; i++) {
        await new Promise(r => setTimeout(r, 400));
        setAnalysisStep(i + 1);
      }
      router.push(`/product/${barcode}`);
    };
    runSteps();
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

  const handleUploadImage = () => galleryInputRef.current?.click();

  if (isAnalyzing) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-8 bg-white">
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center">
             <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
             </div>
          </div>
          <Loader2 className="absolute -bottom-1 -right-1 w-6 h-6 text-primary animate-spin" />
        </div>
        <div className="space-y-3 w-full max-w-xs">
          <h2 className="text-xl font-black text-center tracking-tight">{mode === 'barcode' ? t('processingScan') : t('aiPhotoAnalysis')}</h2>
          {BARCODE_LOADING_STEPS.map((step, idx) => (
            <div key={step} className={cn("flex items-center gap-3 text-sm transition-opacity duration-200 font-bold", analysisStep > idx ? "text-primary opacity-100" : "opacity-30")}>
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
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {isCameraOpen && (
        mode === 'barcode' ? (
          <QrScanner 
            onScanSuccess={handleBarcodeDetected}
            onScanFailure={() => {}}
            onCameraPermissionError={(e) => toast({ variant: 'destructive', title: 'Camera Error', description: e.message })}
            onClose={() => setIsCameraOpen(false)}
          />
        ) : (
          <CameraCapture 
            onCapture={processPhotoImage}
            onClose={() => setIsCameraOpen(false)}
          />
        )
      )}

      <div className="pt-6 px-4 flex justify-center z-10">
        <div className="bg-neutral-100 p-1 rounded-full flex w-full max-w-[240px]">
          <button onClick={() => setMode('barcode')} className={cn("flex-1 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all", mode === 'barcode' ? "bg-white shadow-sm text-primary" : "text-muted-foreground")}>{t('barcodeMode')}</button>
          <button onClick={() => setMode('photo')} className={cn("flex-1 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all", mode === 'photo' ? "bg-white shadow-sm text-primary" : "text-muted-foreground")}>{t('photoMode')}</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full px-6">
          <div className="flex flex-col items-center">
            <div className="mb-12 relative">
                <div className="relative w-32 h-32 rounded-3xl bg-neutral-50 flex items-center justify-center border shadow-sm overflow-hidden group">
                    <div className="scanner-line opacity-20" />
                    {mode === 'barcode' ? (
                        <QrCode className="w-14 h-14 text-primary opacity-80" />
                    ) : (
                        <ImageIcon className="w-14 h-14 text-primary opacity-80" />
                    )}
                </div>
            </div>

            <div className="text-center space-y-2 mb-12">
              <h1 className="text-3xl font-black tracking-tight">{mode === 'barcode' ? "Scan Product" : "Food AI Vision"}</h1>
              <p className="text-muted-foreground text-sm max-w-[260px] font-bold leading-relaxed">{mode === 'barcode' ? "Point camera at any barcode for instant auto-detection." : "Snap a photo of your meal or fruit for a detailed AI analysis."}</p>
            </div>

            <div className="w-full space-y-4">
              <Button 
                size="lg" 
                className="w-full rounded-2xl h-18 text-lg font-black bg-primary text-white shadow-lg active:scale-95 transition-all" 
                onClick={() => setIsCameraOpen(true)}
              >
                <Camera className="mr-2 h-6 w-6" /> 
                {mode === 'barcode' ? "Open Auto-Scanner" : "Snap Photo"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-16 rounded-2xl font-black text-base border-2 hover:bg-neutral-50 active:scale-95" 
                onClick={handleUploadImage}
              >
                <ImageIcon className="mr-2 h-5 w-5" /> {t('uploadImage')}
              </Button>

              {mode === 'barcode' && (
                <div className="pt-4 w-full flex justify-center">
                  <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="text-primary font-black rounded-full px-6 py-2 h-auto text-xs gap-2">
                        <Keyboard className="h-4 w-4" />
                        {t('enterManually')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl p-8 border-none shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-center mb-6">{t('manualEntry')}</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">{t('barcodeMode')}</Label>
                          <Input 
                            value={manualBarcode}
                            onChange={(e) => setManualBarcode(e.target.value)}
                            placeholder={t('barcodePlaceholder')}
                            className="h-14 rounded-2xl border-2 font-black px-4 text-lg bg-neutral-50 focus:border-primary transition-colors"
                            type="number"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter') handleBarcodeDetected(manualBarcode); }}
                          />
                        </div>
                        <Button 
                          disabled={!manualBarcode || manualBarcode.length < 5 || isAnalyzing}
                          onClick={() => handleBarcodeDetected(manualBarcode)}
                          className="h-16 w-full rounded-2xl font-black text-lg bg-primary text-white shadow-xl"
                        >
                          {t('analyzeProduct')}
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
                            if (mode === 'barcode') {
                                toast({ title: "Image Uploaded", description: "Use camera for auto-detection or snap for AI." });
                            } else {
                                processPhotoImage(base64);
                            }
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

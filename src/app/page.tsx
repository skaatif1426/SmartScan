'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  ScanLine, 
  Loader2, 
  ChevronLeft, 
  Zap, 
  ZapOff, 
  RefreshCw, 
  CheckCircle2,
  Camera,
  QrCode,
  Sparkles,
  Image as ImageIcon,
  ArrowRight,
  Keyboard,
  Focus,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useLanguage, usePreferences } from '@/contexts/AppProviders';
import { Skeleton } from '@/components/ui/skeleton';
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

const QrScanner = dynamic(() => import('@/components/scanner/QrScanner'), {
  loading: () => <Skeleton className="w-full h-full bg-black" />,
  ssr: false,
});

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
  const { trackError } = useAnalytics();
  const { preferences } = usePreferences();
  const { incrementAiCallCount } = useAiUsage();
  const { addScanToHistory } = useScanHistory();
  const { addXp, XP_PER_SCAN } = useGamification();
  
  const [mode, setMode] = useState<ScanMode>('barcode');
  const [showScanner, setShowScanner] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [hint, setHint] = useState<string>('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);

  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const photoCaptureInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showScanner && mode === 'barcode') {
      Html5Qrcode.getCameras().catch(trackError);
    }
  }, [showScanner, trackError, mode]);

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

  const processPhotoImage = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
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
    reader.readAsDataURL(file);
  };

  const handleScanSuccess = useCallback((decodedText: string) => {
    if (isCapturing || isAnalyzing) return;
    setIsCapturing(true);
    setTimeout(() => {
      setShowScanner(false);
      setIsCapturing(false);
      handleBarcodeAnalysisFlow(decodedText);
    }, 400);
  }, [handleBarcodeAnalysisFlow, isAnalyzing, isCapturing]);

  const handleCapturePhoto = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    photoCaptureInputRef.current?.click();
  };

  const handleUploadImage = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    galleryInputRef.current?.click();
  };

  if (isAnalyzing) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-8 bg-background">
        <div className="relative mb-16">
          <div className="w-32 h-32 rounded-full border-4 border-primary/10 flex items-center justify-center">
             <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center animate-shadow-pulse">
                <Sparkles className="w-12 h-12 text-primary animate-pulse" />
             </div>
          </div>
          <Loader2 className="absolute -bottom-2 -right-2 w-10 h-10 text-primary animate-spin" />
        </div>
        <div className="space-y-6 w-full max-w-xs">
          <h2 className="text-xl font-bold text-center">{mode === 'barcode' ? t('processingScan') : t('aiPhotoAnalysis')}</h2>
          {BARCODE_LOADING_STEPS.map((step, idx) => (
            <div key={step} className={cn("flex items-center gap-4 transition-all duration-500", analysisStep > idx ? "text-primary opacity-100" : "opacity-20")}>
              {analysisStep > idx ? <CheckCircle2 className="w-5 h-5" /> : <Loader2 className={cn("w-5 h-5", analysisStep === idx && "animate-spin")} />}
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
      {!showScanner && (
        <div className="pt-8 px-6 flex justify-center z-10">
          <div className="bg-muted p-1 rounded-full flex w-full max-w-[280px]">
            <button onClick={() => setMode('barcode')} className={cn("flex-1 py-2 rounded-full text-sm font-bold transition-all", mode === 'barcode' ? "bg-background shadow-sm" : "text-muted-foreground")}>{t('barcodeMode')}</button>
            <button onClick={() => setMode('photo')} className={cn("flex-1 py-2 rounded-full text-sm font-bold transition-all", mode === 'photo' ? "bg-background shadow-sm" : "text-muted-foreground")}>{t('photoMode')}</button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full px-6">
        {showScanner ? (
          <div className="fixed inset-0 bg-black z-[100] flex flex-col h-svh">
            <div className="flex items-center justify-between px-6 py-8">
              <Button variant="ghost" size="icon" className="text-white" onClick={() => setShowScanner(false)}><ChevronLeft /></Button>
              <Button variant="ghost" size="icon" className="text-white" onClick={() => setIsFlashOn(!isFlashOn)}>{isFlashOn ? <Zap className="fill-yellow-400" /> : <ZapOff />}</Button>
            </div>
            <div className="flex-1 relative">
              <QrScanner 
                onScanSuccess={handleScanSuccess} 
                onScanFailure={() => {}} 
                onCameraPermissionError={(e) => { trackError(); setShowScanner(false); }} 
                onStatusChange={setHint} 
                isCapturing={isCapturing} 
              />
              {hint && (
                <div className="absolute top-12 inset-x-0 flex justify-center">
                  <div className="bg-black/70 px-6 py-2 rounded-full border border-white/20 text-white text-sm font-bold">{t(hint as any)}</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Animated Icon Container */}
            <div className="mb-10 relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse group-hover:bg-primary/30 transition-all duration-700" />
                <div className="relative w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 animate-shadow-pulse overflow-hidden">
                    <div className="scanner-line absolute w-full h-1 bg-primary/60 shadow-[0_0_15px_hsl(var(--primary))] z-10" />
                    {mode === 'barcode' ? (
                        <QrCode className="w-16 h-16 text-primary animate-pulse-subtle" />
                    ) : (
                        <ImageIcon className="w-16 h-16 text-primary animate-pulse-subtle" />
                    )}
                </div>
            </div>

            <div className="text-center space-y-2 mb-12">
              <h1 className="text-3xl font-black tracking-tight">{mode === 'barcode' ? t('barcodeEntry') : t('photoAnalysis')}</h1>
              <p className="text-muted-foreground text-sm max-w-[280px] font-medium">{mode === 'barcode' ? t('barcodeDesc') : t('photoDesc')}</p>
            </div>

            <div className="w-full space-y-4">
              <Button 
                size="lg" 
                className="w-full rounded-full h-20 text-xl font-bold bg-gradient-to-b from-[#22C55E] to-[#16A34A] text-white shadow-lg active:scale-95 transition-all" 
                onClick={() => { if (mode === 'barcode') setShowScanner(true); else handleCapturePhoto(); }}
              >
                <Camera className="mr-3 h-6 w-6" /> {t('capturePhoto')}
              </Button>
              <Button variant="outline" className="w-full h-18 rounded-full border-2 font-bold text-lg active:scale-95 transition-all" onClick={handleUploadImage}>
                <ImageIcon className="mr-3 h-6 w-6" /> {t('uploadImage')}
              </Button>

              {mode === 'barcode' && (
                <div className="pt-8 w-full flex justify-center">
                  <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 rounded-full px-8 py-4 h-auto text-lg">
                        <Keyboard className="mr-2 h-5 w-5" />
                        {t('enterManually')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2.5rem] border-2 w-[92vw] max-w-md p-8">
                      <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-center mb-6 tracking-tight">{t('manualEntry')}</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col gap-8">
                        <div className="space-y-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t('barcodeMode')}</p>
                          <Input 
                            value={manualBarcode}
                            onChange={(e) => setManualBarcode(e.target.value)}
                            placeholder={t('barcodePlaceholder')}
                            className="h-18 rounded-3xl border-2 font-bold px-8 text-xl shadow-inner bg-muted/20"
                            type="number"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter') handleBarcodeAnalysisFlow(manualBarcode); }}
                          />
                        </div>
                        <Button 
                          disabled={!manualBarcode || manualBarcode.length < 5}
                          onClick={() => handleBarcodeAnalysisFlow(manualBarcode)}
                          className="h-20 w-full rounded-3xl font-black text-xl bg-gradient-to-r from-primary to-emerald-600 shadow-xl"
                        >
                          {t('analyzeProduct')}
                          <ArrowRight className="ml-3 w-6 h-6" />
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
            
            <input type="file" ref={photoCaptureInputRef} accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { if (mode === 'barcode') handleBarcodeAnalysisFlow('upload'); else processPhotoImage(f); }}} />
            <input type="file" ref={galleryInputRef} accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { if (mode === 'barcode') handleBarcodeAnalysisFlow('upload'); else processPhotoImage(f); }}} />
          </div>
        )}
      </div>
    </div>
  );
}

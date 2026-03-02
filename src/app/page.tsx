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
  Scan, 
  Keyboard,
  CheckCircle2,
  Camera,
  QrCode,
  Sparkles,
  Image as ImageIcon,
  Search,
  Focus
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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

const PHOTO_LOADING_STEPS = [
  "Analyzing image profile...",
  "Detecting food content...",
  "Calculating nutritional values...",
  "Generating smart insights..."
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
  const [activeCameraId, setActiveCameraId] = useState<string | undefined>(undefined);
  const [cameras, setCameras] = useState<any[]>([]);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [hint, setHint] = useState<string>('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Photo Analysis States
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const barcodeFileInputRef = useRef<HTMLInputElement>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const photoCaptureInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showScanner && mode === 'barcode') {
      Html5Qrcode.getCameras().then(setCameras).catch(trackError);
    }
  }, [showScanner, trackError, mode]);

  const handleBarcodeAnalysisFlow = useCallback(async (barcode: string) => {
    setIsAnalyzing(true);
    setAnalysisStep(0);

    for (let i = 1; i < BARCODE_LOADING_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      setAnalysisStep(i);
    }
    
    await new Promise(r => setTimeout(r, 400));
    router.push(`/product/${barcode}`);
  }, [router]);

  const processPhotoImage = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      setIsAnalyzing(true);
      setAnalysisStep(0);

      const interval = setInterval(() => {
        setAnalysisStep(prev => (prev < 3 ? prev + 1 : prev));
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

  const handleScanSuccess = useCallback((decodedText: string) => {
    if (isCapturing || isAnalyzing) return;
    
    setIsCapturing(true);
    if (window.navigator.vibrate) window.navigator.vibrate(100);
    
    setTimeout(() => {
      setShowScanner(false);
      setIsCapturing(false);
      handleBarcodeAnalysisFlow(decodedText);
    }, 400);
  }, [handleBarcodeAnalysisFlow, isAnalyzing, isCapturing]);

  const handleBarcodeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    const html5QrCode = new Html5Qrcode("barcode-shuttle-hidden", false);

    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      if (decodedText) {
        handleBarcodeAnalysisFlow(decodedText);
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'No Barcode Detected',
        description: 'Could not read a barcode from this image. Please try another or scan directly.',
      });
    } finally {
      setIsProcessingFile(false);
      if (barcodeFileInputRef.current) barcodeFileInputRef.current.value = '';
    }
  };

  const switchCamera = () => {
    if (cameras.length < 2) return;
    const currentIndex = cameras.findIndex(c => c.id === activeCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setActiveCameraId(cameras[nextIndex].id);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const onManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^[0-9]+$/.test(manualBarcode)) {
      handleBarcodeAnalysisFlow(manualBarcode);
    }
  };

  if (isAnalyzing || isProcessingFile) {
    const loadingSteps = mode === 'barcode' ? BARCODE_LOADING_STEPS : PHOTO_LOADING_STEPS;
    const title = isProcessingFile ? "Reading Barcode..." : (mode === 'barcode' ? "Processing Scan..." : "AI Photo Analysis...");

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
          <h2 className="text-xl font-bold text-center mb-4">{title}</h2>
          {!isProcessingFile && loadingSteps.map((step, idx) => (
            <div 
              key={step} 
              className={cn(
                "flex items-center gap-4 transition-all duration-500",
                analysisStep > idx ? "text-primary opacity-100" : 
                analysisStep === idx ? "text-foreground scale-105 opacity-100 font-bold" : 
                "text-muted-foreground opacity-20"
              )}
            >
              {analysisStep > idx ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  analysisStep === idx ? "border-primary border-t-transparent animate-spin" : "border-current"
                )} />
              )}
              <p className="text-base">{mode === 'barcode' ? t(step) : step}</p>
            </div>
          ))}
          {isProcessingFile && (
            <div className="text-center text-muted-foreground animate-pulse">
              Identifying product in database...
            </div>
          )}
        </div>
      </div>
    );
  }

  if (analysisResult && mode === 'photo') {
    return (
      <ImageAnalysisResult 
        result={analysisResult} 
        image={selectedImage} 
        onReset={() => { setAnalysisResult(null); setSelectedImage(null); }} 
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <div id="barcode-shuttle-hidden" className="hidden"></div>

      {/* 1. TOP TOGGLE - PREMIUM SEGMENTED CONTROL */}
      {!showScanner && (
        <div className="pt-8 px-6 flex justify-center z-10">
          <div className="bg-muted p-1 rounded-full flex w-full max-w-[280px] shadow-inner relative border border-white/5 active:scale-[0.98] transition-transform">
            <div 
              className={cn(
                "segmented-switch-indicator w-[calc(50%-4px)]",
                mode === 'barcode' ? "translate-x-0" : "translate-x-full"
              )}
            />
            <button 
              onClick={() => setMode('barcode')}
              className={cn(
                "flex-1 py-2.5 rounded-full text-sm font-bold transition-all z-10",
                mode === 'barcode' ? "text-foreground" : "text-muted-foreground opacity-60"
              )}
            >
              Barcode
            </button>
            <button 
              onClick={() => setMode('photo')}
              className={cn(
                "flex-1 py-2.5 rounded-full text-sm font-bold transition-all z-10",
                mode === 'photo' ? "text-foreground" : "text-muted-foreground opacity-60"
              )}
            >
              Photo
            </button>
          </div>
        </div>
      )}

      <div 
        key={mode} 
        className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full px-6 animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        {mode === 'barcode' && showScanner ? (
          <div className="fixed inset-0 bg-black z-[100] flex flex-col h-svh overflow-hidden text-white animate-in slide-in-from-bottom-full duration-500">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-8 z-10">
              <Button variant="ghost" size="icon" className="text-white bg-black/40 backdrop-blur-md hover:bg-white/10 rounded-full h-12 w-12" onClick={() => setShowScanner(false)}>
                <ChevronLeft className="h-7 w-7" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white bg-black/40 backdrop-blur-md hover:bg-white/10 rounded-full h-12 w-12" onClick={() => setIsFlashOn(!isFlashOn)}>
                {isFlashOn ? <Zap className="h-6 w-6 fill-yellow-400 text-yellow-400" /> : <ZapOff className="h-6 w-6" />}
              </Button>
            </div>

            {/* Camera View */}
            <div className="flex-1 relative">
              <QrScanner 
                onScanSuccess={handleScanSuccess}
                onScanFailure={() => {}}
                onCameraPermissionError={(e) => { trackError(); toast({ variant: 'destructive', title: 'Camera Error', description: e.message }); setShowScanner(false); }}
                onStatusChange={setHint}
                isAutoScan={true}
                activeCameraId={activeCameraId}
                isCapturing={isCapturing}
              />
              
              {hint && (
                <div className="absolute top-12 inset-x-0 flex justify-center pointer-events-none px-6">
                  <div className="bg-black/70 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20 animate-in fade-in slide-in-from-top-6 duration-300">
                    <p className="text-sm font-bold tracking-tight text-white">{t(hint)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="px-8 pb-16 pt-6 bg-gradient-to-t from-black to-transparent space-y-8">
              <div className="flex justify-end pr-2">
                <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/10 shadow-2xl active:scale-90" onClick={switchCamera}>
                  <RefreshCw className="h-6 w-6 text-white" />
                </Button>
              </div>

              <div className="flex flex-col items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                 <p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-60 text-white">Auto-Detect Active</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* 2. MAIN ICON - TACTILE & ANIMATED */}
            <div className="mb-10">
              <div className="relative group">
                <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div 
                  className={cn(
                    "w-36 h-36 rounded-full flex items-center justify-center relative transition-all duration-300 active:scale-90 animate-pulse-subtle",
                    "bg-gradient-to-br from-primary/10 to-primary/20 border-4 border-white dark:border-white/5 shadow-inner"
                  )}
                  onClick={() => mode === 'barcode' ? setShowScanner(true) : photoCaptureInputRef.current?.click()}
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                    {mode === 'barcode' ? (
                      <QrCode className="w-11 h-11 text-white" />
                    ) : (
                      <ImageIcon className="w-11 h-11 text-white" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-2 mb-12">
              <h1 className="text-3xl font-black tracking-tight text-foreground transition-all">
                {mode === 'barcode' ? "Barcode Entry" : "Photo Analysis"}
              </h1>
              <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed font-medium">
                Scan instantly or add {mode === 'barcode' ? 'barcode' : 'photo'} manually
              </p>
            </div>

            <div className="w-full space-y-5">
              <Button 
                size="lg" 
                className={cn(
                  "w-full rounded-full h-15 text-lg font-semibold transition-all duration-300 gap-3",
                  "bg-gradient-to-b from-[#22C55E] to-[#16A34A] text-white",
                  "shadow-[0_8px_16px_rgba(34,197,94,0.12)] border-t border-white/20",
                  "active:scale-95 active:brightness-95 active:shadow-sm"
                )}
                onClick={() => {
                  if (mode === 'barcode') {
                    setShowScanner(true);
                  } else {
                    photoCaptureInputRef.current?.click();
                  }
                }}
              >
                <Camera className="h-6 w-6" />
                Capture Photo
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className={cn(
                    "h-15 rounded-2xl border-border/40 font-bold text-[11px] px-2",
                    "bg-muted/5 hover:bg-muted/10 active:scale-[0.97] transition-all"
                  )}
                  onClick={() => {
                    if (mode === 'barcode') {
                      setShowManualInput(true);
                    } else {
                      photoFileInputRef.current?.click();
                    }
                  }}
                >
                  {mode === 'barcode' ? <Keyboard className="mr-2 h-4 w-4" /> : <ImageIcon className="mr-2 h-4 w-4" />}
                  {mode === 'barcode' ? "Enter Barcode Manually" : "Upload Image"}
                </Button>
                
                <Button 
                  variant="outline" 
                  className={cn(
                    "h-15 rounded-2xl border-border/40 font-bold text-[11px] px-2",
                    "bg-muted/5 hover:bg-muted/10 active:scale-[0.97] transition-all"
                  )}
                  onClick={() => {
                    if (mode === 'barcode') {
                      barcodeFileInputRef.current?.click();
                    } else {
                      photoFileInputRef.current?.click();
                    }
                  }}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {mode === 'barcode' ? "Upload Barcode Image" : "Choose from Gallery"}
                </Button>
              </div>
            </div>

            <input 
              type="file" 
              ref={barcodeFileInputRef} 
              accept="image/*" 
              className="hidden" 
              onChange={handleBarcodeFileUpload}
            />
            <input 
              type="file" 
              ref={photoFileInputRef} 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processPhotoImage(file);
              }}
            />
            <input 
              type="file" 
              ref={photoCaptureInputRef} 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processPhotoImage(file);
              }}
            />
          </div>
        )}
      </div>

      {showManualInput && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[200] flex items-end sm:items-center justify-center p-6 animate-in fade-in duration-300">
          <Card className="w-full max-w-md animate-in slide-in-from-bottom-full duration-500 shadow-2xl border-2 rounded-[2.5rem]">
            <CardContent className="pt-8 space-y-6">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-black tracking-tight text-foreground">Enter Barcode</h2>
                <Button variant="ghost" size="sm" className="rounded-full h-10 px-6 font-bold" onClick={() => setShowManualInput(false)}>Cancel</Button>
              </div>
              <form onSubmit={onManualSubmit} className="space-y-4 p-2">
                <div className="relative">
                  <Input 
                    placeholder="e.g. 8901234567890" 
                    value={manualBarcode} 
                    onChange={e => setManualBarcode(e.target.value)}
                    type="number"
                    autoFocus
                    className="h-16 text-xl font-mono tracking-widest text-center rounded-2xl border-2 focus:ring-primary shadow-inner"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 h-5 w-5" />
                </div>
                <Button className="w-full h-16 rounded-2xl text-lg font-black shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground active:scale-95 transition-all">Search Database</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

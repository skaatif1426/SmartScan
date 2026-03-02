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
import { useLanguage } from '@/contexts/AppProviders';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnalytics } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';
import ImageScanner from '@/components/scanner/ImageScanner';

const QrScanner = dynamic(() => import('@/components/scanner/QrScanner'), {
  loading: () => <Skeleton className="w-full h-full bg-black" />,
  ssr: false,
});

const LOADING_STEPS = [
  'loadingCapture',
  'loadingRead',
  'loadingIngredients',
  'loadingInsights'
];

type ScanMode = 'barcode' | 'photo';

export default function ScannerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { trackError } = useAnalytics();
  
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

  const barcodeFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showScanner && mode === 'barcode') {
      Html5Qrcode.getCameras().then(setCameras).catch(trackError);
    }
  }, [showScanner, trackError, mode]);

  const handleAnalysisFlow = useCallback(async (barcode: string) => {
    setIsAnalyzing(true);
    setAnalysisStep(0);

    for (let i = 1; i < LOADING_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      setAnalysisStep(i);
    }
    
    await new Promise(r => setTimeout(r, 400));
    router.push(`/product/${barcode}`);
  }, [router]);

  const handleScanSuccess = useCallback((decodedText: string) => {
    if (isCapturing || isAnalyzing) return;
    
    setIsCapturing(true);
    if (window.navigator.vibrate) window.navigator.vibrate(100);
    
    setTimeout(() => {
      setShowScanner(false);
      setIsCapturing(false);
      handleAnalysisFlow(decodedText);
    }, 400);
  }, [handleAnalysisFlow, isAnalyzing, isCapturing]);

  const handleBarcodeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    const html5QrCode = new Html5Qrcode("barcode-shuttle-hidden", false);

    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      if (decodedText) {
        handleAnalysisFlow(decodedText);
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
      handleAnalysisFlow(manualBarcode);
    }
  };

  if (isAnalyzing || isProcessingFile) {
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
          <h2 className="text-xl font-bold text-center mb-4">{isProcessingFile ? "Reading Barcode..." : "Processing Scan..."}</h2>
          {!isProcessingFile && LOADING_STEPS.map((step, idx) => (
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
              <p className="text-base">{t(step)}</p>
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

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <div id="barcode-shuttle-hidden" className="hidden"></div>

      {/* 1. PREMIUM SEGMENTED SWITCHER */}
      {!showScanner && (
        <div className="pt-8 px-6 flex justify-center z-10">
          <div className="relative bg-muted p-1 rounded-full flex w-full max-w-[280px] shadow-inner border border-border/50">
            {/* Sliding Indicator */}
            <div 
              className={cn(
                "segmented-switch-indicator w-[calc(50%-4px)]",
                mode === 'barcode' ? "left-1" : "left-[calc(50%+3px)]"
              )} 
            />
            
            <button 
              onClick={() => setMode('barcode')}
              className={cn(
                "relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-black transition-colors duration-300",
                mode === 'barcode' ? "text-primary" : "text-muted-foreground"
              )}
            >
              <QrCode className="h-4 w-4" />
              Barcode
            </button>
            <button 
              onClick={() => setMode('photo')}
              className={cn(
                "relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-black transition-colors duration-300",
                mode === 'photo' ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Camera className="h-4 w-4" />
              Photo
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
        {mode === 'barcode' ? (
          !showScanner ? (
            <div className="p-6 space-y-10 animate-in fade-in zoom-in-95 duration-700">
              {/* 2. HERO SCAN AREA */}
              <div className="relative group">
                <Card className="rounded-[40px] border-none shadow-sm bg-card/50 overflow-hidden aspect-square flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
                  
                  {/* Subtle pulsing frame */}
                  <div className="relative w-48 h-48 rounded-3xl border-2 border-primary/30 flex items-center justify-center scan-frame-pulse">
                    <Focus className="absolute -top-3 -left-3 h-8 w-8 text-primary/40" />
                    <Focus className="absolute -top-3 -right-3 h-8 w-8 text-primary/40 rotate-90" />
                    <Focus className="absolute -bottom-3 -left-3 h-8 w-8 text-primary/40 -rotate-90" />
                    <Focus className="absolute -bottom-3 -right-3 h-8 w-8 text-primary/40 rotate-180" />
                    
                    <div className="flex flex-col items-center gap-4">
                      <ScanLine className="w-16 h-16 text-primary/80" />
                      <div className="space-y-1 text-center">
                        <p className="text-xs font-black uppercase tracking-widest text-primary/60">Ready to detect</p>
                        <p className="text-[10px] text-muted-foreground/60 font-bold italic">Better in good lighting</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* 3. PRIMARY ACTION */}
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-black tracking-tight leading-none">Barcode Entry</h1>
                  <p className="text-muted-foreground text-sm font-bold">Scan instantly or add barcode manually</p>
                </div>

                <Button 
                  size="lg" 
                  className="w-full rounded-2xl h-18 text-lg font-black shadow-xl shadow-primary/10 active:scale-[0.97] transition-all bg-gradient-to-r from-primary to-emerald-500 gap-3" 
                  onClick={() => setShowScanner(true)}
                >
                  <Scan className="h-6 w-6" />
                  Scan with Camera
                </Button>

                {/* 4. SECONDARY ACTION CARDS GRID */}
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => barcodeFileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-6 bg-card border-2 border-border/50 rounded-3xl gap-3 transition-all active:scale-95 hover:bg-muted/50 shadow-sm"
                  >
                    <div className="p-3 bg-primary/10 rounded-2xl">
                      <ImageIcon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Upload Image</span>
                  </button>
                  
                  <button 
                    onClick={() => setShowManualInput(true)}
                    className="flex flex-col items-center justify-center p-6 bg-card border-2 border-border/50 rounded-3xl gap-3 transition-all active:scale-95 hover:bg-muted/50 shadow-sm"
                  >
                    <div className="p-3 bg-primary/10 rounded-2xl">
                      <Keyboard className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Manual Entry</span>
                  </button>
                </div>
              </div>

              <input 
                type="file" 
                ref={barcodeFileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleBarcodeFileUpload}
              />
            </div>
          ) : (
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
                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                   <p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-60">Auto-Detect Active</p>
                </div>
              </div>
            </div>
          )
        ) : (
          <ImageScanner />
        )}
      </div>

      {/* Manual Entry Sheet */}
      {showManualInput && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[200] flex items-end sm:items-center justify-center p-6">
          <Card className="w-full max-w-md animate-in slide-in-from-bottom-full duration-500 shadow-2xl border-2">
            <CardContent className="pt-8 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black tracking-tight">Enter Barcode</h2>
                <Button variant="ghost" size="sm" className="rounded-full h-8 px-4" onClick={() => setShowManualInput(false)}>Cancel</Button>
              </div>
              <form onSubmit={onManualSubmit} className="space-y-4">
                <div className="relative">
                  <Input 
                    placeholder="e.g. 8901234567890" 
                    value={manualBarcode} 
                    onChange={e => setManualBarcode(e.target.value)}
                    type="number"
                    autoFocus
                    className="h-16 text-xl font-mono tracking-widest text-center rounded-2xl"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 h-5 w-5" />
                </div>
                <Button className="w-full h-16 rounded-2xl text-lg font-black shadow-lg" disabled={!manualBarcode}>Search Database</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

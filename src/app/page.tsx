'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  CameraOff, 
  ScanLine, 
  FileImage, 
  Loader2, 
  ChevronLeft, 
  Zap, 
  ZapOff, 
  RefreshCw, 
  Scan, 
  Keyboard,
  CheckCircle2,
  AlertCircle
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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

export default function ScannerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { trackError } = useAnalytics();
  
  const [showScanner, setShowScanner] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [activeCameraId, setActiveCameraId] = useState<string | undefined>(undefined);
  const [cameras, setCameras] = useState<any[]>([]);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isAutoScan, setIsAutoScan] = useState(false);
  const [hint, setHint] = useState<string>('scannerPrompt');
  const [manualBarcode, setManualBarcode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showScanner) {
      Html5Qrcode.getCameras().then(setCameras).catch(trackError);
    }
  }, [showScanner, trackError]);

  const handleAnalysisFlow = useCallback(async (barcode: string) => {
    setIsAnalyzing(true);
    setAnalysisStep(0);

    // Simulated premium loading experience with steps
    for (let i = 1; i < LOADING_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setAnalysisStep(i);
    }
    
    await new Promise(r => setTimeout(r, 400));
    router.push(`/product/${barcode}`);
  }, [router]);

  const handleScanSuccess = useCallback((decodedText: string) => {
    if (isCapturing || isAnalyzing) return;
    
    setIsCapturing(true);
    if (window.navigator.vibrate) window.navigator.vibrate(100);
    
    // Freeze frame for premium feel
    setTimeout(() => {
      setShowScanner(false);
      setIsCapturing(false);
      handleAnalysisFlow(decodedText);
    }, 500);
  }, [handleAnalysisFlow, isAnalyzing, isCapturing]);

  const switchCamera = () => {
    if (cameras.length < 2) return;
    const currentIndex = cameras.findIndex(c => c.id === activeCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setActiveCameraId(cameras[nextIndex].id);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;
    const file = event.target.files[0];
    setIsAnalyzing(true);
    setAnalysisStep(0);

    try {
      const html5QrCode = new Html5Qrcode('reader-hidden', false);
      const decodedText = await html5QrCode.scanFile(file, false);
      handleScanSuccess(decodedText);
    } catch (err) {
      trackError();
      setIsAnalyzing(false);
      toast({
        variant: 'destructive',
        title: t('scanErrorTitle'),
        description: t('noBarcodeInImage'),
      });
    }
  };

  const onManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^[0-9]+$/.test(manualBarcode)) {
      handleAnalysisFlow(manualBarcode);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background animate-in fade-in duration-500">
        <div className="relative mb-12">
          <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg">
            <Scan className="w-4 h-4" />
          </div>
        </div>
        
        <div className="space-y-6 w-full max-w-xs">
          {LOADING_STEPS.map((step, idx) => (
            <div 
              key={step} 
              className={cn(
                "flex items-center gap-3 transition-all duration-300",
                analysisStep > idx ? "text-green-500 opacity-100" : 
                analysisStep === idx ? "text-foreground scale-105 opacity-100 font-semibold" : 
                "text-muted-foreground opacity-40"
              )}
            >
              {analysisStep > idx ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
              <p className="text-sm">{t(step)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!showScanner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-6 space-y-8 animate-in zoom-in-95 duration-500">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center animate-shadow-pulse">
            <ScanLine className="w-16 h-16 text-primary" />
          </div>
        </div>
        
        <div className="text-center space-y-2 max-w-xs">
          <h1 className="text-3xl font-bold tracking-tight">{t('scannerTitle')}</h1>
          <p className="text-muted-foreground">{t('scannerPrompt')}</p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <Button size="lg" className="w-full rounded-2xl h-16 text-lg font-semibold shadow-xl" onClick={() => setShowScanner(true)}>
            <Scan className="mr-2 h-6 w-6" />
            {t('startScanning')}
          </Button>
          
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="rounded-2xl h-12" onClick={() => fileInputRef.current?.click()}>
              <FileImage className="mr-2 h-4 w-4" />
              {t('uploadImage')}
            </Button>
            <Button variant="outline" className="rounded-2xl h-12" onClick={() => setShowManualInput(true)}>
              <Keyboard className="mr-2 h-4 w-4" />
              Manual
            </Button>
          </div>
        </div>

        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        <div id="reader-hidden" className="hidden" />

        {showManualInput && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
            <Card className="w-full max-w-md animate-in slide-in-from-bottom-10">
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold">Manual Entry</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowManualInput(false)}>Close</Button>
                </div>
                <form onSubmit={onManualSubmit} className="space-y-4">
                  <Input 
                    placeholder="Enter Barcode Number" 
                    value={manualBarcode} 
                    onChange={e => setManualBarcode(e.target.value)}
                    type="number"
                    autoFocus
                  />
                  <Button className="w-full rounded-xl" disabled={!manualBarcode}>Search</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col h-svh overflow-hidden text-white animate-in slide-in-from-bottom-full duration-500">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-6 z-10 bg-gradient-to-b from-black/60 to-transparent">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => setShowScanner(false)}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <span className="font-semibold text-lg">{t('scannerTitle')}</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => setIsFlashOn(!isFlashOn)}>
            {isFlashOn ? <Zap className="h-5 w-5 fill-yellow-400 text-yellow-400" /> : <ZapOff className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={switchCamera}>
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        <QrScanner 
          onScanSuccess={handleScanSuccess}
          onScanFailure={() => {}}
          onCameraPermissionError={(e) => { trackError(); toast({ variant: 'destructive', title: 'Camera Error', description: e.message }); setShowScanner(false); }}
          onStatusChange={setHint}
          isAutoScan={isAutoScan}
          activeCameraId={activeCameraId}
          isCapturing={isCapturing}
        />
        
        {/* Dynamic Hints Overlay */}
        <div className="absolute top-10 inset-x-0 flex justify-center pointer-events-none">
          <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 animate-in fade-in slide-in-from-top-4 duration-300">
            <p className="text-sm font-medium tracking-wide flex items-center gap-2">
              <Scan className="w-3 h-3" />
              {t(hint)}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="px-8 pt-6 pb-12 bg-gradient-to-t from-black/80 to-transparent space-y-8">
        <div className="flex items-center justify-center gap-12">
          <div className="flex flex-col items-center gap-2">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20" onClick={() => fileInputRef.current?.click()}>
              <FileImage className="h-5 w-5" />
            </Button>
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Gallery</span>
          </div>

          <button 
            className={cn(
              "w-20 h-20 rounded-full border-4 transition-all duration-300 active:scale-90 flex items-center justify-center",
              isCapturing ? "bg-white scale-110" : "bg-primary border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            )}
            onClick={() => handleScanSuccess('manual-trigger-wait-for-capture')}
            disabled={isCapturing}
          >
            <div className="w-16 h-16 rounded-full border-2 border-white/40 flex items-center justify-center">
               <ScanLine className="w-8 h-8 text-white" />
            </div>
          </button>

          <div className="flex flex-col items-center gap-2">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20" onClick={() => setShowManualInput(true)}>
              <Keyboard className="h-5 w-5" />
            </Button>
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Manual</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="space-y-0.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-white/80">Auto-Scan Mode</Label>
            <p className="text-[10px] text-white/40">Detect barcodes automatically</p>
          </div>
          <Switch checked={isAutoScan} onCheckedChange={setIsAutoScan} />
        </div>
      </div>
      
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
    </div>
  );
}
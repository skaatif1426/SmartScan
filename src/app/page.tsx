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
  Sparkles
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
          <h2 className="text-xl font-bold text-center mb-4">Processing Scan...</h2>
          {LOADING_STEPS.map((step, idx) => (
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
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top Mode Switcher */}
      {!showScanner && (
        <div className="pt-8 px-6 flex justify-center z-10">
          <div className="bg-muted p-1.5 rounded-full flex gap-1 shadow-inner border">
            <button 
              onClick={() => setMode('barcode')}
              className={cn(
                "flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-black transition-all duration-300",
                mode === 'barcode' ? "bg-background text-primary shadow-lg scale-105" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <QrCode className="h-4 w-4" />
              Barcode
            </button>
            <button 
              onClick={() => setMode('photo')}
              className={cn(
                "flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-black transition-all duration-300",
                mode === 'photo' ? "bg-background text-primary shadow-lg scale-105" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Camera className="h-4 w-4" />
              Photo
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto flex flex-col justify-center">
        {mode === 'barcode' ? (
          !showScanner ? (
            <div className="flex flex-col items-center p-6 space-y-12 animate-in zoom-in-95 duration-500">
              <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center animate-shadow-pulse">
                <ScanLine className="w-14 h-14 text-primary" />
              </div>
              
              <div className="text-center space-y-3">
                <h1 className="text-3xl font-black tracking-tight">{t('scannerTitle')}</h1>
                <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">{t('scannerPrompt')}</p>
              </div>

              <div className="w-full max-w-sm space-y-4">
                <Button size="lg" className="w-full rounded-2xl h-16 text-lg font-bold shadow-xl active:scale-95" onClick={() => setShowScanner(true)}>
                  <Scan className="mr-2 h-6 w-6" />
                  {t('startScanning')}
                </Button>
                
                <Button variant="ghost" className="w-full h-12 text-muted-foreground font-bold" onClick={() => setShowManualInput(true)}>
                  <Keyboard className="mr-2 h-4 w-4" />
                  Manual Entry
                </Button>
              </div>
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

      {showManualInput && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[200] flex items-end sm:items-center justify-center p-6">
          <Card className="w-full max-w-md animate-in slide-in-from-bottom-10 shadow-2xl border-2">
            <CardContent className="pt-8 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black">Manual Entry</h2>
                <Button variant="ghost" size="sm" className="rounded-full h-8 px-4" onClick={() => setShowManualInput(false)}>Close</Button>
              </div>
              <form onSubmit={onManualSubmit} className="space-y-4">
                <Input 
                  placeholder="Enter Barcode Number" 
                  value={manualBarcode} 
                  onChange={e => setManualBarcode(e.target.value)}
                  type="number"
                  autoFocus
                  className="h-14 text-lg font-mono tracking-widest text-center"
                />
                <Button className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg" disabled={!manualBarcode}>Search Database</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

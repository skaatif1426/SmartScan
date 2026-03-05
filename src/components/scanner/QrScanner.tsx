'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Zap, ZapOff, X, Image as ImageIcon, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure: (error: unknown) => void;
  onCameraPermissionError: (error: Error) => void;
  onClose: () => void;
}

const qrcodeRegionId = 'html5qr-code-full-region';

const QrScanner = ({ 
  onScanSuccess, 
  onScanFailure, 
  onCameraPermissionError, 
  onClose
}: QrScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.warn('Stop error:', e);
      }
    }
  };

  const startScanner = async (cameraId: string) => {
    if (!scannerRef.current) return;
    
    await stopScanner();

    try {
      await scannerRef.current.start(
        cameraId,
        {
          fps: 30,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const width = Math.min(viewfinderWidth * 0.85, 450);
            const height = width * 0.55;
            return { width, height };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          onScanSuccess(decodedText);
        },
        () => {} // Silent failures for search
      );

      setIsReady(true);

      const track = scannerRef.current.getVideoTrack();
      if (track) {
        const capabilities = track.getCapabilities() as any;
        setHasFlash(!!capabilities.torch);
      }
    } catch (err) {
      onCameraPermissionError(err instanceof Error ? err : new Error('Start failed'));
    }
  };

  useEffect(() => {
    const scanner = new Html5Qrcode(qrcodeRegionId, {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
      ],
      verbose: false
    });
    scannerRef.current = scanner;

    const init = async () => {
      try {
        const devs = await Html5Qrcode.getCameras();
        if (devs.length > 0) {
          const backIdx = devs.findIndex(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('rear'));
          await startScanner(devs[backIdx !== -1 ? backIdx : 0].id);
        }
      } catch (err) {
        onCameraPermissionError(err instanceof Error ? err : new Error('Camera access failed'));
      }
    };

    init();
    return () => { stopScanner(); };
  }, []);

  const toggleFlash = async () => {
    if (!scannerRef.current || !hasFlash) return;
    const newState = !isFlashOn;
    try {
      await (scannerRef.current as any).applyVideoConstraints({
        advanced: [{ torch: newState }]
      });
      setIsFlashOn(newState);
    } catch (e) {
      console.error('Flash toggle failed', e);
    }
  };

  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && scannerRef.current) {
      try {
        const decodedText = await scannerRef.current.scanFile(file, true);
        onScanSuccess(decodedText);
      } catch (err) {
        onScanFailure(err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black flex flex-col font-sans">
      <div className="relative flex-1 bg-black overflow-hidden">
        <div id={qrcodeRegionId} className="w-full h-full object-cover" />
        
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* --- Top Controls --- */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-30">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="w-10 h-10 rounded-full text-white/80 hover:bg-white/10 active:scale-90"
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="icon"
              disabled={!hasFlash}
              onClick={toggleFlash}
              className={cn(
                "w-10 h-10 rounded-full text-white/80 hover:bg-white/10",
                isFlashOn && "bg-white/20 text-yellow-400"
              )}
            >
              {isFlashOn ? <Zap className="w-5 h-5 fill-current" /> : <Zap className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full text-white/80 hover:bg-white/10"
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* --- Viewfinder Frame (Match Reference) --- */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-30">
          <div className="relative w-[85vw] max-w-[420px] aspect-[1.8/1] rounded-[2.5rem]">
            
            {/* Brackets - Top Left */}
            <div className="absolute -top-1 -left-1 w-12 h-12 border-t-[5px] border-l-[5px] border-white rounded-tl-[2rem]" />
            {/* Brackets - Top Right */}
            <div className="absolute -top-1 -right-1 w-12 h-12 border-t-[5px] border-r-[5px] border-white rounded-tr-[2rem]" />
            
            {/* Brackets - Bottom Left (Extended per Sketch) */}
            <div className="absolute -bottom-1 -left-1 flex flex-col items-start">
                <div className="w-12 h-12 border-b-[5px] border-l-[5px] border-white rounded-bl-[2rem]" />
                <div className="absolute -bottom-4 -left-2 w-8 h-[5px] bg-white opacity-80" />
            </div>

            {/* Brackets - Bottom Right (Extended per Sketch) */}
            <div className="absolute -bottom-1 -right-1 flex flex-col items-end">
                <div className="w-12 h-12 border-b-[5px] border-r-[5px] border-white rounded-br-[2rem]" />
                <div className="absolute -bottom-4 -right-2 w-8 h-[5px] bg-white opacity-80" />
            </div>
            
            {/* The Scanning Line */}
            <div className="absolute left-[10%] right-[10%] h-[3px] bg-emerald-400/80 shadow-[0_0_15px_rgba(52,199,89,0.8)] animate-scan-y rounded-full" />
          </div>
          
          <p className="mt-12 text-white/90 font-semibold text-lg tracking-wide bg-black/20 px-6 py-2 rounded-full backdrop-blur-md border border-white/5">
            Scan barcode
          </p>
        </div>

        {/* --- Bottom Action Pill --- */}
        <div className="absolute bottom-16 left-0 right-0 flex justify-center z-30 px-6">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-zinc-900/80 backdrop-blur-2xl border border-white/10 text-white rounded-full px-8 h-14 font-bold text-sm gap-3 active:scale-95 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
          >
            <ImageIcon className="w-5 h-5 text-emerald-400" />
            Scan from photo
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileScan} 
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes scan-y {
          0%, 100% { top: 15%; opacity: 0.2; }
          50% { top: 85%; opacity: 1; }
        }
        .animate-scan-y {
          animation: scan-y 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default QrScanner;

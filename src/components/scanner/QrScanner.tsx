'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Zap, X, Image as ImageIcon } from 'lucide-react';
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
        console.warn('Scanner stop error', e);
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
            const width = Math.min(viewfinderWidth * 0.8, 400);
            const height = width * 0.6; 
            return { width, height };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if (navigator.vibrate) navigator.vibrate(50);
          onScanSuccess(decodedText);
        },
        () => {} 
      );

      setIsReady(true);

      const track = scannerRef.current.getVideoTrack();
      if (track) {
        const capabilities = track.getCapabilities() as any;
        setHasFlash(!!capabilities.torch);
      }
    } catch (err) {
      onCameraPermissionError(err instanceof Error ? err : new Error('Scanner failed to start'));
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
    <div className="fixed inset-0 z-[300] bg-black flex flex-col font-sans overflow-hidden animate-in fade-in duration-300">
      <div id={qrcodeRegionId} className="absolute inset-0 w-full h-full object-cover" />
      
      <div className="absolute inset-0 flex flex-col pointer-events-none">
        <div className="p-6 flex justify-between items-center pointer-events-auto z-50">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="w-12 h-12 rounded-full text-white bg-black/40 backdrop-blur-xl hover:bg-white/10 active:scale-90 transition-all"
          >
            <X className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            disabled={!hasFlash}
            onClick={toggleFlash}
            className={cn(
              "w-12 h-12 rounded-full text-white bg-black/40 backdrop-blur-xl hover:bg-white/10 active:scale-90 transition-all",
              isFlashOn && "bg-white/20 text-yellow-400"
            )}
          >
            <Zap className={cn("w-6 h-6", isFlashOn && "fill-current")} />
          </Button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="relative w-[80vw] max-w-[380px] aspect-[1.6/1] z-40">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#20BF5A] rounded-tl-2xl shadow-[0_0_15px_rgba(32,191,90,0.4)]" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#20BF5A] rounded-tr-2xl shadow-[0_0_15px_rgba(32,191,90,0.4)]" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#20BF5A] rounded-bl-2xl shadow-[0_0_15px_rgba(32,191,90,0.4)]" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#20BF5A] rounded-br-2xl shadow-[0_0_15px_rgba(32,191,90,0.4)]" />
            <div className="absolute left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-[#20BF5A] to-transparent shadow-[0_0_20px_rgba(32,191,90,1)] animate-scanner-laser z-50" />
            <div className="absolute inset-0 bg-white/5 backdrop-brightness-125 rounded-2xl" />
          </div>

          <div className="mt-12 flex flex-col items-center gap-3">
            <div className="px-6 py-2 rounded-full bg-black/60 backdrop-blur-md shadow-2xl">
              <p className="text-white/90 font-black text-[11px] tracking-[0.15em] uppercase">
                Align Barcode
              </p>
            </div>
            <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] animate-pulse">Auto-detect active</p>
          </div>
        </div>

        <div className="p-10 flex justify-center pointer-events-auto z-50">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="h-16 px-10 rounded-full bg-white/5 backdrop-blur-3xl text-white font-black text-[11px] uppercase tracking-[0.2em] gap-3 active:scale-95 transition-all shadow-2xl hover:bg-white/10"
          >
            <ImageIcon className="w-5 h-5 text-[#20BF5A]" />
            Gallery Scan
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

      {!isReady && (
        <div className="absolute inset-0 z-[100] bg-neutral-950 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-white/5 border-t-[#20BF5A] rounded-full animate-spin" />
          <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.2em]">Initializing...</p>
        </div>
      )}

      <style jsx global>{`
        @keyframes scanner-laser {
          0%, 100% { top: 10%; opacity: 0.2; }
          50% { top: 90%; opacity: 1; }
        }
        .animate-scanner-laser {
          animation: scanner-laser 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default QrScanner;
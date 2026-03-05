'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Zap, X, Image as ImageIcon, User } from 'lucide-react';
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
            // Wider box for barcode optimization as requested
            const width = Math.min(viewfinderWidth * 0.85, 450);
            const height = width * 0.5; 
            return { width, height };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          onScanSuccess(decodedText);
        },
        () => {} // Silent failures
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
    <div className="fixed inset-0 z-[300] bg-black flex flex-col font-sans overflow-hidden">
      <div className="relative flex-1 bg-black">
        {/* Full region video */}
        <div id={qrcodeRegionId} className="w-full h-full object-cover" />
        
        {/* Dimmed Overlay with cutout handled via CSS masks or just layered divs */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

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
            className="w-10 h-10 rounded-full text-white bg-black/20 backdrop-blur-md hover:bg-white/10"
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
                "w-10 h-10 rounded-full text-white bg-black/20 backdrop-blur-md hover:bg-white/10",
                isFlashOn && "bg-white/20 text-yellow-400"
              )}
            >
              <Zap className={cn("w-5 h-5", isFlashOn && "fill-current")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full text-white bg-black/20 backdrop-blur-md hover:bg-white/10"
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* --- Viewfinder Frame (Reference Match) --- */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-30">
          <div className="relative w-[85vw] max-w-[420px] aspect-[1.8/1]">
            
            {/* Brackets - Top Left */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-[4px] border-l-[4px] border-white rounded-tl-3xl" />
            {/* Brackets - Top Right */}
            <div className="absolute top-0 right-0 w-12 h-12 border-t-[4px] border-r-[4px] border-white rounded-tr-3xl" />
            
            {/* Brackets - Bottom Left (With extra tick matching reference) */}
            <div className="absolute bottom-0 left-0">
                {/* Horizontal tick below */}
                <div className="absolute -bottom-4 left-0 w-8 h-[4px] bg-white rounded-full opacity-90" />
                {/* Vertical tick side */}
                <div className="absolute -left-4 bottom-0 w-[4px] h-8 bg-white rounded-full opacity-90" />
                {/* Main corner */}
                <div className="w-12 h-12 border-b-[4px] border-l-[4px] border-white rounded-bl-3xl" />
            </div>

            {/* Brackets - Bottom Right (With extra tick matching reference) */}
            <div className="absolute bottom-0 right-0">
                {/* Horizontal tick below */}
                <div className="absolute -bottom-4 right-0 w-8 h-[4px] bg-white rounded-full opacity-90" />
                {/* Vertical tick side */}
                <div className="absolute -right-4 bottom-0 w-[4px] h-8 bg-white rounded-full opacity-90" />
                {/* Main corner */}
                <div className="w-12 h-12 border-b-[4px] border-r-[4px] border-white rounded-br-3xl" />
            </div>
            
            {/* Scanning Line */}
            <div className="absolute left-[5%] right-[5%] h-[2.5px] bg-[#20BF5A] shadow-[0_0_15px_rgba(32,191,90,0.8)] animate-scan-y rounded-full" />
          </div>
          
          <p className="mt-16 text-white font-black text-sm uppercase tracking-[0.2em] bg-black/40 px-6 py-2.5 rounded-full backdrop-blur-xl border border-white/10">
            Scan barcode
          </p>
        </div>

        {/* --- Bottom Action Pill --- */}
        <div className="absolute bottom-16 left-0 right-0 flex justify-center z-30 px-6">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-white/10 backdrop-blur-3xl border border-white/20 text-white rounded-full px-8 h-14 font-black text-xs uppercase tracking-widest gap-3 active:scale-95 transition-all shadow-2xl"
          >
            <ImageIcon className="w-5 h-5 text-[#20BF5A]" />
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
          0%, 100% { top: 10%; opacity: 0.3; }
          50% { top: 90%; opacity: 1; }
        }
        .animate-scan-y {
          animation: scan-y 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default QrScanner;

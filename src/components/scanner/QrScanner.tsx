'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Zap, ZapOff, RefreshCcw, X, Image as ImageIcon, Settings } from 'lucide-react';
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
  const [cameras, setCameras] = useState<any[]>([]);
  const [activeCameraIndex, setActiveCameraIndex] = useState(0);
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
          fps: 30, // Increased for smoother auto-detect
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            // Optimized for barcodes (wider than square)
            const width = Math.min(viewfinderWidth * 0.8, 400);
            const height = width * 0.5; // Barcode aspect ratio
            return { width, height };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Silent failure during search
        }
      );

      setIsReady(true);

      // Check if flash is supported
      try {
        const track = scannerRef.current.getVideoTrack();
        if (track) {
          const capabilities = track.getCapabilities() as any;
          setHasFlash(!!capabilities.torch);
        }
      } catch (e) {
        setHasFlash(false);
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
        Html5QrcodeSupportedFormats.QR_CODE, // Still support QR just in case
      ],
      verbose: false
    });
    scannerRef.current = scanner;

    const init = async () => {
      try {
        const devs = await Html5Qrcode.getCameras();
        setCameras(devs);
        if (devs.length > 0) {
          // Auto-select rear camera
          const backIdx = devs.findIndex(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('rear'));
          const startIdx = backIdx !== -1 ? backIdx : 0;
          setActiveCameraIndex(startIdx);
          await startScanner(devs[startIdx].id);
        }
      } catch (err) {
        onCameraPermissionError(err instanceof Error ? err : new Error('Camera access failed'));
      }
    };

    init();

    return () => {
      stopScanner();
    };
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
    <div className="fixed inset-0 z-[300] bg-black flex flex-col">
      <div className="relative flex-1 bg-black overflow-hidden">
        {/* The Camera Feed */}
        <div id={qrcodeRegionId} className="w-full h-full object-cover" />
        
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* --- Top Controls (Reference Style) --- */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="w-10 h-10 rounded-full text-white hover:bg-white/10 active:scale-90 transition-all"
          >
            <X className="w-6 h-6" />
          </Button>

          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="icon"
              disabled={!hasFlash}
              onClick={toggleFlash}
              className={cn(
                "w-10 h-10 rounded-full text-white hover:bg-white/10 active:scale-90 transition-all",
                isFlashOn && "bg-white/20"
              )}
            >
              {isFlashOn ? <Zap className="w-5 h-5 fill-current" /> : <Zap className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full text-white hover:bg-white/10 active:scale-90 transition-all"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* --- Central Viewfinder Frame (Reference Style) --- */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
          <div className="relative w-[80vw] max-w-[400px] aspect-[2/1] border-2 border-white/10 rounded-[2rem] overflow-hidden">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-[1.5rem]" />
            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-[1.5rem]" />
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-[1.5rem]" />
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-[1.5rem]" />
            
            {/* Scanning Line */}
            <div className="scanner-line opacity-40" />
          </div>
          
          <p className="mt-8 text-white font-medium text-lg tracking-tight">
            Scan barcode
          </p>
        </div>

        {/* --- Bottom Action Button (Reference Style) --- */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center z-10 px-6">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-black/60 backdrop-blur-xl border border-white/10 text-white rounded-full px-8 h-14 font-medium text-sm gap-3 active:scale-95 transition-all shadow-2xl"
          >
            <ImageIcon className="w-5 h-5" />
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
    </div>
  );
};

export default QrScanner;

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Zap, ZapOff, RefreshCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
          fps: 20,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const size = Math.min(viewfinderWidth, viewfinderHeight);
            const boxSize = Math.max(Math.floor(size * 0.7), 250); 
            return { width: boxSize, height: Math.floor(boxSize * 0.6) };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Failure is common while searching, don't spam errors
        }
      );

      setIsReady(true);

      // Check if flash is supported
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
    });
    scannerRef.current = scanner;

    const init = async () => {
      try {
        const devs = await Html5Qrcode.getCameras();
        setCameras(devs);
        if (devs.length > 0) {
          // Prefer back camera
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

  const switchCamera = async () => {
    if (cameras.length < 2) return;
    const nextIdx = (activeCameraIndex + 1) % cameras.length;
    setActiveCameraIndex(nextIdx);
    setIsFlashOn(false);
    await startScanner(cameras[nextIdx].id);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black flex flex-col">
      {/* Scanner Viewport */}
      <div className="relative flex-1 bg-black overflow-hidden">
        <div id={qrcodeRegionId} className="w-full h-full object-cover" />
        
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-white font-bold text-sm">Initializing Auto-Scanner...</p>
            </div>
          </div>
        )}

        {/* Overlay Frame */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
          <div className="w-[75vw] aspect-[1.4/1] rounded-3xl border-2 border-white/40 relative overflow-hidden">
            <div className="scanner-line" />
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />
          </div>
          <p className="mt-8 text-white/80 font-bold text-xs uppercase tracking-widest bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
            Align Barcode Automatically
          </p>
        </div>

        {/* Close Button */}
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 border-white/20 text-white backdrop-blur-xl"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Controls Bar */}
      <div className="bg-black/95 p-8 flex items-center justify-center gap-12">
        {hasFlash && (
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFlash}
            className={cn(
              "w-16 h-16 rounded-full border-2 transition-all",
              isFlashOn ? "bg-primary border-primary text-white" : "bg-white/5 border-white/10 text-white"
            )}
          >
            {isFlashOn ? <ZapOff className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
          </Button>
        )}

        {cameras.length > 1 && (
          <Button
            variant="outline"
            size="icon"
            onClick={switchCamera}
            className="w-16 h-16 rounded-full border-2 bg-white/5 border-white/10 text-white active:rotate-180 transition-transform duration-500"
          >
            <RefreshCcw className="w-6 h-6" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default QrScanner;

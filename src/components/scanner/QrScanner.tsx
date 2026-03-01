'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure: (error: unknown) => void;
  onCameraPermissionError: (error: Error) => void;
  onStatusChange?: (status: string) => void;
  isAutoScan?: boolean;
  activeCameraId?: string;
  isCapturing?: boolean;
}

const qrcodeRegionId = 'html5qr-code-full-region';

const QrScanner = ({ 
  onScanSuccess, 
  onScanFailure, 
  onCameraPermissionError, 
  onStatusChange,
  isAutoScan = false,
  activeCameraId,
  isCapturing = false
}: QrScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMounted = useRef(true);
  const [isReady, setIsReady] = useState(false);
  const lastHintRef = useRef<string>('');
  const [initError, setInitError] = useState<string | null>(null);

  const updateHint = useCallback((hint: string) => {
    if (hint !== lastHintRef.current) {
      lastHintRef.current = hint;
      onStatusChange?.(hint);
    }
  }, [onStatusChange]);

  const startScanner = useCallback(async (cameraId: string) => {
    if (!isMounted.current || !scannerRef.current) return;
    
    try {
      const state = scannerRef.current.getState();
      if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
        await scannerRef.current.stop();
      }

      // Brief delay to allow hardware to release
      await new Promise(resolve => setTimeout(resolve, 200));

      if (!isMounted.current) return;

      await scannerRef.current.start(
        cameraId,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const width = Math.max(Math.floor(viewfinderWidth * 0.8), 50);
            const height = Math.max(Math.floor(width * 0.7), 50);
            return { width, height };
          },
          aspectRatio: 1.0,
        },
        (decodedText: string) => {
          if (isAutoScan || isCapturing) {
            if (window.navigator.vibrate) window.navigator.vibrate([50, 30, 50]);
            onScanSuccess(decodedText);
          }
        },
        (error) => {
          const errorStr = String(error);
          if (errorStr.includes('NotFoundException')) {
            updateHint('hintAlign');
          } else {
            onScanFailure(error);
          }
        }
      );
      setIsReady(true);
      setInitError(null);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Cannot stop')) {
        return;
      }
      const message = err instanceof Error ? err.message : 'Camera initialization failed';
      onCameraPermissionError(new Error(message));
    }
  }, [isAutoScan, isCapturing, onScanSuccess, onScanFailure, onCameraPermissionError, updateHint]);

  useEffect(() => {
    isMounted.current = true;

    // Check for Secure Context (required for camera)
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      onCameraPermissionError(new Error('Camera requires a secure (HTTPS) connection.'));
      return;
    }

    const html5Qrcode = new Html5Qrcode(qrcodeRegionId, {
      verbose: false,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
      ],
    });
    scannerRef.current = html5Qrcode;

    const initialize = async () => {
      try {
        if (activeCameraId) {
          await startScanner(activeCameraId);
        } else {
          const cameras = await Html5Qrcode.getCameras();
          if (cameras && cameras.length > 0) {
            // Prefer back camera
            const backCamera = cameras.find(c => 
              c.label.toLowerCase().includes('back') || 
              c.label.toLowerCase().includes('rear') ||
              c.label.toLowerCase().includes('environment')
            );
            await startScanner(backCamera?.id || cameras[0].id);
          } else {
            throw new Error('No cameras found on this device.');
          }
        }
      } catch (err) {
        if (isMounted.current) {
          const error = err instanceof Error ? err : new Error('Failed to access camera list');
          onCameraPermissionError(error);
        }
      }
    };

    initialize();

    return () => {
      isMounted.current = false;
      if (scannerRef.current) {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          scannerRef.current.stop().catch(() => {});
        }
      }
    };
  }, [activeCameraId, startScanner, onCameraPermissionError]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <div 
        id={qrcodeRegionId} 
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          isReady ? "opacity-100" : "opacity-0",
          isCapturing && "brightness-125 contrast-125"
        )}
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <Skeleton className="w-full h-full bg-neutral-900" />
          <div className="absolute flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-neutral-500 font-medium">Initializing Camera...</p>
          </div>
        </div>
      )}
      
      {/* Dynamic Scan Frame */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className={cn(
          "w-[75vw] aspect-[1.2/1] rounded-3xl border-2 transition-all duration-500",
          isReady ? "opacity-100 scale-100" : "opacity-0 scale-110",
          isCapturing ? "border-white scale-95" : "border-primary/40 scan-frame-pulse"
        )}>
          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-2xl -translate-x-1 -translate-y-1" />
          <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-2xl translate-x-1 -translate-y-1" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-2xl -translate-x-1 translate-y-1" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-2xl translate-x-1 translate-y-1" />
        </div>
      </div>

      {/* Capture Flash Overlay */}
      {isCapturing && <div className="absolute inset-0 bg-white/40 flash-capture z-50 pointer-events-none" />}
    </div>
  );
};

export default QrScanner;
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
  const isStarting = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const lastHintRef = useRef<string>('');
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use a ref for the success callback to prevent re-initialization of hardware
  // when the parent component's state changes (like isCapturing toggling).
  const onScanSuccessRef = useRef(onScanSuccess);
  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  const updateHint = useCallback((hint: string) => {
    if (hint !== lastHintRef.current) {
      lastHintRef.current = hint;
      onStatusChange?.(hint);

      // Auto-hide hint after 2 seconds
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = setTimeout(() => {
        if (isMounted.current) {
          lastHintRef.current = '';
          onStatusChange?.('');
        }
      }, 2000);
    }
  }, [onStatusChange]);

  const startScanner = useCallback(async (cameraId: string) => {
    if (!isMounted.current || !scannerRef.current || isStarting.current) return;
    
    const container = document.getElementById(qrcodeRegionId);
    if (!container) return;

    isStarting.current = true;
    try {
      const state = scannerRef.current.getState();
      
      // If we are already scanning this exact camera, don't restart it
      if (state === Html5QrcodeScannerState.SCANNING && activeCameraId === cameraId) {
        setIsReady(true);
        isStarting.current = false;
        return;
      }

      // If scanner is busy, stop it first
      if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
        try {
          await scannerRef.current.stop();
        } catch (stopError) {
          // Non-critical error during stop
        }
      }

      // Give hardware a moment to settle
      await new Promise(resolve => setTimeout(resolve, 400));

      if (!isMounted.current) {
        isStarting.current = false;
        return;
      }

      await scannerRef.current.start(
        cameraId,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const size = Math.min(viewfinderWidth, viewfinderHeight);
            const boxSize = Math.max(Math.floor(size * 0.7), 200); 
            return { width: boxSize, height: Math.floor(boxSize * 0.75) };
          },
          aspectRatio: 1.0,
        },
        (decodedText: string) => {
          // Use the ref-based callback so we don't need to restart the scanner
          // if the parent's logic changes
          onScanSuccessRef.current(decodedText);
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
    } catch (err) {
      // Ignore "Cannot clear while scan is ongoing" and "Cannot stop" errors 
      // as they are usually race conditions that resolve themselves
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Cannot clear') || errorMessage.includes('Cannot stop')) {
        isStarting.current = false;
        return;
      }

      onCameraPermissionError(new Error(errorMessage));
    } finally {
      isStarting.current = false;
    }
  }, [onScanFailure, onCameraPermissionError, updateHint, activeCameraId]);

  useEffect(() => {
    isMounted.current = true;

    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      onCameraPermissionError(new Error('Camera requires HTTPS.'));
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
        await new Promise(r => setTimeout(r, 500));
        if (!isMounted.current) return;

        if (activeCameraId) {
          await startScanner(activeCameraId);
        } else {
          const cameras = await Html5Qrcode.getCameras();
          if (cameras && cameras.length > 0) {
            const backCamera = cameras.find(c => 
              c.label.toLowerCase().includes('back') || 
              c.label.toLowerCase().includes('rear') ||
              c.label.toLowerCase().includes('environment')
            );
            await startScanner(backCamera?.id || cameras[0].id);
          } else {
            throw new Error('No cameras found.');
          }
        }
      } catch (err) {
        if (isMounted.current) {
          const error = err instanceof Error ? err : new Error('Camera access failed');
          onCameraPermissionError(error);
        }
      }
    };

    initialize();

    return () => {
      isMounted.current = false;
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
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
          isReady ? "opacity-100" : "opacity-0"
        )}
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <Skeleton className="w-full h-full bg-neutral-900" />
          <div className="absolute flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-xs text-neutral-500 font-medium">Starting Camera...</p>
          </div>
        </div>
      )}
      
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className={cn(
          "w-[70vw] aspect-[1.3/1] rounded-2xl border-2 transition-all duration-300",
          isReady ? "opacity-80 scale-100" : "opacity-0 scale-110",
          isCapturing ? "border-white scale-95" : "border-white/30 scan-frame-pulse"
        )} />
      </div>

      {isCapturing && <div className="absolute inset-0 bg-white/50 flash-capture z-50 pointer-events-none" />}
    </div>
  );
};

export default QrScanner;
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
  activeCameraId,
  isCapturing = false
}: QrScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMounted = useRef(true);
  const [isReady, setIsReady] = useState(false);
  const lastHintRef = useRef<string>('');
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Serializes all scanner operations to prevent state transition errors
  const transitionLock = useRef<Promise<void>>(Promise.resolve());

  // Use a ref for the success callback to avoid scanner re-initialization 
  const onScanSuccessRef = useRef(onScanSuccess);
  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  const updateHint = useCallback((hint: string) => {
    if (hint !== lastHintRef.current) {
      lastHintRef.current = hint;
      onStatusChange?.(hint);

      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = setTimeout(() => {
        if (isMounted.current) {
          lastHintRef.current = '';
          onStatusChange?.('');
        }
      }, 2000);
    }
  }, [onStatusChange]);

  const stopScannerSafe = async () => {
    if (!scannerRef.current) return;
    try {
      const state = scannerRef.current.getState();
      
      // ONLY stop if it's actually running or paused. 
      if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
        await scannerRef.current.stop();
        // Hardware settle delay
        await new Promise(r => setTimeout(r, 600));
      }
      
      // Cleanup DOM ONLY if still attached and we're mounted
      if (isMounted.current && document.getElementById(qrcodeRegionId)) {
        await scannerRef.current.clear();
      }
    } catch (e) {
      const errStr = String(e);
      // Suppress benign state errors
      if (!errStr.includes('not running') && !errStr.includes('transition') && !errStr.includes('play()')) {
        console.warn('Non-benign scanner cleanup error:', e);
      }
    }
  };

  const executeAction = (action: () => Promise<void>) => {
    transitionLock.current = transitionLock.current.then(async () => {
      if (!isMounted.current) return;
      try {
        await action();
      } catch (err) {
        const errorMessage = String(err);
        // Suppress interruptions to prevent Runtime Error overlays
        if (
          errorMessage.includes('play()') || 
          errorMessage.includes('interrupted') || 
          errorMessage.includes('AbortError') ||
          errorMessage.includes('removed from the document')
        ) {
           return;
        }
        console.warn('Scanner transition failed:', err);
      }
    });
  };

  const startScannerInternal = async (cameraId: string) => {
    if (!isMounted.current || !scannerRef.current) return;
    
    const container = document.getElementById(qrcodeRegionId);
    if (!container) return;

    // Ensure previous instances are fully dead before starting new ones
    await stopScannerSafe();
    
    if (!isMounted.current || !document.getElementById(qrcodeRegionId)) return;

    try {
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
      
      if (isMounted.current) {
        setIsReady(true);
      }
    } catch (err) {
      const errorMessage = String(err);
      if (
        isMounted.current && 
        !errorMessage.includes('transition') && 
        !errorMessage.includes('play()') && 
        !errorMessage.includes('AbortError') &&
        !errorMessage.includes('removed from the document')
      ) {
        onCameraPermissionError(err instanceof Error ? err : new Error(errorMessage));
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;

    if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost') {
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
      // Safety delay to avoid race conditions with React's initial mount
      await new Promise(r => setTimeout(r, 800));
      if (!isMounted.current) return;

      executeAction(async () => {
        try {
          if (activeCameraId) {
            await startScannerInternal(activeCameraId);
          } else {
            const cameras = await Html5Qrcode.getCameras();
            if (cameras && cameras.length > 0) {
              const backCamera = cameras.find(c => 
                c.label.toLowerCase().includes('back') || 
                c.label.toLowerCase().includes('rear') ||
                c.label.toLowerCase().includes('environment')
              );
              await startScannerInternal(backCamera?.id || cameras[0].id);
            } else {
              throw new Error('No cameras found.');
            }
          }
        } catch (err) {
          if (isMounted.current) {
            onCameraPermissionError(err instanceof Error ? err : new Error('Camera access failed'));
          }
        }
      });
    };

    initialize();

    return () => {
      isMounted.current = false;
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
      
      // Synchronize cleanup to ensure no orphaned transitions survive
      executeAction(async () => {
        await stopScannerSafe();
      });
    };
  }, [activeCameraId, onCameraPermissionError]);

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
          "w-[70vw] aspect-[1.3/1] rounded-2xl border-2 transition-all duration-300 relative overflow-hidden",
          isReady ? "opacity-80 scale-100" : "opacity-0 scale-110",
          isCapturing ? "border-white scale-95" : "border-white/30 scan-frame-pulse"
        )}>
           {isReady && !isCapturing && <div className="scanner-line" />}
        </div>
      </div>

      {isCapturing && <div className="absolute inset-0 bg-white/50 flash-capture z-50 pointer-events-none" />}
    </div>
  );
};

export default QrScanner;
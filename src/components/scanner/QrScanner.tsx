'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeSupportedFormats, type DecodedTextResult } from 'html5-qrcode';
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

  const updateHint = useCallback((hint: string) => {
    if (hint !== lastHintRef.current) {
      lastHintRef.current = hint;
      onStatusChange?.(hint);
    }
  }, [onStatusChange]);

  const startScanner = useCallback(async (cameraId: string) => {
    if (!isMounted.current || !scannerRef.current) return;
    
    try {
      if (scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
        await scannerRef.current.stop();
      }

      await scannerRef.current.start(
        cameraId,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            // Safety check: html5-qrcode requires a minimum of 50px.
            // If the viewfinder is too small or 0 during initial load, we return the minimum.
            if (viewfinderWidth < 50 || viewfinderHeight < 50) {
              return { width: 50, height: 50 };
            }
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxWidth = Math.max(Math.floor(minEdge * 0.85), 50);
            const qrboxHeight = Math.max(Math.floor(qrboxWidth * 0.7), 50);
            return { width: qrboxWidth, height: qrboxHeight };
          },
          aspectRatio: 16/9,
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
    } catch (err) {
      // Safely ignore "Cannot stop" errors during unmounting or state transitions
      if (err instanceof Error && err.message.includes('Cannot stop')) {
        return;
      }
      onCameraPermissionError(err instanceof Error ? err : new Error('Unknown camera error'));
    }
  }, [isAutoScan, isCapturing, onScanSuccess, onScanFailure, onCameraPermissionError, updateHint]);

  useEffect(() => {
    isMounted.current = true;
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

    if (activeCameraId) {
      startScanner(activeCameraId);
    } else {
      Html5Qrcode.getCameras().then(cameras => {
        if (cameras && cameras.length) {
          const backCamera = cameras.find(c => c.label.toLowerCase().includes('back'));
          startScanner(backCamera?.id || cameras[0].id);
        }
      }).catch(err => {
        // Silently handle error if component unmounted while fetching cameras
        if (isMounted.current) onCameraPermissionError(err);
      });
    }

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
          "w-full h-full object-cover transition-opacity duration-300",
          isReady ? "opacity-100" : "opacity-0",
          isCapturing && "brightness-150 contrast-125 grayscale"
        )}
      />
      {!isReady && <Skeleton className="absolute inset-0 w-full h-full bg-black" />}
      
      {/* Dynamic Scan Frame */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className={cn(
          "w-[80vw] aspect-[1.4/1] rounded-3xl border-2 transition-all duration-300",
          isReady ? "opacity-100 scale-100" : "opacity-0 scale-110",
          isCapturing ? "border-white scale-95" : "border-primary/40 scan-frame-pulse"
        )}>
          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl -translate-x-1 -translate-y-1" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl translate-x-1 -translate-y-1" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl -translate-x-1 translate-y-1" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl translate-x-1 translate-y-1" />
        </div>
      </div>

      {/* Capture Flash Overlay */}
      {isCapturing && <div className="absolute inset-0 bg-white flash-capture z-50" />}
    </div>
  );
};

export default QrScanner;
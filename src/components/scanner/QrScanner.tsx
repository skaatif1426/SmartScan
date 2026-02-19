'use client';

import { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeSupportedFormats, type DecodedTextResult } from 'html5-qrcode';
import { Skeleton } from '@/components/ui/skeleton';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure: (error: unknown) => void;
  onCameraPermissionError: (error: Error) => void;
}

const qrcodeRegionId = 'html5qr-code-full-region';

const QrScanner = ({ onScanSuccess, onScanFailure, onCameraPermissionError }: QrScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    if (scannerRef.current) {
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

    const startScanner = async () => {
      if (!isMounted.current) return;
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length) {
            const cameraId = cameras.find(c => c.label.toLowerCase().includes('back'))?.id || cameras[0].id;
            
            if (!isMounted.current || scannerRef.current?.getState() === Html5QrcodeScannerState.SCANNING) {
                return;
            }

            await scannerRef.current?.start(
              cameraId,
              {
                fps: 10,
                qrbox: (viewfinderWidth, viewfinderHeight) => {
                    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                    const qrboxWidth = Math.floor(minEdge * 0.9);
                    return { width: qrboxWidth, height: qrboxWidth / 2 };
                },
                aspectRatio: 16/9,
              },
              (decodedText: string, decodedResult: DecodedTextResult) => onScanSuccess(decodedText),
              onScanFailure
            );
        } else {
            onCameraPermissionError(new Error('No cameras found.'));
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
            onCameraPermissionError(err);
        } else {
            onCameraPermissionError(new Error('Unknown camera error'));
        }
      }
    };

    startScanner();

    return () => {
      isMounted.current = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
      }
    };
  }, [onScanSuccess, onScanFailure, onCameraPermissionError]);

  return <div id={qrcodeRegionId} className="w-full h-auto aspect-video rounded-2xl overflow-hidden border bg-muted" >
    <Skeleton className="w-full h-full" />
  </div>;
};

export default QrScanner;

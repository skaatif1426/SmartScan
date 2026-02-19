'use client';

import { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Skeleton } from '@/components/ui/skeleton';

interface QrScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanFailure: (error: any) => void;
  onCameraPermissionError: (error: string) => void;
}

const qrcodeRegionId = 'html5qr-code-full-region';

const QrScanner = ({ onScanSuccess, onScanFailure, onCameraPermissionError }: QrScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (scannerRef.current) {
        return;
    }

    const html5Qrcode = new Html5Qrcode(qrcodeRegionId);
    scannerRef.current = html5Qrcode;

    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length) {
            const cameraId = cameras.find(c => c.label.toLowerCase().includes('back'))?.id || cameras[0].id;

            if (scannerRef.current?.getState() === Html5QrcodeScannerState.SCANNING) {
                return;
            }

            await scannerRef.current?.start(
              cameraId,
              {
                fps: 10,
                qrbox: (viewfinderWidth, viewfinderHeight) => {
                    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                    const qrboxSize = Math.floor(minEdge * 0.8);
                    return { width: qrboxSize, height: qrboxSize / 2 };
                },
                aspectRatio: 1.0,
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.UPC_A,
                    Html5QrcodeSupportedFormats.UPC_E,
                ],
              },
              onScanSuccess,
              onScanFailure
            );
        } else {
            onCameraPermissionError('No cameras found.');
        }
      } catch (err: any) {
        if (err.name === 'NotAllowedError') {
            onCameraPermissionError('PermissionDenied');
        } else {
            onCameraPermissionError(err.message || 'Unknown camera error');
        }
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
      }
    };
  }, [onScanSuccess, onScanFailure, onCameraPermissionError]);

  return <div id={qrcodeRegionId} className="w-full h-auto aspect-square rounded-2xl overflow-hidden border bg-muted" >
    <Skeleton className="w-full h-full" />
  </div>;
};

export default QrScanner;

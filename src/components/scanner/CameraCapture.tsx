'use client';

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/AppProviders";
import { X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (imageDataUri: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      // STRICT RULE: Use environment facing mode for rear camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // STRICT RULE: Handle play state on metadata load
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play();
            setIsActive(true);
          } catch (e) {
            // Mobile Safari fallback
            setTimeout(() => {
              videoRef.current?.play().catch(() => {});
            }, 300);
          }
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    // STRICT RULE: Only stop tracks, don't rely on state
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !isActive) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/png");
    
    // Stop camera before passing data up to avoid media removal issues during transition
    stopCamera();
    onCapture(image);
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[300]">
      {/* Viewfinder container stays mounted while stream opens */}
      <div className="relative w-full h-[75vh] bg-neutral-900 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Scanner Overlay UI */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[70vw] aspect-[1.3/1] rounded-2xl border-2 border-white/30 relative">
                <div className="scanner-line" />
            </div>
        </div>
      </div>

      <div className="flex-1 w-full bg-background/5 p-6 flex items-center justify-around gap-4">
        <Button
            variant="outline"
            size="icon"
            onClick={() => {
                stopCamera();
                onClose();
            }}
            className="w-16 h-16 rounded-full border-2 bg-white/10 text-white"
        >
            <X className="w-8 h-8" />
        </Button>

        <Button
          onClick={capturePhoto}
          className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl active:scale-90 transition-all p-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center">
            <Camera className="w-8 h-8" />
          </div>
        </Button>
        
        <div className="w-16" /> {/* Spacer for centering the capture button */}
      </div>
    </div>
  );
}

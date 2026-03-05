'use client';

import { useEffect, useRef, useState } from "react";
import { X, Camera, RefreshCcw, Zap, ZapOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CameraCaptureProps {
  onCapture: (imageDataUri: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async (mode: "environment" | "user") => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => setIsActive(true)).catch(console.error);
          
          // Check for torch/flash
          const track = stream.getVideoTracks()[0];
          const capabilities = track.getCapabilities() as any;
          setHasFlash(!!capabilities.torch);
        };
      }
    } catch (err) {
      console.error("Camera access failed", err);
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const switchCamera = () => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    setIsFlashOn(false);
    startCamera(newMode);
  };

  const toggleFlash = async () => {
    if (!streamRef.current || !hasFlash) return;
    const track = streamRef.current.getVideoTracks()[0];
    const newState = !isFlashOn;
    try {
      await track.applyConstraints({
        advanced: [{ torch: newState }]
      } as any);
      setIsFlashOn(newState);
    } catch (e) {
      console.error("Flash error", e);
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
    const image = canvas.toDataURL("image/jpeg", 0.8);
    
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    onCapture(image);
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[300]">
      <div className="relative w-full h-[75vh] bg-neutral-900 overflow-hidden">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        
        {/* Close Button */}
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 rounded-full bg-black/20 border-white/10 text-white backdrop-blur-xl"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Viewfinder Frame */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[80vw] aspect-[1/1] rounded-3xl border-2 border-white/20" />
        </div>
      </div>

      <div className="flex-1 w-full bg-black p-8 flex items-center justify-around">
        <Button
          variant="outline"
          size="icon"
          onClick={switchCamera}
          className="w-14 h-14 rounded-full border-2 bg-white/5 border-white/10 text-white"
        >
          <RefreshCcw className="w-6 h-6" />
        </Button>

        <Button
          onClick={capturePhoto}
          className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl active:scale-90 transition-all p-0 flex items-center justify-center border-[6px] border-white/20"
        >
          <Camera className="w-8 h-8" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          disabled={!hasFlash}
          onClick={toggleFlash}
          className={cn(
            "w-14 h-14 rounded-full border-2 transition-all",
            isFlashOn ? "bg-yellow-500 border-yellow-500 text-black" : "bg-white/5 border-white/10 text-white opacity-50",
            hasFlash && "opacity-100"
          )}
        >
          {isFlashOn ? <ZapOff className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
        </Button>
      </div>
    </div>
  );
}

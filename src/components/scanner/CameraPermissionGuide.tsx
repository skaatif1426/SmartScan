'use client';

import { CameraOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/AppProviders';

interface CameraPermissionGuideProps {
  error: Error | null;
  onRetry: () => void;
}

export function CameraPermissionGuide({ error, onRetry }: CameraPermissionGuideProps) {
  const { t } = useLanguage();
  let description = t('cameraPermissionErrorDescription');
  
  if (error?.name === 'NotAllowedError') {
    description = 'Camera access was denied. Please enable it in your browser settings and try again.';
  } else if (error?.name === 'NotFoundError') {
    description = 'No camera was found on your device. Please connect a camera and try again.';
  }

  return (
    <Alert variant="destructive" className="text-center">
      <CameraOff className="h-4 w-4" />
      <AlertTitle>{t('cameraPermissionErrorTitle')}</AlertTitle>
      <AlertDescription className="mb-4">
        {description}
      </AlertDescription>
      <Button onClick={onRetry} variant="destructive">
        {t('retry')}
      </Button>
    </Alert>
  );
}

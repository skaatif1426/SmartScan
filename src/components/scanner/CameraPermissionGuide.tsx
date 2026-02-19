'use client';

import { CameraOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';

interface CameraPermissionGuideProps {
  errorType: string;
  onRetry: () => void;
}

export function CameraPermissionGuide({ errorType, onRetry }: CameraPermissionGuideProps) {
  const { t } = useSettings();
  return (
    <Alert variant="destructive" className="text-center">
      <CameraOff className="h-4 w-4" />
      <AlertTitle>{t('cameraPermissionErrorTitle')}</AlertTitle>
      <AlertDescription className="mb-4">
        {t('cameraPermissionErrorDescription')}
      </AlertDescription>
      <Button onClick={onRetry} variant="destructive">
        {t('retry')}
      </Button>
    </Alert>
  );
}

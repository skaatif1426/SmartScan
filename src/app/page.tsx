'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dynamic from 'next/dynamic';
import { CameraOff, ScanLine, FileImage, Loader2, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { CameraPermissionGuide } from '@/components/scanner/CameraPermissionGuide';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/AppProviders';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Html5Qrcode } from 'html5-qrcode';


const QrScanner = dynamic(() => import('@/components/scanner/QrScanner'), {
  loading: () => <Skeleton className="w-full h-auto aspect-video rounded-2xl" />,
  ssr: false,
});

const formSchema = z.object({
  barcode: z.string().regex(/^[0-9]+$/, 'Barcode must be numeric.'),
});

export default function ScannerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showScanner, setShowScanner] = useState(false);
  const [cameraError, setCameraError] = useState<Error | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();
  const { trackError } = useAnalytics();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      barcode: '',
    },
  });

  const handleScanSuccess = useCallback((decodedText: string) => {
    setShowScanner(false);
    router.push(`/product/${decodedText}`);
  }, [router]);

  const handleScanFailure = useCallback((error: unknown) => {
    if (error instanceof Error && error.name === 'NotFoundException') {
        return;
    }
    trackError();
    console.error('Scan Error:', error);
  }, [trackError]);
  
  const handleCameraPermission = useCallback((error: Error) => {
    trackError();
    setCameraError(error);
    setShowScanner(false);
  }, [trackError]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    setIsUploading(true);

    try {
      const html5QrCode = new Html5Qrcode('reader', false);
      const decodedText = await html5QrCode.scanFile(file, false);
      handleScanSuccess(decodedText);
    } catch (err: unknown) {
      trackError();
      const isNotFound = err instanceof Error && (err.name === 'NotFoundException' || err.message.includes('No MultiFormat Readers'));
      
      if (!isNotFound) {
        console.error('File Scan Error:', err);
      }
      
      toast({
        variant: 'destructive',
        title: t('scanErrorTitle'),
        description: isNotFound ? t('noBarcodeInImage') : t('uploadError'),
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    router.push(`/product/${values.barcode}`);
  }

  const isLoading = isUploading || isSubmitting;

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 md:p-6">
      <div id="reader" style={{ display: 'none' }}></div>
      <Card className="w-full max-w-md shadow-lg bg-card/80 backdrop-blur-xl animate-in zoom-in-95 duration-500 ease-out">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-2xl text-center">
            <ScanLine className="w-8 h-8 text-primary" />
            {t('scannerTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {cameraError ? (
            <CameraPermissionGuide error={cameraError} onRetry={() => { setCameraError(null); setShowScanner(true); }} />
          ) : showScanner ? (
            <div className='space-y-4'>
              <QrScanner
                onScanSuccess={handleScanSuccess}
                onScanFailure={handleScanFailure}
                onCameraPermissionError={handleCameraPermission}
              />
              <Button variant="outline" className="w-full rounded-full" onClick={() => setShowScanner(false)} disabled={isLoading}>
                <CameraOff className="w-4 h-4 mr-2" />
                {t('stopScanning')}
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">{t('scannerPrompt')}</p>
              <Button size="lg" className="w-full rounded-full" onClick={() => setShowScanner(true)} disabled={isLoading}>
                <ScanLine className="w-5 h-5 mr-2" />
                {t('startScanning')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <FileImage className="w-5 h-5 mr-2" />
                )}
                {isUploading ? t('uploading') : t('uploadImage')}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card/80 px-2 text-muted-foreground">{t('or')}</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder={t('manualBarcodePlaceholder')}
                        {...field}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="bg-background/80"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full rounded-full" disabled={isLoading || !form.formState.isValid}>
                 {isSubmitting ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                   <Send className="w-5 h-5 mr-2" />
                )}
                {isSubmitting ? 'Searching...' : t('searchProduct')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

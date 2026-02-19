'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
          <div className="text-center space-y-4 max-w-md">
            <AlertCircle className="w-16 h-16 mx-auto text-destructive" />
            <h1 className="text-2xl font-bold">Application Error</h1>
            <p className="text-muted-foreground">
              A critical error has occurred in the application that we couldn't recover from.
            </p>
            <Button onClick={() => reset()}>
              Try to reload
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}

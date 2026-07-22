'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to console so it's visible in Vercel's function logs
    console.error('[ErrorBoundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6">
        <div className="rounded-full bg-destructive/10 p-4 inline-flex mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground max-w-sm mb-1">
          An unexpected error occurred. Your work is auto-saved — you can try
          again or return to the dashboard.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 font-mono mt-2">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Dashboard
          </Link>
        </Button>
        <Button onClick={reset} className="gap-1.5">
          <RotateCw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}

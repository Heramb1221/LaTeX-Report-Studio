import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmailContent } from '@/components/auth/VerifyEmailContent';

export const metadata: Metadata = {
  title: 'Verify Email',
};

export default function VerifyEmailPage() {
  return (
    // VerifyEmailContent uses useSearchParams() which requires Suspense
    // in Next.js 15 to avoid opting the whole route into client rendering.
    <Suspense
      fallback={
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          Verifying your email...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

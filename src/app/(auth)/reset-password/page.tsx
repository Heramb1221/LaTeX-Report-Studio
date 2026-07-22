import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password',
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

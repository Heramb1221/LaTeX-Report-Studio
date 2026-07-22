'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type Status = 'loading' | 'success' | 'error' | 'missing';

interface StatusConfig {
  title: string;
  description: string;
  footer: React.ReactNode;
}

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<Status>(token ? 'loading' : 'missing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (cancelled) return;
        const json = await res.json() as { error?: string; message?: string };
        if (json.error) {
          setErrorMessage(json.error);
          setStatus('error');
        } else {
          setStatus('success');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage('Could not connect to the server. Please try again.');
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const CONFIG: Record<Status, StatusConfig> = {
    loading: {
      title: 'Verifying your email…',
      description: 'This will only take a moment.',
      footer: null,
    },
    success: {
      title: 'Email verified ✅',
      description: 'Your account is active. You can now log in.',
      footer: (
        <Link
          href="/login"
          className="text-sm font-medium text-foreground hover:underline"
        >
          Go to login →
        </Link>
      ),
    },
    error: {
      title: 'Verification failed',
      description: errorMessage,
      footer: (
        <Link
          href="/register"
          className="text-sm font-medium text-foreground hover:underline"
        >
          Register again →
        </Link>
      ),
    },
    missing: {
      title: 'No token found',
      description:
        'This link is missing its verification token. Check your email for the correct link.',
      footer: (
        <Link
          href="/register"
          className="text-sm font-medium text-foreground hover:underline"
        >
          Register →
        </Link>
      ),
    },
  };

  const { title, description, footer } = CONFIG[status];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}

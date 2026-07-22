'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const containerVariants: import("framer-motion").Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // ── Missing token ──────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="w-full text-center space-y-6">
        <h1 className="text-3xl font-serif font-semibold tracking-tight">Invalid link</h1>
        <p className="text-sm text-muted-foreground">
          This reset link is missing the required token. Please request a new one.
        </p>
        <div className="pt-4">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-foreground hover:underline transition-colors"
          >
            Request a new reset link →
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // confirmPassword is a UI-only field — don't send it to the API
        body: JSON.stringify({ token, password: data.password }),
      });

      const json = await res.json() as { error?: string };

      if (!res.ok) {
        toast({
          variant: 'destructive',
          title: 'Reset failed',
          description: json.error ?? 'Something went wrong. Please try again.',
        });
        return;
      }

      setSuccess(true);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Network error',
        description: 'Could not reach the server. Check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center space-y-4 text-center"
          >
            <div className="rounded-full bg-primary/10 p-4 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-primary"
              >
                <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                <path d="m16 19 2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif font-semibold">Password reset ✅</h1>
            <p className="text-sm text-muted-foreground max-w-sm">
              Your password has been updated. You can now log in with your new
              password.
            </p>
            <div className="pt-4">
              <Link
                href="/login"
                className="text-sm font-medium text-foreground hover:underline transition-colors"
              >
                Go to login →
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full"
          >
            <div className="flex flex-col space-y-2 text-center mb-6">
              <h1 className="text-3xl font-serif font-semibold tracking-tight">Reset password</h1>
              <p className="text-sm text-muted-foreground">
                Choose a strong new password for your account.
              </p>
            </div>

            <motion.form
              variants={containerVariants}
              initial="hidden"
              animate="show"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-4"
            >
              {/* New password */}
              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="bg-transparent border-t-0 border-x-0 border-b-2 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary transition-colors"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </motion.div>

              {/* Confirm password */}
              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="bg-transparent border-t-0 border-x-0 border-b-2 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary transition-colors"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </motion.div>

              <motion.div variants={itemVariants} className="pt-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
                    {isLoading ? 'Resetting…' : 'Reset password'}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

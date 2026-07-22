'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
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

export function RegisterForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json() as { error?: string };

      if (!res.ok) {
        if (json.error?.toLowerCase().includes('already exists')) {
          setError('email', { type: 'server', message: json.error });
        } else {
          toast({
            variant: 'destructive',
            title: 'Registration failed',
            description: json.error ?? 'Something went wrong. Please try again.',
          });
        }
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
            <h1 className="text-2xl font-serif font-semibold">Check your email</h1>
            <p className="text-sm text-muted-foreground max-w-sm">
              We&apos;ve sent a verification link to your inbox. Click it to
              activate your account. The link expires in 24 hours.
            </p>
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                Already verified?{' '}
                <Link
                  href="/login"
                  className="font-medium text-foreground hover:underline transition-colors"
                >
                  Log in
                </Link>
              </p>
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
              <h1 className="text-3xl font-serif font-semibold tracking-tight">Create an account</h1>
              <p className="text-sm text-muted-foreground">
                Start writing better engineering reports today.
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
              {/* Email */}
              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  className="bg-transparent border-t-0 border-x-0 border-b-2 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary transition-colors"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
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
                <p className="text-xs text-muted-foreground pt-1">
                  At least 8 characters, one uppercase letter, and one number.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-4 flex flex-col gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
                    {isLoading ? 'Creating account…' : 'Create account'}
                  </Button>
                </motion.div>
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-foreground hover:underline transition-colors"
                  >
                    Log in
                  </Link>
                </p>
              </motion.div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

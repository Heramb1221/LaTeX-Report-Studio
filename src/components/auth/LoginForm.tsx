'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
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

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json() as { error?: string };

      if (!res.ok) {
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: json.error ?? 'Something went wrong. Please try again.',
        });
        return;
      }

      // Refresh server-side auth state, then navigate to dashboard
      router.refresh();
      router.push('/dashboard');
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
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-3xl font-serif font-semibold tracking-tight">Log in</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password to continue.
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            disabled={isLoading}
            className="bg-transparent border-t-0 border-x-0 border-b-2 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary transition-colors"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="pt-4 flex flex-col gap-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
              {isLoading ? 'Logging in…' : 'Log in'}
            </Button>
          </motion.div>
          <p className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-foreground hover:underline transition-colors"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </motion.form>
    </div>
  );
}

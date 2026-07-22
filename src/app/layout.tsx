

// NOTE: This file replaces the default app/layout.tsx created by create-next-app.
// The 'use client' directive is on the providers wrapper (see below), not here.
// This file itself is a Server Component.

import type { Metadata } from 'next';
import { Inter, Roboto_Mono, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'LaTeX Report Studio',
    template: '%s — LaTeX Report Studio',
  },
  description:
    'The unified engineering report workspace. Write, humanize, diagram, cite, and compile — all in one place.',
  keywords: ['LaTeX', 'engineering report', 'IEEE', 'technical writing', 'diagram'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-mono", jetbrainsMono.variable)}>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

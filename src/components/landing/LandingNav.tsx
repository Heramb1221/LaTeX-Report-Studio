'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
        scrolled
          ? 'bg-background/95 backdrop-blur border-b shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity">
          <FileText className="h-5 w-5 text-primary" />
          <span className="text-sm">LaTeX Report Studio</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a
              href="https://github.com/Heramb1221/latex-report-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="gap-1.5"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Get Started Free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

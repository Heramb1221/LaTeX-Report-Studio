import Link from 'next/link';
import { FileText, Github } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4 text-primary" />
            LaTeX Report Studio
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link href="/register" className="hover:text-foreground transition-colors">
              Sign up
            </Link>
            <a
              href="https://github.com/Heramb1221/latex-report-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Github className="h-3.5 w-3.5" />
              GitHub
            </a>
            <a
              href="https://github.com/Heramb1221/latex-report-studio/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              MIT License
            </a>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} LaTeX Report Studio. Open-source and free.
          </p>
        </div>
      </div>
    </footer>
  );
}

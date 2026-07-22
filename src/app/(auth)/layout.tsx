import Link from 'next/link';
import { AuthBranding } from '@/components/auth/AuthBranding';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <AuthBranding />
      
      <div className="lg:p-8 p-4 h-full flex items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {/* Mobile brand header (hidden on large screens) */}
          <div className="flex flex-col space-y-2 text-center lg:hidden mb-4">
            <Link href="/" className="inline-block group">
              <h1 className="text-2xl font-bold tracking-tight group-hover:opacity-80 transition-opacity font-serif">
                LaTeX Report Studio
              </h1>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              The Engineering Report Workspace
            </p>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}

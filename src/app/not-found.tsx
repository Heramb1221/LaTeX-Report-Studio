import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6">
        <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <h1 className="text-6xl font-bold text-muted-foreground/30 mb-2">404</h1>
        <h2 className="text-xl font-semibold mb-2">Page not found</h2>
        <p className="text-muted-foreground max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist, or may have been
          moved. Check the URL or head back to the dashboard.
        </p>
      </div>

      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Home
          </Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

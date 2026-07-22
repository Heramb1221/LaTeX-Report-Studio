import { MainNavbar } from '@/components/layout/MainNavbar';

// This layout wraps /dashboard, /settings, and any other
// authenticated non-editor pages.
// The editor gets its own layout in Phase 4.

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

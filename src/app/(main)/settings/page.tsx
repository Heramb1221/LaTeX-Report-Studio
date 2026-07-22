import type { Metadata } from 'next';
import { ApiKeyForm } from '@/components/settings/ApiKeyForm';

// REPLACES the placeholder src/app/(main)/settings/page.tsx from Phase 3.

export const metadata: Metadata = {
  title: 'Settings',
};

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and AI integration preferences.
        </p>
      </div>

      <div className="space-y-6">
        <ApiKeyForm />
      </div>
    </div>
  );
}

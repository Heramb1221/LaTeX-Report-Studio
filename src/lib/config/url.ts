/**
 * Helper to get the canonical base URL for the application.
 * Priority:
 * 1. NEXT_PUBLIC_APP_URL environment variable
 * 2. VERCEL_PROJECT_PRODUCTION_URL environment variable (automatically injected by Vercel)
 * 3. VERCEL_URL environment variable (automatically injected by Vercel)
 * 4. Development default (http://localhost:3000)
 * 5. Production fallback (https://la-te-x-report-studio.vercel.app)
 */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, '')}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  }
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  return 'https://la-te-x-report-studio.vercel.app';
}

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// Create a new QueryClient instance per session.
// This component lives inside the Server Component layout.tsx.
export function Providers({ children }: { children: React.ReactNode }) {
  // useState ensures each browser session gets its own QueryClient,
  // preventing state from leaking between users in SSR.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 60 seconds before being refetched
            staleTime: 60 * 1000,
            // Don't retry failed requests automatically in development
            retry: process.env.NODE_ENV === 'production' ? 2 : 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { IUser } from '@/types';

// ─── Query key ───────────────────────────────────────────────────────────────
// Centralised so all invalidations use the same key.
export const AUTH_QUERY_KEY = ['auth', 'currentUser'] as const;

// ─── Fetcher ─────────────────────────────────────────────────────────────────
async function fetchCurrentUser(): Promise<IUser | null> {
  const res = await fetch('/api/auth/me', {
    // Include cookies on every request
    credentials: 'same-origin',
  });

  // 401 = not logged in — not an error, just return null
  if (res.status === 401) return null;

  if (!res.ok) {
    throw new Error(`Failed to fetch user: ${res.status}`);
  }

  const json = await res.json() as { data: IUser };
  return json.data ?? null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // ── Current user query ────────────────────────────────────────────────────
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000,  // treat as fresh for 5 minutes
    retry: false,               // don't retry 401s
  });

  // ── Logout mutation ───────────────────────────────────────────────────────
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) throw new Error('Logout failed');
    },
    onSuccess: () => {
      // Wipe all cached queries so stale user data can't leak
      queryClient.clear();
      router.push('/login');
      router.refresh();
    },
    onError: (err) => {
      console.error('[useAuth] Logout error:', err);
    },
  });

  return {
    /** The current user, or null if not authenticated. */
    user: user ?? null,

    /** True while the initial auth check is in flight. */
    isLoading,

    /** True once we know the user is logged in. */
    isAuthenticated: Boolean(user),

    /** Any error from the /me fetch (not from 401s). */
    error,

    /** Call this to log out. Clears cache and redirects to /login. */
    logout: () => logoutMutation.mutate(),

    /** True while the logout request is in flight. */
    isLoggingOut: logoutMutation.isPending,
  };
}

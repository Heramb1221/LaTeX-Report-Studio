'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { AUTH_QUERY_KEY } from '@/hooks/useAuth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiKeyStatus {
  hasKey: boolean;
  last4: string | null;
}

// ─── Query key ────────────────────────────────────────────────────────────────

const API_KEY_QUERY_KEY = ['user', 'apiKeyStatus'] as const;

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchStatus(): Promise<ApiKeyStatus> {
  const res = await fetch('/api/user/api-key', { credentials: 'same-origin' });
  if (!res.ok) throw new Error('Failed to load API key status');
  const json = (await res.json()) as { data: ApiKeyStatus };
  return json.data;
}

async function fetchSave(apiKey: string): Promise<ApiKeyStatus> {
  const res = await fetch('/api/user/api-key', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ apiKey }),
  });
  const json = (await res.json()) as { data?: ApiKeyStatus; error?: string };
  if (!res.ok) throw new Error(json.error ?? 'Failed to save API key');
  return json.data!;
}

async function fetchDelete(): Promise<void> {
  const res = await fetch('/api/user/api-key', {
    method: 'DELETE',
    credentials: 'same-origin',
  });
  if (!res.ok) {
    const json = (await res.json()) as { error?: string };
    throw new Error(json.error ?? 'Failed to remove API key');
  }
}

// ─── useApiKey ───────────────────────────────────────────────────────────────

export function useApiKey() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: status, isLoading } = useQuery({
    queryKey: API_KEY_QUERY_KEY,
    queryFn: fetchStatus,
  });

  // Invalidate both the key-status cache AND the auth/currentUser cache —
  // the navbar/drawer reads `hasGeminiKey` from the latter, so both need
  // to refresh for the UI to update everywhere immediately.
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: API_KEY_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
  };

  const saveMutation = useMutation({
    mutationFn: fetchSave,
    onSuccess: () => {
      invalidateAll();
      toast({ title: 'API key saved', description: 'Verified and ready to use.' });
    },
    onError: (err: Error) => {
      toast({ variant: 'destructive', title: 'Could not save key', description: err.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: fetchDelete,
    onSuccess: () => {
      invalidateAll();
      toast({ title: 'API key removed' });
    },
    onError: (err: Error) => {
      toast({ variant: 'destructive', title: 'Could not remove key', description: err.message });
    },
  });

  return {
    hasKey: status?.hasKey ?? false,
    last4: status?.last4 ?? null,
    isLoading,
    saveKey: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    deleteKey: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

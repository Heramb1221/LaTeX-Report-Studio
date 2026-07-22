'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { IProject } from '@/types';

// ─── Query key factory ────────────────────────────────────────────────────────
// Using a factory keeps all cache operations (invalidate, update) consistent.
export const projectQueryKey = (id: string) => ['project', id] as const;

// ─── Fetcher ─────────────────────────────────────────────────────────────────

async function fetchProject(projectId: string): Promise<IProject> {
  const res = await fetch(`/api/projects/${projectId}`, {
    credentials: 'same-origin',
  });

  if (res.status === 404) {
    throw new Error('Project not found. It may have been deleted.');
  }
  if (!res.ok) {
    throw new Error(`Failed to load project (HTTP ${res.status})`);
  }

  const json = (await res.json()) as { data: IProject };
  return json.data;
}

// ─── useProject ──────────────────────────────────────────────────────────────

export function useProject(projectId: string) {
  const { data: project, isLoading, error } = useQuery({
    queryKey: projectQueryKey(projectId),
    queryFn: () => fetchProject(projectId),
    staleTime: 30 * 1000, // treat as fresh for 30 seconds
    retry: (failureCount, err) => {
      // Never retry a 404 — the project doesn't exist
      if ((err as Error).message.includes('not found')) return false;
      return failureCount < 2;
    },
  });

  return { project, isLoading, error };
}

// ─── useProjectUpdater ───────────────────────────────────────────────────────
// Returned by this hook and used by Phase 5 (chapter save) to optimistically
// update the project in the TanStack Query cache without a full refetch.

export function useProjectUpdater(projectId: string) {
  const queryClient = useQueryClient();

  return (updater: (prev: IProject) => IProject) => {
    queryClient.setQueryData<IProject>(projectQueryKey(projectId), (old) => {
      if (!old) return old;
      return updater(old);
    });
  };
}

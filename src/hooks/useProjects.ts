'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { IProject, CreateProjectInput } from '@/types';

// ─── Query key ────────────────────────────────────────────────────────────────
export const PROJECTS_QUERY_KEY = ['projects'] as const;

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchProjects(): Promise<IProject[]> {
  const res = await fetch('/api/projects', { credentials: 'same-origin' });
  if (!res.ok) throw new Error('Failed to load projects');
  const json = (await res.json()) as { data: IProject[] };
  return json.data ?? [];
}

async function fetchCreateProject(input: CreateProjectInput): Promise<IProject> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(input),
  });
  const json = (await res.json()) as { data?: IProject; error?: string };
  if (!res.ok) throw new Error(json.error ?? 'Failed to create project');
  return json.data!;
}

async function fetchDeleteProject(projectId: string): Promise<void> {
  const res = await fetch(`/api/projects/${projectId}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });
  if (!res.ok) {
    const json = (await res.json()) as { error?: string };
    throw new Error(json.error ?? 'Failed to delete project');
  }
}

// ─── useProjects ─────────────────────────────────────────────────────────────

export function useProjects() {
  const {
    data: projects = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: fetchProjects,
  });

  return { projects, isLoading, error };
}

// ─── useCreateProject ─────────────────────────────────────────────────────────

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: fetchCreateProject,
    onSuccess: (newProject) => {
      // Prepend the new project to the cached list — avoids a refetch
      queryClient.setQueryData<IProject[]>(PROJECTS_QUERY_KEY, (old = []) => [
        newProject,
        ...old,
      ]);
      toast({
        title: 'Project created',
        description: newProject.name,
      });
    },
    onError: (err: Error) => {
      toast({
        variant: 'destructive',
        title: 'Could not create project',
        description: err.message,
      });
    },
  });

  return {
    // mutateAsync so callers can await and get the returned project
    createProject: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
}

// ─── useDeleteProject ─────────────────────────────────────────────────────────

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: fetchDeleteProject,
    onSuccess: (_data, projectId) => {
      // Remove from cache immediately — no refetch needed
      queryClient.setQueryData<IProject[]>(PROJECTS_QUERY_KEY, (old = []) =>
        old.filter((p) => p._id !== projectId)
      );
      toast({ title: 'Project deleted' });
    },
    onError: (err: Error) => {
      toast({
        variant: 'destructive',
        title: 'Could not delete project',
        description: err.message,
      });
    },
  });

  return {
    deleteProject: (id: string) => mutation.mutate(id),
    isDeleting: mutation.isPending,
  };
}

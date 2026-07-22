'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { projectQueryKey } from '@/hooks/useProject';
import type { IProject, IReference, IReferenceFields } from '@/types';

// ─── useCreateCitation ─────────────────────────────────────────────────────────

export function useCreateCitation(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (input: {
      entryType: IReference['entryType'];
      fields: IReferenceFields;
    }): Promise<IReference> => {
      const res = await fetch(`/api/projects/${projectId}/citations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(input),
      });
      const json = (await res.json()) as { data?: IReference; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Failed to add citation');
      return json.data!;
    },
    onSuccess: (newRef) => {
      queryClient.setQueryData<IProject>(projectQueryKey(projectId), (old) => {
        if (!old) return old;
        return { ...old, references: [...old.references, newRef] };
      });
      toast({ title: 'Citation added', description: `Key: ${newRef.citeKey}` });
    },
    onError: (err: Error) => {
      toast({ variant: 'destructive', title: 'Failed to add citation', description: err.message });
    },
  });

  return { createCitation: mutation.mutateAsync, isCreating: mutation.isPending };
}

// ─── useUpdateCitation ─────────────────────────────────────────────────────────

export function useUpdateCitation(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async ({
      citationId,
      entryType,
      fields,
    }: {
      citationId: string;
      entryType: IReference['entryType'];
      fields: IReferenceFields;
    }): Promise<IReference> => {
      const res = await fetch(
        `/api/projects/${projectId}/citations/${citationId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ entryType, fields }),
        }
      );
      const json = (await res.json()) as { data?: IReference; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Failed to update citation');
      return json.data!;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<IProject>(projectQueryKey(projectId), (old) => {
        if (!old) return old;
        return {
          ...old,
          references: old.references.map((r) => (r.id === updated.id ? updated : r)),
        };
      });
      toast({ title: 'Citation updated' });
    },
    onError: (err: Error) => {
      toast({ variant: 'destructive', title: 'Update failed', description: err.message });
    },
  });

  return { updateCitation: mutation.mutateAsync, isUpdating: mutation.isPending };
}

// ─── useDeleteCitation ─────────────────────────────────────────────────────────

export function useDeleteCitation(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (citationId: string) => {
      const res = await fetch(
        `/api/projects/${projectId}/citations/${citationId}`,
        { method: 'DELETE', credentials: 'same-origin' }
      );
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? 'Delete failed');
      }
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<IProject>(projectQueryKey(projectId), (old) => {
        if (!old) return old;
        return { ...old, references: old.references.filter((r) => r.id !== deletedId) };
      });
      toast({ title: 'Citation deleted' });
    },
    onError: (err: Error) => {
      toast({ variant: 'destructive', title: 'Delete failed', description: err.message });
    },
  });

  return { deleteCitation: (id: string) => mutation.mutate(id), isDeleting: mutation.isPending };
}

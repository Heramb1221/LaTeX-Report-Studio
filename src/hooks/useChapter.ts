'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useEditorStore } from '@/store/editorStore';
import { projectQueryKey } from '@/hooks/useProject';
import type { IProject, IChapter } from '@/types';

// ─── useAddChapter ────────────────────────────────────────────────────────────

export function useAddChapter(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { setActiveChapterId, setEditorContent } = useEditorStore();

  const mutation = useMutation({
    mutationFn: async (title: string): Promise<IChapter> => {
      const res = await fetch(`/api/projects/${projectId}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ title }),
      });
      const json = (await res.json()) as { data?: IChapter; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Failed to add chapter');
      return json.data!;
    },
    onSuccess: (newChapter) => {
      // Append to cache
      queryClient.setQueryData<IProject>(projectQueryKey(projectId), (old) => {
        if (!old) return old;
        return { ...old, chapters: [...old.chapters, newChapter] };
      });
      // Switch editor to the new chapter
      setActiveChapterId(newChapter.id);
      setEditorContent(newChapter.content);
    },
    onError: (err: Error) => {
      toast({ variant: 'destructive', title: 'Failed to add chapter', description: err.message });
    },
  });

  return { addChapter: mutation.mutateAsync, isAdding: mutation.isPending };
}

// ─── useSaveChapter ───────────────────────────────────────────────────────────
// Called by the debounced auto-save in MonacoLatexEditor.
// Returns both mutate (fire-and-forget) and mutateAsync (awaitable for chapter switch).

export function useSaveChapter(projectId: string) {
  const queryClient = useQueryClient();
  const { setSaveStatus } = useEditorStore();

  const mutation = useMutation({
    mutationFn: async ({
      chapterId,
      content,
    }: {
      chapterId: string;
      content: string;
    }) => {
      const res = await fetch(
        `/api/projects/${projectId}/chapters/${chapterId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ content }),
        }
      );
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? 'Save failed');
      }
    },
    onMutate: () => setSaveStatus('saving'),
    onSuccess: (_, { chapterId, content }) => {
      // Update content in the project cache so the explorer stays in sync
      queryClient.setQueryData<IProject>(projectQueryKey(projectId), (old) => {
        if (!old) return old;
        return {
          ...old,
          chapters: old.chapters.map((ch) =>
            ch.id === chapterId ? { ...ch, content } : ch
          ),
        };
      });
      setSaveStatus('saved');
      // Fade status back to idle after 3 s
      setTimeout(() => setSaveStatus('idle'), 3000);
    },
    onError: () => {
      // Don't toast on every auto-save failure — just mark as unsaved
      setSaveStatus('unsaved');
    },
  });

  return {
    save: (chapterId: string, content: string) =>
      mutation.mutate({ chapterId, content }),
    saveAsync: (chapterId: string, content: string) =>
      mutation.mutateAsync({ chapterId, content }),
    isSaving: mutation.isPending,
  };
}

// ─── useRenameChapter ─────────────────────────────────────────────────────────

export function useRenameChapter(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async ({
      chapterId,
      title,
    }: {
      chapterId: string;
      title: string;
    }) => {
      const res = await fetch(
        `/api/projects/${projectId}/chapters/${chapterId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ title }),
        }
      );
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? 'Rename failed');
      }
    },
    onSuccess: (_, { chapterId, title }) => {
      queryClient.setQueryData<IProject>(projectQueryKey(projectId), (old) => {
        if (!old) return old;
        return {
          ...old,
          chapters: old.chapters.map((ch) =>
            ch.id === chapterId ? { ...ch, title } : ch
          ),
        };
      });
    },
    onError: (err: Error) => {
      toast({ variant: 'destructive', title: 'Rename failed', description: err.message });
    },
  });

  return {
    rename: (chapterId: string, title: string) =>
      mutation.mutate({ chapterId, title }),
    isRenaming: mutation.isPending,
  };
}

// ─── useDeleteChapter ─────────────────────────────────────────────────────────

export function useDeleteChapter(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { activeChapterId, setActiveChapterId, setEditorContent } =
    useEditorStore();

  const mutation = useMutation({
    mutationFn: async (chapterId: string) => {
      const res = await fetch(
        `/api/projects/${projectId}/chapters/${chapterId}`,
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
        const remaining = old.chapters.filter((ch) => ch.id !== deletedId);

        // If the deleted chapter was active, switch to the previous one
        if (deletedId === activeChapterId) {
          const sorted = [...remaining].sort((a, b) => a.order - b.order);
          const next = sorted[sorted.length - 1] ?? null;
          setActiveChapterId(next?.id ?? null);
          setEditorContent(next?.content ?? '');
        }

        return { ...old, chapters: remaining };
      });
      toast({ title: 'Chapter deleted' });
    },
    onError: (err: Error) => {
      toast({ variant: 'destructive', title: 'Delete failed', description: err.message });
    },
  });

  return {
    deleteChapter: (id: string) => mutation.mutate(id),
    isDeleting: mutation.isPending,
  };
}

// ─── useReorderChapters ───────────────────────────────────────────────────────

export function useReorderChapters(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const res = await fetch(
        `/api/projects/${projectId}/chapters/reorder`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ orderedIds }),
        }
      );
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? 'Reorder failed');
      }
    },
    onSuccess: (_, orderedIds) => {
      // Update chapter order values in cache immediately
      queryClient.setQueryData<IProject>(projectQueryKey(projectId), (old) => {
        if (!old) return old;
        const orderMap = new Map(orderedIds.map((id, i) => [id, i]));
        return {
          ...old,
          chapters: old.chapters.map((ch) => ({
            ...ch,
            order: orderMap.has(ch.id) ? orderMap.get(ch.id)! : ch.order,
          })),
        };
      });
    },
    onError: (err: Error) => {
      toast({ variant: 'destructive', title: 'Reorder failed', description: err.message });
    },
  });

  return {
    reorder: (orderedIds: string[]) => mutation.mutate(orderedIds),
    isReordering: mutation.isPending,
  };
}

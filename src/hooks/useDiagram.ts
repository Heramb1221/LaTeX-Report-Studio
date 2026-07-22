'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useEditorStore } from '@/store/editorStore';
import { projectQueryKey } from '@/hooks/useProject';
import type { IProject, IDiagram, DiagramType } from '@/types';

// ─── useCreateDiagram ─────────────────────────────────────────────────────────

export function useCreateDiagram(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { setEditingDiagramId } = useEditorStore();

  const mutation = useMutation({
    mutationFn: async (input: { name: string; diagramType: DiagramType }): Promise<IDiagram> => {
      const res = await fetch(`/api/projects/${projectId}/diagrams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(input),
      });
      const json = (await res.json()) as { data?: IDiagram; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Failed to create diagram');
      return json.data!;
    },
    onSuccess: (newDiagram) => {
      queryClient.setQueryData<IProject>(projectQueryKey(projectId), (old) => {
        if (!old) return old;
        return { ...old, diagrams: [...old.diagrams, newDiagram] };
      });
      // Immediately open the editor for the newly created diagram
      setEditingDiagramId(newDiagram.id);
    },
    onError: (err: Error) => {
      toast({ variant: 'destructive', title: 'Failed to create diagram', description: err.message });
    },
  });

  return { createDiagram: mutation.mutateAsync, isCreating: mutation.isPending };
}

// ─── useSaveDiagramXml ────────────────────────────────────────────────────────
// Plain save — persists XML (and optionally a renamed title) without
// touching the PNG. Used by the modal's "Save" button.

export function useSaveDiagramXml(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async ({
      diagramId,
      drawioXml,
      name,
    }: { diagramId: string; drawioXml?: string; name?: string }) => {
      const res = await fetch(
        `/api/projects/${projectId}/diagrams/${diagramId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ drawioXml, name }),
        }
      );
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? 'Save failed');
      }
    },
    onSuccess: (_, { diagramId, drawioXml, name }) => {
      queryClient.setQueryData<IProject>(projectQueryKey(projectId), (old) => {
        if (!old) return old;
        return {
          ...old,
          diagrams: old.diagrams.map((d) =>
            d.id === diagramId
              ? { ...d, ...(drawioXml !== undefined && { drawioXml }), ...(name !== undefined && { name }) }
              : d
          ),
        };
      });
      toast({ title: 'Diagram saved' });
    },
    onError: (err: Error) => {
      toast({ variant: 'destructive', title: 'Save failed', description: err.message });
    },
  });

  return {
    save: (diagramId: string, drawioXml: string) =>
      mutation.mutateAsync({ diagramId, drawioXml }),
    isSaving: mutation.isPending,
  };
}

// ─── useExportDiagramPng ──────────────────────────────────────────────────────

export function useExportDiagramPng(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async ({
      diagramId,
      drawioXml,
      pngDataUrl,
    }: { diagramId: string; drawioXml: string; pngDataUrl: string }) => {
      const res = await fetch(
        `/api/projects/${projectId}/diagrams/${diagramId}/export`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ drawioXml, pngDataUrl }),
        }
      );
      const json = (await res.json()) as {
        data?: { pngUrl: string; latexCommand: string };
        error?: string;
      };
      if (!res.ok) throw new Error(json.error ?? 'Export failed');
      return json.data!;
    },
    onSuccess: (result, { diagramId, drawioXml }) => {
      queryClient.setQueryData<IProject>(projectQueryKey(projectId), (old) => {
        if (!old) return old;
        return {
          ...old,
          diagrams: old.diagrams.map((d) =>
            d.id === diagramId
              ? { ...d, drawioXml, pngUrl: result.pngUrl, latexCommand: result.latexCommand }
              : d
          ),
        };
      });
      toast({ title: 'Diagram exported', description: 'PNG uploaded successfully.' });
    },
    onError: (err: Error) => {
      toast({ variant: 'destructive', title: 'Export failed', description: err.message });
    },
  });

  return { exportPng: mutation.mutateAsync, isExporting: mutation.isPending };
}

// ─── useDeleteDiagram ─────────────────────────────────────────────────────────

export function useDeleteDiagram(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (diagramId: string) => {
      const res = await fetch(
        `/api/projects/${projectId}/diagrams/${diagramId}`,
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
        return { ...old, diagrams: old.diagrams.filter((d) => d.id !== deletedId) };
      });
      toast({ title: 'Diagram deleted' });
    },
    onError: (err: Error) => {
      toast({ variant: 'destructive', title: 'Delete failed', description: err.message });
    },
  });

  return { deleteDiagram: (id: string) => mutation.mutate(id), isDeleting: mutation.isPending };
}

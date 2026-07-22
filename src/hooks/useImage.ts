'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { projectQueryKey } from '@/hooks/useProject';
import type { IProject, IImage } from '@/types';

// ─── useUploadImage ───────────────────────────────────────────────────────────

export function useUploadImage(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (file: File): Promise<IImage> => {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/projects/${projectId}/images`, {
        method: 'POST',
        credentials: 'same-origin',
        // Don't set Content-Type here — the browser sets it automatically
        // with the correct multipart boundary when body is FormData.
        body: formData,
      });

      const json = (await res.json()) as { data?: IImage; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Upload failed');
      return json.data!;
    },
    onSuccess: (newImage) => {
      // Append to the TanStack Query project cache immediately —
      // no full refetch needed.
      queryClient.setQueryData<IProject>(projectQueryKey(projectId), (old) => {
        if (!old) return old;
        return { ...old, images: [...(old.images ?? []), newImage] };
      });
      toast({ title: 'Image uploaded', description: newImage.originalName });
    },
    onError: (err: Error) => {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: err.message,
      });
    },
  });

  return {
    uploadImage: mutation.mutateAsync,
    isUploading: mutation.isPending,
    // Expose the last successfully uploaded image so the modal can
    // optionally auto-select it for immediate insertion.
    lastUploaded: mutation.data ?? null,
  };
}

// ─── useDeleteImage ───────────────────────────────────────────────────────────

export function useDeleteImage(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (imageId: string): Promise<void> => {
      const res = await fetch(
        `/api/projects/${projectId}/images/${imageId}`,
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
        return {
          ...old,
          images: (old.images ?? []).filter((img) => img.id !== deletedId),
        };
      });
      toast({ title: 'Image deleted' });
    },
    onError: (err: Error) => {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: err.message,
      });
    },
  });

  return {
    deleteImage: (id: string) => mutation.mutate(id),
    isDeleting: mutation.isPending,
  };
}

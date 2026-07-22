'use client';

import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// ─── Shared fetcher ───────────────────────────────────────────────────────────

async function callAiEndpoint(endpoint: 'humanize' | 'convert', text: string): Promise<string> {
  const res = await fetch(`/api/ai/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ text }),
  });

  const json = (await res.json()) as { data?: { result: string }; error?: string };
  if (!res.ok) throw new Error(json.error ?? 'AI request failed');
  return json.data!.result;
}

// ─── useAi ───────────────────────────────────────────────────────────────────

export function useAi() {
  const { toast } = useToast();

  const humanizeMutation = useMutation({
    mutationFn: (text: string) => callAiEndpoint('humanize', text),
    onError: (err: Error) => {
      toast({ variant: 'destructive', title: 'Humanize failed', description: err.message });
    },
  });

  const convertMutation = useMutation({
    mutationFn: (text: string) => callAiEndpoint('convert', text),
    onError: (err: Error) => {
      toast({ variant: 'destructive', title: 'Conversion failed', description: err.message });
    },
  });

  // Calls the global insert helper registered by MonacoLatexEditor on mount.
  // Returns false if no editor is currently mounted (e.g. drawer opened
  // before any project loaded — shouldn't normally happen, but guard anyway).
  const insertAtCursor = (text: string): boolean => {
    if (typeof window !== 'undefined' && window.__lrsInsertAtCursor) {
      window.__lrsInsertAtCursor(text);
      return true;
    }
    toast({
      variant: 'destructive',
      title: 'Could not insert text',
      description: 'The editor is not ready. Try clicking inside the editor first.',
    });
    return false;
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    await navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  return {
    humanize: humanizeMutation.mutateAsync,
    isHumanizing: humanizeMutation.isPending,
    convert: convertMutation.mutateAsync,
    isConverting: convertMutation.isPending,
    insertAtCursor,
    copyToClipboard,
  };
}

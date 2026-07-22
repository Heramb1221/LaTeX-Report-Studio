'use client';

import { useCallback } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useSaveChapter } from '@/hooks/useChapter';
import { useToast } from '@/hooks/use-toast';

interface CompileResponse {
  data?: { pdfBase64: string; compiledAt: string };
  error?: string;
  log?: string;
}

export function useCompile(projectId: string) {
  const { toast } = useToast();
  const { saveAsync } = useSaveChapter(projectId);

  const {
    activeChapterId,
    editorContent,
    saveStatus,
    isCompiling,
    setIsCompiling,
    setCompiledPdf,
    setCompileError,
  } = useEditorStore();

  const compile = useCallback(async () => {
    if (isCompiling) return; // prevent double-clicks

    try {
      // ── 1. Save any unsaved changes first ──────────────────────────────────
      // Compiling stale content (from before the last edit) would be confusing —
      // the user expects the PDF to reflect exactly what's in the editor.
      if (saveStatus === 'unsaved' && activeChapterId) {
        await saveAsync(activeChapterId, editorContent);
      }

      // ── 2. Trigger compile ──────────────────────────────────────────────────
      setIsCompiling(true);
      setCompileError(null);

      const res = await fetch(`/api/projects/${projectId}/compile`, {
        method: 'POST',
        credentials: 'same-origin',
      });

      const json = (await res.json()) as CompileResponse;

      if (!res.ok || !json.data) {
        setCompileError(json.log ?? json.error ?? 'Compilation failed.');
        toast({
          variant: 'destructive',
          title: 'Compilation failed',
          description: 'See the error log in the preview panel.',
        });
        return;
      }

      setCompiledPdf(json.data.pdfBase64);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not reach the server.';
      setCompileError(message);
      toast({
        variant: 'destructive',
        title: 'Compilation failed',
        description: message,
      });
    } finally {
      setIsCompiling(false);
    }
  }, [
    projectId,
    isCompiling,
    saveStatus,
    activeChapterId,
    editorContent,
    saveAsync,
    setIsCompiling,
    setCompiledPdf,
    setCompileError,
    toast,
  ]);

  return { compile, isCompiling };
}

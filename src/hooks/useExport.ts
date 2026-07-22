'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseExportReturn {
  exportProject: () => Promise<void>;
  isExporting: boolean;
}

export function useExport(projectId: string, projectName: string): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportProject = useCallback(async () => {
    if (isExporting) return;

    setIsExporting(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/export`, {
        method: 'GET',
        credentials: 'same-origin',
      });

      if (!res.ok) {
        // Try to parse an error message from the JSON body
        let errorMsg = `Export failed (HTTP ${res.status})`;
        try {
          const json = (await res.json()) as { error?: string };
          if (json.error) errorMsg = json.error;
        } catch {
          // body wasn't JSON — use the generic message
        }
        throw new Error(errorMsg);
      }

      // ── Stream to a Blob, then trigger a browser download ─────────────────
      // We read the whole response into a Blob rather than using a streaming
      // approach because:
      //   (a) zip files need to be fully formed before the browser can save them
      //   (b) createObjectURL requires a Blob, not a ReadableStream
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // Extract filename from Content-Disposition if available,
      // otherwise fall back to a slugified project name.
      const disposition = res.headers.get('content-disposition') ?? '';
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] ?? `${projectName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.zip`;

      // Programmatic download via a hidden <a> tag
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Revoke the object URL after a short delay so the browser has
      // time to initiate the download before the URL is invalidated.
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      toast({
        title: 'Export ready',
        description: `${filename} downloaded successfully.`,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      toast({
        variant: 'destructive',
        title: 'Export failed',
        description: message,
      });
    } finally {
      setIsExporting(false);
    }
  }, [projectId, projectName, isExporting, toast]);

  return { exportProject, isExporting };
}

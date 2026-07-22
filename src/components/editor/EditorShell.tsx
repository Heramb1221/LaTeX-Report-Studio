'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useProject } from '@/hooks/useProject';
import { useEditorStore } from '@/store/editorStore';
import { EditorLayout } from './EditorLayout';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

// ─── Loading screen ───────────────────────────────────────────────────────────

function EditorLoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Loading project…</p>
      </div>
    </div>
  );
}

// ─── Error screen ─────────────────────────────────────────────────────────────

function EditorErrorScreen({ message }: { message: string }) {
  return (
    <div className="h-screen flex items-center justify-center bg-background p-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div>
          <p className="font-semibold">Failed to load project</p>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

interface EditorShellProps {
  projectId: string;
}

export function EditorShell({ projectId }: EditorShellProps) {
  const { project, isLoading, error } = useProject(projectId);
  const { setActiveChapterId, setEditorContent, reset } = useEditorStore();

  // Track whether we've done the initial chapter selection for this project.
  // Using a ref (not state) so the effect doesn't loop on every render.
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!project || initializedRef.current) return;
    initializedRef.current = true;

    // Select the first chapter (lowest order) as the active one
    const sorted = [...project.chapters].sort((a, b) => a.order - b.order);
    const first = sorted[0];

    if (first) {
      setActiveChapterId(first.id);
      setEditorContent(first.content);
    }

    // Cleanup: reset the store when the user navigates away from the editor
    return () => {
      reset();
      initializedRef.current = false;
    };
  }, [project, setActiveChapterId, setEditorContent, reset]);

  if (isLoading) return <EditorLoadingScreen />;
  if (error) return <EditorErrorScreen message={(error as Error).message} />;
  if (!project) return <EditorErrorScreen message="Project not found." />;

  return <EditorLayout project={project} />;
}

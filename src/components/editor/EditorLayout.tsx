'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useEditorStore } from '@/store/editorStore';
import type { IProject } from '@/types';
import { EditorTopbar } from './EditorTopbar';
import { EditorToolbar } from './EditorToolbar';
import { PdfViewer } from './PdfViewer';
import { EditorBottomPanel } from './EditorBottomPanel';
import { MobileEditorView } from './MobileEditorView';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { cn } from '@/lib/utils';

const MonacoLatexEditor = dynamic(
  () => import('./MonacoLatexEditor').then((mod) => mod.MonacoLatexEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
        <p className="text-sm text-neutral-500 animate-pulse">Loading editor…</p>
      </div>
    ),
  }
);

interface EditorLayoutProps {
  project: IProject;
}

export function EditorLayout({ project }: EditorLayoutProps) {
  const { focusMode, activeBottomPanelTab } = useEditorStore();

  return (
    <>
      {/* ── Mobile Layout (visible only on < md screens) ───────────────── */}
      <div className="md:hidden h-screen">
        <MobileEditorView project={project} />
      </div>

      {/* ── Desktop Layout (visible only on md+ screens) ──────────────── */}
      <div className="hidden md:flex h-screen flex-col overflow-hidden bg-background bg-dot-pattern">
        <EditorTopbar project={project} />

        <motion.div
          className={cn("flex flex-1 min-h-0 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]")}
          animate={{
            paddingTop: focusMode ? '3rem' : '0rem',
            paddingBottom: focusMode ? '3rem' : '0rem',
            paddingLeft: focusMode ? '5vw' : '0vw',
            paddingRight: focusMode ? '5vw' : '0vw',
          }}
        >
          <ResizablePanelGroup orientation="horizontal" className="flex-1 overflow-hidden shadow-2xl bg-background/50 backdrop-blur-sm">
            {/* Left Side (Monaco Editor & Tools Panel) */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <ResizablePanelGroup orientation="vertical">
                {/* Top Left: Monaco Editor */}
                <ResizablePanel defaultSize={activeBottomPanelTab ? 65 : 100} minSize={30}>
                  <div className="h-full min-w-0 flex flex-col relative z-10">
                    <MonacoLatexEditor projectId={project._id} />
                  </div>
                </ResizablePanel>

                {/* Bottom Left: Tools Panel (Conditionally rendered) */}
                {activeBottomPanelTab && (
                  <>
                    <ResizableHandle withHandle className="bg-border/50 hover:bg-primary/50 transition-colors" />
                    <ResizablePanel defaultSize={35} minSize={20} className="relative z-10">
                      <EditorBottomPanel project={project} />
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-border/50 hover:bg-primary/50 transition-colors" />

            {/* PDF Viewer (Right 50%) */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <aside
                className="h-full overflow-hidden bg-muted/10 relative z-10"
                aria-label="PDF preview"
              >
                <PdfViewer />
              </aside>
            </ResizablePanel>
          </ResizablePanelGroup>
        </motion.div>

        <EditorToolbar />
      </div>
    </>
  );
}

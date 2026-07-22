'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/store/editorStore';
import { useCompile } from '@/hooks/useCompile';
import type { IProject } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ProjectExplorer } from './ProjectExplorer';
import { PdfViewer } from './PdfViewer';
import { AiDrawer } from './AiDrawer';
import { CitationModal } from './CitationModal';
import { DiagramModal } from './DiagramModal';
import { ImageManagerModal } from './ImageManagerModal';
import { TableBuilderModal } from './TableBuilderModal';
import { NewDiagramModal } from './NewDiagramModal';

import {
  ArrowLeft,
  Play,
  Loader2,
  FolderOpen,
  FileText,
  Eye,
  Table2,
  ImagePlus,
  GitFork,
  BookMarked,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Dynamic Monaco (client-only) ─────────────────────────────────────────────
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

// ─── Save status dot ──────────────────────────────────────────────────────────
function MobileSaveIndicator() {
  const saveStatus = useEditorStore((s) => s.saveStatus);
  if (saveStatus === 'idle') return null;
  return (
    <span className={cn(
      'h-2 w-2 rounded-full shrink-0',
      saveStatus === 'saving'  && 'bg-muted-foreground animate-pulse',
      saveStatus === 'saved'   && 'bg-green-500',
      saveStatus === 'unsaved' && 'bg-amber-500',
    )} />
  );
}

// ─── Main mobile view ─────────────────────────────────────────────────────────
interface MobileEditorViewProps {
  project: IProject;
}

export function MobileEditorView({ project }: MobileEditorViewProps) {
  const {
    setIsAiDrawerOpen, setAiDrawerMode,
    setNewDiagramModalOpen,
    setCitationModalOpen,
    setTableBuilderOpen,
    setImageManagerOpen,
  } = useEditorStore();
  const { compile, isCompiling } = useCompile(project._id);

  // 'editor' | 'pdf' — which full-screen view is active
  const [activeView, setActiveView] = useState<'editor' | 'pdf'>('editor');

  const handleToolTap = (action: string) => {
    switch (action) {
      case 'tables':    setTableBuilderOpen(true);                            break;
      case 'images':    setImageManagerOpen(true);                            break;
      case 'diagrams':  setNewDiagramModalOpen(true);                         break;
      case 'citations': setCitationModalOpen(true);                           break;
      case 'ai':        setAiDrawerMode('humanize'); setIsAiDrawerOpen(true); break;
    }
  };

  const TOOLS = [
    { key: 'tables',    icon: Table2,     label: 'Table'    },
    { key: 'images',    icon: ImagePlus,  label: 'Image'    },
    { key: 'diagrams',  icon: GitFork,    label: 'Diagram'  },
    { key: 'citations', icon: BookMarked, label: 'Citation' },
    { key: 'ai',        icon: Sparkles,   label: 'AI'       },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">

      {/* ── Mobile Top Bar ────────────────────────────────────────────── */}
      <header className="h-12 border-b shrink-0 flex items-center gap-2 px-2 bg-background/90 backdrop-blur-md z-30">
        {/* Back */}
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
          <Link href="/dashboard" aria-label="Back to dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        {/* Project Explorer Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <FolderOpen className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 bg-background/95 backdrop-blur-xl border-r">
            <SheetHeader className="px-4 py-3 border-b">
              <SheetTitle className="font-serif text-base text-left">Explorer</SheetTitle>
            </SheetHeader>
            <div className="h-[calc(100vh-52px)] overflow-y-auto">
              <ProjectExplorer project={project} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Project name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MobileSaveIndicator />
          <h1 className="text-sm font-serif font-medium truncate">{project.name}</h1>
        </div>

        {/* Editor / PDF Toggle */}
        <div className="flex items-center bg-muted rounded-md p-0.5 shrink-0">
          <button
            onClick={() => setActiveView('editor')}
            className={cn(
              'h-7 px-2.5 rounded-sm text-xs font-medium flex items-center gap-1 transition-all',
              activeView === 'editor'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <FileText className="h-3 w-3" />
            <span>Code</span>
          </button>
          <button
            onClick={() => setActiveView('pdf')}
            className={cn(
              'h-7 px-2.5 rounded-sm text-xs font-medium flex items-center gap-1 transition-all',
              activeView === 'pdf'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Eye className="h-3 w-3" />
            <span>PDF</span>
          </button>
        </div>

        {/* Compile button */}
        <Button
          size="sm"
          className="h-8 gap-1.5 rounded-sm shrink-0 px-2.5"
          onClick={() => compile()}
          disabled={isCompiling}
        >
          {isCompiling
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Play className="h-3.5 w-3.5 fill-current" />
          }
        </Button>
      </header>

      {/* ── Main View (Editor or PDF, full screen) ────────────────────── */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeView === 'editor' ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <MonacoLatexEditor projectId={project._id} />
            </motion.div>
          ) : (
            <motion.div
              key="pdf"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="absolute inset-0 bg-muted/10"
            >
              <PdfViewer />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Floating Pill Toolbar ─────────────────────────────────────── */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 280, damping: 25 }}
          className="flex items-center gap-1 px-2.5 py-2 rounded-full bg-background/80 backdrop-blur-2xl border border-border/60 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]"
        >
          {TOOLS.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => handleToolTap(key)}
              aria-label={label}
              className="relative flex flex-col items-center justify-center h-11 w-11 rounded-full transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-95"
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </motion.div>
      </div>

      {/* ── All overlay modals (same as desktop) ──────────────────────── */}
      <AiDrawer />
      <NewDiagramModal projectId={project._id} />
      <DiagramModal project={project} />
      <CitationModal project={project} />
      <TableBuilderModal />
      <ImageManagerModal project={project} />
    </div>
  );
}

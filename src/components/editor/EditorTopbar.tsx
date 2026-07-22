'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/store/editorStore';
import { useCompile } from '@/hooks/useCompile';
import { useExport } from '@/hooks/useExport';
import { PROJECT_TEMPLATE_LABELS } from '@/types';
import type { IProject } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ProjectExplorer } from './ProjectExplorer';
import {
  ArrowLeft,
  FileText,
  Play,
  Download,
  CheckCircle2,
  Loader2,
  Circle,
  FolderOpen,
  Maximize,
  Minimize,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Save status indicator ────────────────────────────────────────────────────

function SaveIndicator() {
  const saveStatus = useEditorStore((s) => s.saveStatus);

  const config = {
    idle:    null,
    saving:  { icon: Loader2,       label: 'Saving…',         className: 'text-muted-foreground', spin: true  },
    saved:   { icon: CheckCircle2,  label: 'Saved',           className: 'text-green-500',        spin: false },
    unsaved: { icon: Circle,        label: 'Unsaved changes', className: 'text-amber-500',        spin: false },
  } as const;

  const entry = config[saveStatus];
  if (!entry) return null;

  const Icon = entry.icon;

  return (
    <span className={cn('flex items-center gap-1 text-xs shrink-0', entry.className)}>
      <Icon className={cn('h-3 w-3', entry.spin && 'animate-spin')} />
      <span className="hidden sm:inline">{entry.label}</span>
    </span>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

interface EditorTopbarProps {
  project: IProject;
}

export function EditorTopbar({ project }: EditorTopbarProps) {
  const { compile, isCompiling } = useCompile(project._id);
  const { exportProject, isExporting } = useExport(project._id, project.name);
  const { focusMode, setFocusMode } = useEditorStore();

  return (
    <TooltipProvider delayDuration={400}>
      <AnimatePresence>
        {!focusMode && (
          <motion.header
            initial={{ y: -56, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -56, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-14 border-b shrink-0 flex items-center gap-2 px-3 bg-background/80 backdrop-blur-md z-40"
          >
            {/* Back to dashboard */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
                  <Link href="/dashboard" aria-label="Back to dashboard">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Back to dashboard</TooltipContent>
            </Tooltip>

            {/* Project Explorer Sheet */}
            <Sheet>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">Project Explorer</TooltipContent>
              </Tooltip>
              
              <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0 bg-background/90 backdrop-blur-xl border-r">
                <SheetHeader className="px-4 py-3 border-b bg-background/50">
                  <SheetTitle className="font-serif text-lg text-left">Project Explorer</SheetTitle>
                </SheetHeader>
                <div className="h-[calc(100vh-60px)] overflow-y-auto">
                  <ProjectExplorer project={project} />
                </div>
              </SheetContent>
            </Sheet>

            <div className="h-5 w-px bg-border shrink-0 mx-1" aria-hidden />

            {/* Project name + template badge */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h1 className="text-sm font-serif font-medium truncate">{project.name}</h1>
              <Badge
                variant="outline"
                className="text-[10px] font-normal shrink-0 hidden md:flex border-primary/20 bg-primary/5 text-primary"
              >
                {PROJECT_TEMPLATE_LABELS[project.template]}
              </Badge>
            </div>

            <SaveIndicator />

            {/* ── Action buttons ──────────────────────────────────────────── */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Compile */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className="gap-1.5 rounded-sm"
                    onClick={() => compile()}
                    disabled={isCompiling}
                    aria-label="Compile to PDF"
                  >
                    {isCompiling ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5 fill-current" />
                    )}
                    <span className="hidden sm:inline font-medium">
                      {isCompiling ? 'Compiling…' : 'Compile'}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Compile to PDF{' '}
                  <kbd className="ml-1 text-[10px] opacity-70">(saves first)</kbd>
                </TooltipContent>
              </Tooltip>

              {/* Export */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 rounded-sm"
                    onClick={() => exportProject()}
                    disabled={isExporting || isCompiling}
                    aria-label="Export project as zip"
                  >
                    {isExporting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    <span className="hidden sm:inline font-medium">
                      {isExporting ? 'Exporting…' : 'Export'}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Download project.zip
                </TooltipContent>
              </Tooltip>

              <div className="h-5 w-px bg-border shrink-0 mx-1" aria-hidden />

              {/* Focus Mode */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setFocusMode(true)}
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Enter Focus Mode</TooltipContent>
              </Tooltip>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Persistent Focus Mode Exit Button (only shown when focused) */}
      <AnimatePresence>
        {focusMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-10 w-10 shadow-lg rounded-full bg-background/80 backdrop-blur-md border border-border"
                  onClick={() => setFocusMode(false)}
                >
                  <Minimize className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Exit Focus Mode</TooltipContent>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}

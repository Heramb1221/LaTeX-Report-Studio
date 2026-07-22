'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useDeleteProject } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, FolderOpen, BookOpen } from 'lucide-react';
import type { IProject } from '@/types';
import { PROJECT_TEMPLATE_LABELS } from '@/types';

interface ProjectCardProps {
  project: IProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { deleteProject, isDeleting } = useDeleteProject();

  const lastModified = formatDistanceToNow(new Date(project.updatedAt), {
    addSuffix: true,
  });

  const chapterCount = project.chapters?.length ?? 0;

  return (
    <article className="group flex flex-col relative p-5 bg-card/50 hover:bg-card/80 transition-colors border-l-2 border-transparent hover:border-primary">
      {/* ── Card body ────────────────────────────────────────────────────── */}
      <div className="flex-1 space-y-3">
        {/* Name + description */}
        <div>
          <h3 className="font-serif text-lg font-semibold leading-snug line-clamp-2">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 opacity-70" />
            {chapterCount} chapter{chapterCount !== 1 ? 's' : ''}
          </span>
          <span aria-hidden className="opacity-50">•</span>
          <span className="opacity-70">Modified {lastModified}</span>
        </div>
      </div>

      {/* ── Card footer ──────────────────────────────────────────────────── */}
      <div className="pt-6 flex items-center gap-2">
        {/* Open button */}
        <Button asChild variant="outline" size="sm" className="flex-1 rounded-none border-t-0 border-x-0 border-b-2 bg-transparent hover:bg-transparent hover:border-primary transition-colors">
          <Link href={`/editor/${project._id}`}>
            <FolderOpen className="h-4 w-4 mr-2" />
            Open Document
          </Link>
        </Button>

        {/* Delete with confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-none"
              disabled={isDeleting}
              aria-label="Delete project"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent className="rounded-none">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-serif">Delete this document?</AlertDialogTitle>
              <AlertDialogDescription>
                <strong>&ldquo;{project.name}&rdquo;</strong> and all its
                chapters, diagrams, images, and references will be permanently
                deleted. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-none border-b-2 border-t-0 border-x-0">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteProject(project._id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-none border-b-2 border-transparent"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </article>
  );
}

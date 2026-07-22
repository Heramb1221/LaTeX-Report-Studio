'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProject } from '@/hooks/useProjects';
import { TEMPLATE_LIST } from '@/config/templates';
import type { ProjectTemplate } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Form schema ──────────────────────────────────────────────────────────────

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(120, 'Name must be 120 characters or fewer')
    .trim(),
  description: z
    .string()
    .max(300, 'Description must be 300 characters or fewer')
    .trim()
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const router = useRouter();
  const { createProject, isCreating } = useCreateProject();
  const [selectedTemplate, setSelectedTemplate] =
    useState<ProjectTemplate>('ieee_report');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  // Close handler — also resets the form
  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const project = await createProject({
        name: data.name,
        description: data.description,
        template: selectedTemplate,
      });
      reset();
      onOpenChange(false);
      // Navigate straight to the editor for the new project
      router.push(`/editor/${project._id}`);
    } catch {
      // Toast is already shown by useCreateProject's onError handler
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>
            Choose a template and give your project a name to get started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-5 py-2">

            {/* ── Template selector ─────────────────────────────────────── */}
            <div className="space-y-2">
              <Label>Template</Label>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATE_LIST.map((t) => {
                  const selected = selectedTemplate === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTemplate(t.id)}
                      className={cn(
                        'relative rounded-lg border p-3 text-left transition-all',
                        'hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        selected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border bg-card'
                      )}
                    >
                      {selected && (
                        <CheckCircle2 className="absolute top-2.5 right-2.5 h-4 w-4 text-primary" />
                      )}
                      <p className="text-sm font-medium leading-tight pr-6">
                        {t.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t.chapterCount} chapters
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Project name ──────────────────────────────────────────── */}
            <div className="space-y-1.5">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="e.g. Cloud Computing Survey"
                disabled={isCreating}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* ── Description (optional) ────────────────────────────────── */}
            <div className="space-y-1.5">
              <Label htmlFor="project-desc">
                Description{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="project-desc"
                placeholder="Brief description of this project…"
                rows={2}
                disabled={isCreating}
                className="resize-none"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating…' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from './ProjectCard';
import { CreateProjectModal } from './CreateProjectModal';
import { EmptyState } from './EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import type { IProject, ProjectTemplate } from '@/types';
import { PROJECT_TEMPLATE_LABELS } from '@/types';

// ─── Skeleton grid shown while projects are loading ───────────────────────────

function ProjectGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-none border-b-2 bg-transparent p-5 space-y-4">
          <Skeleton className="h-5 w-28 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-9 flex-1 rounded-none" />
            <Skeleton className="h-9 w-9 rounded-none" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

// ─── Shell ────────────────────────────────────────────────────────────────────

export function DashboardShell() {
  const { projects, isLoading } = useProjects();
  const [modalOpen, setModalOpen] = useState(false);

  const count = projects.length;
  const subtitle = isLoading
    ? 'Loading…'
    : count === 0
    ? 'No documents yet'
    : `${count} document${count === 1 ? '' : 's'}`;

  // Group projects by template
  const groupedProjects = useMemo(() => {
    const groups: Partial<Record<ProjectTemplate, IProject[]>> = {};
    projects.forEach(project => {
      if (!groups[project.template]) {
        groups[project.template] = [];
      }
      groups[project.template]!.push(project);
    });
    return groups;
  }, [projects]);

  // Define the order we want to display the sections
  const templateOrder: ProjectTemplate[] = ['ieee_report', 'fyp', 'mini_project', 'seminar'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4"
      >
        <div>
          <h1 className="text-4xl font-serif font-bold tracking-tight">Workspace</h1>
          <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={() => setModalOpen(true)} className="shrink-0 font-semibold rounded-none border-b-2 border-primary/20 hover:border-primary transition-colors">
            <Plus className="h-4 w-4 mr-1.5" />
            New Document
          </Button>
        </motion.div>
      </motion.div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {isLoading ? (
        <ProjectGridSkeleton />
      ) : count === 0 ? (
        <EmptyState onCreateClick={() => setModalOpen(true)} />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-16"
        >
          {templateOrder.map(template => {
            const templateProjects = groupedProjects[template];
            if (!templateProjects || templateProjects.length === 0) return null;

            return (
              <motion.section key={template} variants={itemVariants} className="space-y-6">
                <div className="border-b border-muted pb-2 mb-6">
                  <h2 className="text-2xl font-serif tracking-tight text-foreground/90">
                    {PROJECT_TEMPLATE_LABELS[template]}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templateProjects.map((project) => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>
              </motion.section>
            );
          })}
        </motion.div>
      )}

      {/* ── Create project modal ────────────────────────────────────────── */}
      <CreateProjectModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}

'use client';

// REPLACES src/components/editor/ProjectExplorer.tsx from Phase 8.
// Only the References section changed: rows and "+" now open CitationModal
// via citationModalOpen, and each row has a quick-delete button. Chapters
// and Diagrams sections are unchanged from Phase 8.

import { useState, useRef } from 'react';
import { useEditorStore } from '@/store/editorStore';
import {
  useAddChapter,
  useSaveChapter,
  useRenameChapter,
  useDeleteChapter,
  useReorderChapters,
} from '@/hooks/useChapter';
import { useDeleteDiagram } from '@/hooks/useDiagram';
import { useDeleteCitation } from '@/hooks/useCitation';
import { AddChapterModal } from './AddChapterModal';
import type { IProject, IChapter, IDiagram, IReference } from '@/types';
import { Button } from '@/components/ui/button';
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
import {
  ChevronRight,
  ChevronDown,
  FileText,
  ImageIcon,
  GitFork,
  BookMarked,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  label, count, icon: Icon, isExpanded, onToggle, onAdd, addLabel,
}: {
  label: string; count: number; icon: React.ElementType;
  isExpanded: boolean; onToggle: () => void;
  onAdd?: () => void; addLabel?: string;
}) {
  return (
    <div className="group flex items-center px-2 py-1.5">
      <button
        onClick={onToggle}
        className="flex flex-1 items-center gap-1.5 min-w-0 text-left"
        aria-expanded={isExpanded}
      >
        {isExpanded
          ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors truncate">
          {label}
        </span>
        {count > 0 && (
          <span className="ml-auto shrink-0 text-[10px] leading-none bg-muted text-muted-foreground rounded-full px-1.5 py-0.5">
            {count}
          </span>
        )}
      </button>
      {onAdd && (
        <Button
          variant="ghost" size="icon"
          className="h-5 w-5 ml-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onAdd} title={addLabel} aria-label={addLabel}
        >
          <Plus className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-border mx-3 my-1" aria-hidden />;
}

function EmptyNote({ message }: { message: string }) {
  return (
    <p className="pl-9 pr-3 py-1.5 text-xs text-muted-foreground italic">
      {message}
    </p>
  );
}

// ─── Chapter row (unchanged from Phase 5/8) ───────────────────────────────────

interface ChapterRowProps {
  chapter: IChapter;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  onClick: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function ChapterRow({
  chapter, isActive, isFirst, isLast,
  onClick, onRename, onDelete, onMoveUp, onMoveDown,
}: ChapterRowProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(chapter.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const startRename = () => {
    setRenameValue(chapter.title);
    setIsRenaming(true);
    setTimeout(() => inputRef.current?.select(), 20);
  };

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== chapter.title) onRename(trimmed);
    setIsRenaming(false);
  };

  return (
    <div
      className={cn(
        'group/row flex items-center border-r-2 transition-colors',
        isActive ? 'bg-primary/10 border-primary' : 'border-transparent hover:bg-muted/40',
      )}
    >
      <button
        onClick={onClick}
        onDoubleClick={startRename}
        className={cn(
          'flex-1 flex items-center gap-2 pl-8 pr-1 py-1.5 text-left min-w-0',
          isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        <FileText className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
        {isRenaming ? (
          <input
            ref={inputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
              if (e.key === 'Escape') setIsRenaming(false);
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 min-w-0 text-xs bg-background border border-border rounded px-1 py-0.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        ) : (
          <span className="text-xs truncate">{chapter.title}</span>
        )}
      </button>

      {!isRenaming && (
        <div className="flex items-center opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0 pr-1 gap-0.5">
          <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground"
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }} disabled={isFirst} title="Move up">
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground"
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }} disabled={isLast} title="Move down">
            <ChevronDownIcon className="h-3 w-3" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-destructive"
                onClick={(e) => e.stopPropagation()} title="Delete chapter">
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete chapter?</AlertDialogTitle>
                <AlertDialogDescription>
                  <strong>&ldquo;{chapter.title}&rdquo;</strong> will be permanently deleted. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}

// ─── Diagram row (unchanged from Phase 8) ─────────────────────────────────────

interface DiagramRowProps {
  diagram: IDiagram;
  onClick: () => void;
  onDelete: () => void;
}

function DiagramRow({ diagram, onClick, onDelete }: DiagramRowProps) {
  const hasExport = Boolean(diagram.pngUrl);

  return (
    <div className="group/row flex items-center hover:bg-muted/40 transition-colors">
      <button
        onClick={onClick}
        className="flex-1 flex items-center gap-2 pl-8 pr-1 py-1.5 text-left min-w-0 text-muted-foreground hover:text-foreground"
      >
        <GitFork className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
        <span className="text-xs truncate flex-1">{diagram.name}</span>
        {hasExport && (
          <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" aria-label="Exported" />
        )}
      </button>

      <div className="flex items-center opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0 pr-1">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-destructive"
              onClick={(e) => e.stopPropagation()} title="Delete diagram">
              <Trash2 className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete diagram?</AlertDialogTitle>
              <AlertDialogDescription>
                <strong>&ldquo;{diagram.name}&rdquo;</strong> and its exported PNG will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// ─── Reference row (new in Phase 9) ───────────────────────────────────────────

interface ReferenceRowProps {
  reference: IReference;
  onClick: () => void;
  onDelete: () => void;
}

function ReferenceRow({ reference, onClick, onDelete }: ReferenceRowProps) {
  return (
    <div className="group/row flex items-center hover:bg-muted/40 transition-colors">
      <button
        onClick={onClick}
        className="flex-1 flex items-center gap-2 pl-8 pr-1 py-1.5 text-left min-w-0 text-muted-foreground hover:text-foreground"
      >
        <BookMarked className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
        <span className="text-xs truncate font-mono">{reference.citeKey}</span>
      </button>

      <div className="flex items-center opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0 pr-1">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-destructive"
              onClick={(e) => e.stopPropagation()} title="Delete citation">
              <Trash2 className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this citation?</AlertDialogTitle>
              <AlertDialogDescription>
                <strong>{reference.citeKey}</strong> will be permanently removed.
                Any <code className="text-xs">{'\\cite{' + reference.citeKey + '}'}</code>{' '}
                commands already in your chapters will become broken references.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// ─── Explorer ─────────────────────────────────────────────────────────────────

interface ProjectExplorerProps {
  project: IProject;
}

export function ProjectExplorer({ project }: ProjectExplorerProps) {
  const {
    activeChapterId, saveStatus, editorContent,
    setActiveChapterId, setEditorContent,
    setEditingDiagramId, setNewDiagramModalOpen,
    setImageManagerOpen, setCitationModalOpen,
  } = useEditorStore();

  const projectId = project._id;

  const { saveAsync } = useSaveChapter(projectId);
  const { rename } = useRenameChapter(projectId);
  const { deleteChapter } = useDeleteChapter(projectId);
  const { reorder } = useReorderChapters(projectId);
  const { deleteDiagram } = useDeleteDiagram(projectId);
  const { deleteCitation } = useDeleteCitation(projectId);

  const [expanded, setExpanded] = useState({
    chapters: true, images: false, diagrams: true, references: true,
  });
  const [addModalOpen, setAddModalOpen] = useState(false);

  const toggle = (k: keyof typeof expanded) =>
    setExpanded((p) => ({ ...p, [k]: !p[k] }));

  const sortedChapters = [...project.chapters].sort((a, b) => a.order - b.order);

  const handleChapterClick = async (chapter: IChapter) => {
    if (chapter.id === activeChapterId) return;
    if (saveStatus === 'unsaved' && activeChapterId) {
      await saveAsync(activeChapterId, editorContent);
    }
    setActiveChapterId(chapter.id);
    setEditorContent(chapter.content);
  };

  const moveChapter = (chapterId: string, direction: 'up' | 'down') => {
    const ids = sortedChapters.map((c) => c.id);
    const idx = ids.indexOf(chapterId);
    if (idx < 0) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= ids.length) return;
    const reordered = [...ids];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    reorder(reordered);
  };

  return (
    <nav className="py-2 select-none" aria-label="Project explorer">

      {/* ── Chapters ──────────────────────────────────────────────────── */}
      <SectionHeader
        label="Chapters" count={sortedChapters.length}
        icon={FileText} isExpanded={expanded.chapters}
        onToggle={() => toggle('chapters')}
        onAdd={() => setAddModalOpen(true)} addLabel="Add chapter"
      />
      {expanded.chapters && (
        <div className="mb-1">
          {sortedChapters.length === 0
            ? <EmptyNote message="No chapters yet" />
            : sortedChapters.map((ch, idx) => (
              <ChapterRow
                key={ch.id} chapter={ch}
                isActive={ch.id === activeChapterId}
                isFirst={idx === 0} isLast={idx === sortedChapters.length - 1}
                onClick={() => handleChapterClick(ch)}
                onRename={(title) => rename(ch.id, title)}
                onDelete={() => deleteChapter(ch.id)}
                onMoveUp={() => moveChapter(ch.id, 'up')}
                onMoveDown={() => moveChapter(ch.id, 'down')}
              />
            ))
          }
        </div>
      )}

      <Divider />

      {/* ── Images (functional in Phase 11) ──────────────────────────────── */}
      <SectionHeader
        label="Images" count={project.images?.length ?? 0}
        icon={ImageIcon} isExpanded={expanded.images}
        onToggle={() => toggle('images')}
        onAdd={() => setImageManagerOpen(true)} addLabel="Upload image"
      />
      {expanded.images && (
        <div className="mb-1">
          {(project.images?.length ?? 0) === 0
            ? <EmptyNote message="No images uploaded" />
            : project.images.map((img) => (
              <div key={img.id} className="pl-9 pr-3 py-1.5 text-xs text-muted-foreground truncate hover:text-foreground cursor-pointer">
                {img.originalName}
              </div>
            ))
          }
        </div>
      )}

      <Divider />

      {/* ── Diagrams ──────────────────────────────────────────────────── */}
      <SectionHeader
        label="Diagrams" count={project.diagrams?.length ?? 0}
        icon={GitFork} isExpanded={expanded.diagrams}
        onToggle={() => toggle('diagrams')}
        onAdd={() => setNewDiagramModalOpen(true)} addLabel="New diagram"
      />
      {expanded.diagrams && (
        <div className="mb-1">
          {(project.diagrams?.length ?? 0) === 0
            ? <EmptyNote message="No diagrams yet" />
            : project.diagrams.map((d) => (
              <DiagramRow
                key={d.id}
                diagram={d}
                onClick={() => setEditingDiagramId(d.id)}
                onDelete={() => deleteDiagram(d.id)}
              />
            ))
          }
        </div>
      )}

      <Divider />

      {/* ── References (functional now) ──────────────────────────────────── */}
      <SectionHeader
        label="References" count={project.references?.length ?? 0}
        icon={BookMarked} isExpanded={expanded.references}
        onToggle={() => toggle('references')}
        onAdd={() => setCitationModalOpen(true)} addLabel="Add citation"
      />
      {expanded.references && (
        <div className="mb-1">
          {(project.references?.length ?? 0) === 0
            ? <EmptyNote message="No references yet" />
            : project.references.map((ref) => (
              <ReferenceRow
                key={ref.id}
                reference={ref}
                onClick={() => setCitationModalOpen(true)}
                onDelete={() => deleteCitation(ref.id)}
              />
            ))
          }
        </div>
      )}

      <AddChapterModal
        projectId={projectId}
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
      />
    </nav>
  );
}

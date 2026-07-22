'use client';

import { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useCreateDiagram, useDeleteDiagram } from '@/hooks/useDiagram';
import { DIAGRAM_TYPE_LIST, type DiagramType } from '@/lib/diagram/constants';
import type { IProject } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { GitFork, Trash2, Pencil, Copy, CornerDownLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface DiagramToolProps {
  project: IProject;
}

export function DiagramTool({ project }: DiagramToolProps) {
  const { setEditingDiagramId } = useEditorStore();
  const { toast } = useToast();

  const { createDiagram, isCreating } = useCreateDiagram(project._id);
  const { deleteDiagram } = useDeleteDiagram(project._id);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<DiagramType>('architecture');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    try {
      await createDiagram({ name: trimmed, diagramType: newType });
      setNewName('');
    } catch {
      // Error handled by hook
    }
  };

  const handleInsert = (latexCommand: string) => {
    if (typeof window !== 'undefined' && window.__lrsInsertAtCursor) {
      window.__lrsInsertAtCursor(latexCommand);
    } else {
      toast({
        variant: 'destructive',
        title: 'Could not insert',
        description: 'Click inside the editor first, then try again.',
      });
    }
  };

  const handleCopy = async (latexCommand: string) => {
    await navigator.clipboard.writeText(latexCommand);
    toast({ title: 'Copied to clipboard' });
  };

  return (
    <div className="flex h-full min-h-0 bg-background divide-x">
      {/* Left: Create Form */}
      <div className="w-1/3 min-w-[250px] p-4 flex flex-col gap-4 bg-muted/5">
        <div>
          <h3 className="text-sm font-semibold mb-1">New Diagram</h3>
          <p className="text-xs text-muted-foreground">Create a new Draw.io diagram</p>
        </div>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="diagram-name" className="text-[10px] uppercase text-muted-foreground">Name</Label>
            <Input
              id="diagram-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Architecture"
              className="h-8 text-xs bg-background"
              disabled={isCreating}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="diagram-type" className="text-[10px] uppercase text-muted-foreground">Type</Label>
            <Select value={newType} onValueChange={(v) => setNewType(v as DiagramType)} disabled={isCreating}>
              <SelectTrigger id="diagram-type" className="h-8 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIAGRAM_TYPE_LIST.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="text-xs">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" size="sm" className="w-full h-8 text-xs" disabled={isCreating || !newName.trim()}>
            {isCreating ? 'Creating…' : 'Create Diagram'}
          </Button>
        </form>
      </div>

      {/* Right: Existing Diagrams */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-4 py-2 border-b bg-muted/5 shrink-0">
          <h3 className="text-sm font-semibold text-muted-foreground">Your Diagrams ({project.diagrams.length})</h3>
        </div>
        <ScrollArea className="flex-1 min-h-0">
          {project.diagrams.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-muted-foreground">No diagrams yet. Create one on the left.</p>
          ) : (
            <ul className="divide-y">
              {project.diagrams.map((d) => (
                <li key={d.id} className="p-3 hover:bg-muted/10 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center shrink-0">
                        <GitFork className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{d.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{d.diagramType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.latexCommand && (
                        <>
                          <Button size="sm" variant="ghost" className="h-7 text-[10px] gap-1 px-2" onClick={() => handleCopy(d.latexCommand!)}>
                            <Copy className="h-3 w-3" /> Copy
                          </Button>
                          <Button size="sm" variant="secondary" className="h-7 text-[10px] gap-1 px-2" onClick={() => handleInsert(d.latexCommand!)}>
                            <CornerDownLeft className="h-3 w-3" /> Insert
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px] gap-1 px-2 border-primary/20 hover:bg-primary/5 text-primary"
                        onClick={() => setEditingDiagramId(d.id)}
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-7 text-[10px] gap-1 px-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {d.name}?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently remove the diagram.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteDiagram(d.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useCreateDiagram } from '@/hooks/useDiagram';
import { DIAGRAM_TYPE_LIST, type DiagramType } from '@/lib/diagram/constants';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface NewDiagramModalProps {
  projectId: string;
}

export function NewDiagramModal({ projectId }: NewDiagramModalProps) {
  const { newDiagramModalOpen, setNewDiagramModalOpen } = useEditorStore();
  const { createDiagram, isCreating } = useCreateDiagram(projectId);

  const [name, setName] = useState('');
  const [diagramType, setDiagramType] = useState<DiagramType>('architecture');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newDiagramModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setName('');
      setDiagramType('architecture');
      setError('');
    }
  }, [newDiagramModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError('Diagram name is required');
      return;
    }

    try {
      await createDiagram({ name: trimmed, diagramType });
      setNewDiagramModalOpen(false);
      // useCreateDiagram's onSuccess already sets editingDiagramId,
      // which causes DiagramModal to open automatically.
    } catch {
      // Error toast shown by useCreateDiagram's onError handler
    }
  };

  return (
    <Dialog open={newDiagramModalOpen} onOpenChange={setNewDiagramModalOpen}>
      <DialogContent className="max-w-sm bg-background/80 backdrop-blur-2xl border-border/50 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.5)]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">New Diagram</DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            Choose a name and category. You&apos;ll get the full draw.io editor
            next, with shape libraries for every diagram type.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="py-2 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="diagram-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Diagram Name
              </Label>
              <Input
                id="diagram-name"
                ref={inputRef}
                placeholder="e.g. System Architecture"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                disabled={isCreating}
                className="bg-background/50 border-border/50 focus-visible:ring-1 transition-all"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="diagram-type" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Category
              </Label>
              <Select
                value={diagramType}
                onValueChange={(v) => setDiagramType(v as DiagramType)}
                disabled={isCreating}
              >
                <SelectTrigger id="diagram-type" className="bg-background/50 border-border/50 focus:ring-1 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background/90 backdrop-blur-xl border-border/50">
                  {DIAGRAM_TYPE_LIST.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2 border-t border-border/30 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setNewDiagramModalOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !name.trim()} className="shadow-md">
              {isCreating ? 'CreatingΓÇª' : 'Create & Open Editor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

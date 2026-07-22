'use client';

import { useState, useRef, useEffect } from 'react';
import { useAddChapter } from '@/hooks/useChapter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AddChapterModalProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddChapterModal({
  projectId,
  open,
  onOpenChange,
}: AddChapterModalProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { addChapter, isAdding } = useAddChapter(projectId);

  // Auto-focus the input when the dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setTitle('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      setError('Chapter title is required');
      return;
    }
    if (trimmed.length > 120) {
      setError('Title must be 120 characters or fewer');
      return;
    }

    try {
      await addChapter(trimmed);
      onOpenChange(false);
    } catch {
      // Error toast is shown by useAddChapter's onError handler
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Chapter</DialogTitle>
          <DialogDescription>
            The new chapter will be added after the last existing one.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} noValidate>
          <div className="py-2 space-y-1.5">
            <Label htmlFor="chapter-title">Chapter Title</Label>
            <Input
              id="chapter-title"
              ref={inputRef}
              placeholder="e.g. Methodology"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              disabled={isAdding}
            />
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter className="mt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isAdding}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isAdding || !title.trim()}>
              {isAdding ? 'Adding…' : 'Add Chapter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

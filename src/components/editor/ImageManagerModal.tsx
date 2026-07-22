'use client';

import { useRef, useState, useCallback } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useUploadImage, useDeleteImage } from '@/hooks/useImage';
import type { IProject, IImage } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { useToast } from '@/hooks/use-toast';
import {
  ImagePlus,
  Trash2,
  CornerDownLeft,
  Loader2,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Accepted MIME types ──────────────────────────────────────────────────────

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_ACCEPT = 'image/jpeg,image/png,image/gif,image/webp';
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// ─── Upload zone ──────────────────────────────────────────────────────────────

interface UploadZoneProps {
  onFile: (file: File) => void;
  isUploading: boolean;
}

function UploadZone({ onFile, isUploading }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const validate = (file: File): boolean => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Unsupported file type',
        description: `"${file.name}" is not a JPG, PNG, GIF, or WebP image.`,
      });
      return false;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: `"${file.name}" exceeds the ${MAX_SIZE_MB} MB limit.`,
      });
      return false;
    }
    return true;
  };

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      for (const file of list) {
        if (validate(file)) onFile(file);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onFile]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
        isDragOver
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/20',
        isUploading && 'pointer-events-none opacity-60'
      )}
      onClick={() => !isUploading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {isUploading ? (
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      ) : (
        <Upload className="h-8 w-8 text-muted-foreground" />
      )}

      <div>
        <p className="text-sm font-medium">
          {isUploading ? 'Uploading…' : 'Drop images here or click to browse'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          JPG, PNG, GIF, WebP · Max {MAX_SIZE_MB} MB each
        </p>
      </div>
    </div>
  );
}

// ─── Gallery image card ───────────────────────────────────────────────────────

interface ImageCardProps {
  image: IImage;
  onInsert: (img: IImage) => void;
  onDelete: (id: string) => void;
}

function ImageCard({ image, onInsert, onDelete }: ImageCardProps) {
  return (
    <div className="group relative rounded-lg border bg-muted/20 overflow-hidden">
      {/* Thumbnail */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.publicUrl}
        alt={image.originalName}
        className="w-full h-24 object-cover"
        loading="lazy"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
        <Button
          size="sm"
          variant="secondary"
          className="w-full h-7 text-xs gap-1"
          onClick={() => onInsert(image)}
        >
          <CornerDownLeft className="h-3 w-3" />
          Insert
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="destructive"
              className="w-full h-7 text-xs gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this image?</AlertDialogTitle>
              <AlertDialogDescription>
                <strong>{image.originalName}</strong> will be permanently
                removed from this project and from storage. Any{' '}
                <code className="text-xs">\\includegraphics</code> commands
                referencing it will produce a missing-file warning when
                compiled.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(image.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Filename label */}
      <div className="px-2 py-1.5 border-t">
        <p className="text-[11px] text-muted-foreground truncate" title={image.originalName}>
          {image.originalName}
        </p>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ImageManagerModalProps {
  project: IProject;
}

export function ImageManagerModal({ project }: ImageManagerModalProps) {
  const { imageManagerOpen, setImageManagerOpen } = useEditorStore();
  const { uploadImage, isUploading } = useUploadImage(project._id);
  const { deleteImage } = useDeleteImage(project._id);
  const { toast } = useToast();

  const images = project.images ?? [];

  const handleInsert = (image: IImage) => {
    if (typeof window !== 'undefined' && window.__lrsInsertAtCursor) {
      window.__lrsInsertAtCursor(image.latexCommand);
      setImageManagerOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Could not insert',
        description: 'Click inside the editor first, then try again.',
      });
    }
  };

  return (
    <Dialog open={imageManagerOpen} onOpenChange={setImageManagerOpen}>
      <DialogContent className="max-w-2xl w-full flex flex-col max-h-[85vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <ImagePlus className="h-4 w-4" />
            Image Manager
          </DialogTitle>
          <DialogDescription>
            Upload images to use in your report. Click an image to insert a{' '}
            <code className="text-xs">{'\\begin{figure}'}</code> block at the
            cursor.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Upload zone */}
          <UploadZone onFile={uploadImage} isUploading={isUploading} />

          {/* Gallery */}
          {images.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No images uploaded yet. Add one above.
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Uploaded Images ({images.length})
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((img) => (
                  <ImageCard
                    key={img.id}
                    image={img}
                    onInsert={handleInsert}
                    onDelete={deleteImage}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end px-6 py-4 border-t shrink-0">
          <Button variant="outline" onClick={() => setImageManagerOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

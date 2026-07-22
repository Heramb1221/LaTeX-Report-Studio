'use client';

import { useState, useMemo } from 'react';
import { useEditorStore } from '@/store/editorStore';
import {
  useCreateCitation,
  useUpdateCitation,
  useDeleteCitation,
} from '@/hooks/useCitation';
import {
  buildBibtex,
  buildBibFile,
} from '@/lib/bibtex/generator';
import {
  ENTRY_TYPES,
  ENTRY_TYPE_LABELS,
  FIELD_DEFS,
} from '@/lib/bibtex/fieldConfig';
import type { IProject, IReference, IReferenceFields } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  DialogHeader,
  DialogTitle,
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
import { Copy, Pencil, Trash2, Download, X, BookMarked } from 'lucide-react';

const EMPTY_FIELDS: IReferenceFields = { title: '', author: '', year: '' };

interface CitationModalProps {
  project: IProject;
}

export function CitationModal({ project }: CitationModalProps) {
  const { citationModalOpen, setCitationModalOpen } = useEditorStore();
  const { toast } = useToast();

  const { createCitation, isCreating } = useCreateCitation(project._id);
  const { updateCitation, isUpdating } = useUpdateCitation(project._id);
  const { deleteCitation } = useDeleteCitation(project._id);

  const [entryType, setEntryType] = useState<IReference['entryType']>('article');
  const [fields, setFields] = useState<IReferenceFields>(EMPTY_FIELDS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof IReferenceFields, string>>>({});

  const isSaving = isCreating || isUpdating;
  const visibleFields = FIELD_DEFS[entryType];

  // ── Live BibTeX preview ────────────────────────────────────────────────────
  // Uses 'PREVIEW' as a placeholder key when creating (real key is generated
  // server-side on submit, since it needs to check for collisions against
  // existing references).
  const previewCiteKey = editingId
    ? project.references.find((r) => r.id === editingId)?.citeKey ?? 'PREVIEW'
    : 'PREVIEW';
  const livePreview = useMemo(
    () => buildBibtex({ entryType, fields: fields as unknown as Record<string, string>, citeKey: previewCiteKey }),
    [entryType, fields, previewCiteKey]
  );

  // ── Form helpers ───────────────────────────────────────────────────────────

  const updateField = (key: keyof IReferenceFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const resetForm = () => {
    setEntryType('article');
    setFields(EMPTY_FIELDS);
    setEditingId(null);
    setErrors({});
  };

  const handleEdit = (ref: IReference) => {
    setEntryType(ref.entryType);
    setFields({ ...EMPTY_FIELDS, ...ref.fields });
    setEditingId(ref.id);
    setErrors({});
  };

  const validate = (): boolean => {
    const requiredDefs = FIELD_DEFS[entryType].filter(f => f.required);
    const newErrors: Partial<Record<keyof IReferenceFields, string>> = {};
    for (const def of requiredDefs) {
      const key = def.key as keyof IReferenceFields;
      if (!fields[key] || !fields[key]!.trim()) {
        newErrors[key] = `${def.label} is required`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editingId) {
        await updateCitation({ citationId: editingId, entryType, fields });
      } else {
        await createCitation({ entryType, fields });
      }
      resetForm();
    } catch {
      // Error toast already shown by the mutation's onError handler
    }
  };

  const handleCopyCite = async (citeKey: string) => {
    await navigator.clipboard.writeText(`\\cite{${citeKey}}`);
    toast({ title: 'Copied', description: `\\cite{${citeKey}}` });
  };

  const handleDownloadBib = () => {
    const content = buildBibFile(project.references.map(r => r.bibtex));
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'references.bib';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClose = (open: boolean) => {
    if (!open) resetForm();
    setCitationModalOpen(open);
  };

  return (
    <Dialog open={citationModalOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0">

        <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <BookMarked className="h-4 w-4" />
            Citation Manager
          </DialogTitle>
          <DialogDescription>
            IEEE-format references. BibTeX is generated automatically as you type.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 grid grid-cols-2 divide-x">

          {/* ── Left: Add / Edit form ──────────────────────────────────── */}
          <ScrollArea className="h-full">
            <form onSubmit={handleSubmit} className="p-5 space-y-4" noValidate>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  {editingId ? 'Edit Citation' : 'Add New Citation'}
                </h3>
                {editingId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs gap-1"
                    onClick={resetForm}
                  >
                    <X className="h-3 w-3" />
                    Cancel edit
                  </Button>
                )}
              </div>

              {/* Type selector */}
              <div className="space-y-1.5">
                <Label htmlFor="entry-type">Type</Label>
                <Select
                  value={entryType}
                  onValueChange={(v) => setEntryType(v as IReference['entryType'])}
                  disabled={isSaving}
                >
                  <SelectTrigger id="entry-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTRY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {ENTRY_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic fields */}
              {visibleFields.map((def) => {
                const key = def.key as keyof IReferenceFields;
                return (
                <div key={key} className="space-y-1.5">
                  <Label htmlFor={`field-${key}`}>{def.label}</Label>
                  <Input
                    id={`field-${key}`}
                    value={fields[key] ?? ''}
                    onChange={(e) => updateField(key, e.target.value)}
                    placeholder={def.placeholder}
                    disabled={isSaving}
                  />
                  {errors[key] && (
                    <p className="text-xs text-destructive">{errors[key]}</p>
                  )}
                </div>
                );
              })}

              {/* Live preview */}
              <div className="space-y-1.5 pt-1">
                <Label className="text-xs text-muted-foreground">
                  Generated BibTeX
                </Label>
                <pre className="text-[11px] leading-relaxed bg-muted/40 border rounded-md p-3 font-mono whitespace-pre-wrap break-all">
                  {livePreview}
                </pre>
              </div>

              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving
                  ? 'Saving…'
                  : editingId
                  ? 'Update Citation'
                  : 'Add to References'}
              </Button>
            </form>
          </ScrollArea>

          {/* ── Right: Saved references ────────────────────────────────── */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
              <h3 className="text-sm font-semibold">
                Saved References
                <span className="text-muted-foreground font-normal ml-1.5">
                  ({project.references.length})
                </span>
              </h3>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5"
                onClick={handleDownloadBib}
                disabled={project.references.length === 0}
              >
                <Download className="h-3.5 w-3.5" />
                .bib
              </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              {project.references.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No references yet. Add one on the left.
                </p>
              ) : (
                <ul className="divide-y">
                  {project.references.map((ref) => (
                    <li key={ref.id} className="p-4 group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <code className="text-xs font-mono font-semibold text-primary">
                              {ref.citeKey}
                            </code>
                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-normal">
                              {ENTRY_TYPE_LABELS[ref.entryType]}
                            </Badge>
                          </div>
                          <p className="text-sm truncate">{ref.fields.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {ref.fields.author} · {ref.fields.year}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs gap-1 px-2"
                          onClick={() => handleCopyCite(ref.citeKey)}
                        >
                          <Copy className="h-3 w-3" />
                          Copy \cite{'{}'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs gap-1 px-2"
                          onClick={() => handleEdit(ref)}
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs gap-1 px-2 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this citation?</AlertDialogTitle>
                              <AlertDialogDescription>
                                <strong>&ldquo;{ref.fields.title}&rdquo;</strong> ({ref.citeKey})
                                will be permanently removed. Any{' '}
                                <code className="text-xs">\cite{'{' + ref.citeKey + '}'}</code>{' '}
                                commands already in your chapters will become broken references.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCitation(ref.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

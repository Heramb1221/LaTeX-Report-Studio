'use client';

import { useState, useMemo } from 'react';
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
import { Copy, Pencil, Trash2, Download, X } from 'lucide-react';

const EMPTY_FIELDS: IReferenceFields = { title: '', author: '', year: '' };

interface CitationToolProps {
  project: IProject;
}

export function CitationTool({ project }: CitationToolProps) {
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

  const previewCiteKey = editingId
    ? project.references.find((r) => r.id === editingId)?.citeKey ?? 'PREVIEW'
    : 'PREVIEW';
  const livePreview = useMemo(
    () => buildBibtex({ entryType, fields: fields as unknown as Record<string, string>, citeKey: previewCiteKey }),
    [entryType, fields, previewCiteKey]
  );

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
      // Error toast handled by useCitation
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

  return (
    <div className="flex h-full min-h-0 bg-background divide-x">
      {/* ── Left: Add / Edit form ──────────────────────────────────── */}
      <div className="w-1/2 min-h-0 flex flex-col">
        <ScrollArea className="flex-1">
          <form onSubmit={handleSubmit} className="p-4 space-y-4" noValidate>
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

            <div className="space-y-1.5">
              <Label htmlFor="entry-type" className="text-xs">Type</Label>
              <Select
                value={entryType}
                onValueChange={(v) => setEntryType(v as IReference['entryType'])}
                disabled={isSaving}
              >
                <SelectTrigger id="entry-type" className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTRY_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">
                      {ENTRY_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {visibleFields.map((def) => {
              const key = def.key as keyof IReferenceFields;
              return (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={`field-${key}`} className="text-xs">{def.label}</Label>
                <Input
                  id={`field-${key}`}
                  value={fields[key] ?? ''}
                  onChange={(e) => updateField(key, e.target.value)}
                  placeholder={def.placeholder}
                  disabled={isSaving}
                  className="h-8 text-xs"
                />
                {errors[key] && (
                  <p className="text-[10px] text-destructive">{errors[key]}</p>
                )}
              </div>
              );
            })}

            <div className="space-y-1.5 pt-1">
              <Label className="text-xs text-muted-foreground">Generated BibTeX</Label>
              <pre className="text-[10px] leading-relaxed bg-muted/40 border rounded-md p-2 font-mono whitespace-pre-wrap break-all">
                {livePreview}
              </pre>
            </div>

            <Button type="submit" size="sm" className="w-full h-8 text-xs" disabled={isSaving}>
              {isSaving
                ? 'Saving…'
                : editingId
                ? 'Update Citation'
                : 'Add to References'}
            </Button>
          </form>
        </ScrollArea>
      </div>

      {/* ── Right: Saved references ────────────────────────────────── */}
      <div className="w-1/2 flex flex-col min-h-0 bg-muted/5">
        <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Saved References
            <span className="font-normal ml-1.5">
              ({project.references.length})
            </span>
          </h3>
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-xs gap-1.5"
            onClick={handleDownloadBib}
            disabled={project.references.length === 0}
          >
            <Download className="h-3 w-3" />
            .bib
          </Button>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          {project.references.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-muted-foreground">
              No references yet. Add one on the left.
            </p>
          ) : (
            <ul className="divide-y">
              {project.references.map((ref) => (
                <li key={ref.id} className="p-3 group hover:bg-muted/10 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <code className="text-[10px] font-mono font-semibold text-primary">
                          {ref.citeKey}
                        </code>
                        <Badge variant="secondary" className="text-[9px] h-3.5 px-1 font-normal uppercase tracking-wider">
                          {ENTRY_TYPE_LABELS[ref.entryType]}
                        </Badge>
                      </div>
                      <p className="text-xs font-medium truncate">{ref.fields.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {ref.fields.author} · {ref.fields.year}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-6 text-[10px] gap-1 px-2"
                      onClick={() => handleCopyCite(ref.citeKey)}
                    >
                      <Copy className="h-3 w-3" />
                      Copy \cite
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px] gap-1 px-2"
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
                          className="h-6 text-[10px] gap-1 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
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
                            will be permanently removed.
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
  );
}

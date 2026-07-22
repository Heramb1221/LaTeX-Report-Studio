'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useCreateDiagram, useSaveDiagramXml, useExportDiagramPng, useDeleteDiagram } from '@/hooks/useDiagram';
import { DRAWIO_EMBED_URL, DRAWIO_ORIGIN, DIAGRAM_TYPE_LIST, type DiagramType } from '@/lib/diagram/constants';
import type { IProject, IDiagram } from '@/types';
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
import { X, Save, ImageDown, Loader2, CheckCircle2, GitFork, Trash2, Pencil, Copy, CornerDownLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

// ─── Message shape from draw.io ────────────────────────────────────────────────
interface DrawioIncomingMessage {
  event: string;
  xml?: string;
  data?: string;
  [key: string]: unknown;
}

interface DiagramToolProps {
  project: IProject;
}

export function DiagramTool({ project }: DiagramToolProps) {
  const { editingDiagramId, setEditingDiagramId } = useEditorStore();
  const diagram = project.diagrams.find((d) => d.id === editingDiagramId) ?? null;
  const isEditing = diagram !== null;

  const { toast } = useToast();

  // ─── List View State ──────────────────────────────────────────────────────────
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

  // ─── Editor View State ────────────────────────────────────────────────────────
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const currentXmlRef = useRef('');
  const lastSavedXmlRef = useRef('');
  const exportResolveRef = useRef<((dataUrl: string) => void) | null>(null);

  const [isDirty, setIsDirty] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [exportResult, setExportResult] = useState<{ pngUrl: string; latexCommand: string } | null>(null);

  const { save, isSaving } = useSaveDiagramXml(project._id);
  const { exportPng, isExporting } = useExportDiagramPng(project._id);

  useEffect(() => {
    if (!diagram) return;
    currentXmlRef.current = diagram.drawioXml;
    lastSavedXmlRef.current = diagram.drawioXml;
    setIsDirty(false);
    setExportResult(
      diagram.pngUrl && diagram.latexCommand
        ? { pngUrl: diagram.pngUrl, latexCommand: diagram.latexCommand }
        : null
    );
  }, [diagram?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendAction = useCallback((action: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(action), DRAWIO_ORIGIN);
  }, []);

  useEffect(() => {
    if (!isEditing || !diagram) return;
    function handleMessage(ev: MessageEvent) {
      if (ev.origin !== DRAWIO_ORIGIN) return;
      let msg: DrawioIncomingMessage;
      try { msg = JSON.parse(ev.data as string); } catch { return; }

      switch (msg.event) {
        case 'init':
          sendAction({ action: 'load', xml: diagram?.drawioXml ?? '', autosave: 1 });
          break;
        case 'autosave':
          if (typeof msg.xml === 'string') {
            currentXmlRef.current = msg.xml;
            setIsDirty(msg.xml !== lastSavedXmlRef.current);
          }
          break;
        case 'export':
          if (typeof msg.xml === 'string') {
            currentXmlRef.current = msg.xml;
          }
          sendAction({ action: 'spinner', show: false });
          if (exportResolveRef.current && typeof msg.data === 'string') {
            exportResolveRef.current(msg.data);
            exportResolveRef.current = null;
          }
          break;
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isEditing, diagram, sendAction]);

  const handleSave = useCallback(async () => {
    if (!diagram) return;
    await save(diagram.id, currentXmlRef.current);
    lastSavedXmlRef.current = currentXmlRef.current;
    setIsDirty(false);
  }, [diagram, save]);

  const requestExportFromDrawio = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      exportResolveRef.current = resolve;
      sendAction({ action: 'spinner', show: true, message: 'Exporting diagram…' });
      sendAction({
        action: 'export',
        format: 'png',
        background: '#ffffff',
        bg: '#ffffff',
        transparent: false,
        xml: currentXmlRef.current,
      });
    });
  }, [sendAction]);

  const handleExportPng = useCallback(async () => {
    if (!diagram) return;
    try {
      const dataUrl = await requestExportFromDrawio();
      let finalDataUrl = dataUrl;
      if (finalDataUrl.startsWith('<')) return; // Failed to generate PNG
      if (!finalDataUrl.startsWith('data:')) finalDataUrl = 'data:image/png;base64,' + finalDataUrl;
      
      const result = await exportPng({
        diagramId: diagram.id,
        drawioXml: currentXmlRef.current,
        pngDataUrl: finalDataUrl,
      });
      lastSavedXmlRef.current = currentXmlRef.current;
      setIsDirty(false);
      setExportResult(result);
      toast({ title: 'Exported successfully' });
    } catch (err) {
      console.error('Export PNG failed:', err);
    }
  }, [diagram, requestExportFromDrawio, exportPng, toast]);

  const requestClose = useCallback(() => {
    if (isDirty) setCloseConfirmOpen(true);
    else setEditingDiagramId(null);
  }, [isDirty, setEditingDiagramId]);

  const confirmDiscardAndClose = useCallback(() => {
    setCloseConfirmOpen(false);
    setEditingDiagramId(null);
  }, [setEditingDiagramId]);

  const confirmSaveAndClose = useCallback(async () => {
    await handleSave();
    setCloseConfirmOpen(false);
    setEditingDiagramId(null);
  }, [handleSave, setEditingDiagramId]);

  // ─── Render List View ─────────────────────────────────────────────────────────
  if (!isEditing) {
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
                        <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 px-2 border-primary/20 hover:bg-primary/5 text-primary" onClick={() => setEditingDiagramId(d.id)}>
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

  // ─── Render Editor View ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Editor Toolbar */}
      <div className="h-10 border-b shrink-0 flex items-center justify-between px-3 bg-muted/10">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={requestClose}>
            <CornerDownLeft className="h-3 w-3 mr-1" /> Back to list
          </Button>
          <div className="h-4 w-[1px] bg-border mx-1" />
          <span className="text-xs font-semibold">{diagram?.name}</span>
          {isDirty && <span className="text-[10px] text-amber-500 font-medium ml-2">• Unsaved</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-xs bg-background" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
            Save
          </Button>
          <Button size="sm" variant="default" className="h-7 text-xs" onClick={handleExportPng} disabled={isExporting}>
            {isExporting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <ImageDown className="h-3 w-3 mr-1" />}
            Export PNG
          </Button>
        </div>
      </div>

      {exportResult && (
        <div className="flex items-center justify-between gap-3 px-3 py-1.5 bg-green-500/10 border-b border-green-500/20 shrink-0">
          <span className="flex items-center gap-1.5 text-[11px] text-green-700 dark:text-green-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Exported successfully
          </span>
          <Button size="sm" variant="secondary" className="h-6 text-[10px] px-2 bg-green-500/20 text-green-800 hover:bg-green-500/30 border-none" onClick={() => handleInsert(exportResult.latexCommand)}>
            Insert into Document
          </Button>
        </div>
      )}

      {/* Draw.io Iframe */}
      <iframe
        key={diagram?.id}
        ref={iframeRef}
        src={DRAWIO_EMBED_URL}
        title="Diagram editor"
        className="flex-1 w-full border-0 bg-white min-h-0"
      />

      <AlertDialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes to &ldquo;{diagram?.name}&rdquo;. Save before closing, or discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCloseConfirmOpen(false)}>Keep Editing</AlertDialogCancel>
            <Button variant="outline" onClick={confirmDiscardAndClose}>Discard</Button>
            <Button onClick={confirmSaveAndClose}>Save & Close</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

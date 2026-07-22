'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEditorStore } from '@/store/editorStore';
import { useSaveDiagramXml, useExportDiagramPng } from '@/hooks/useDiagram';
import { DRAWIO_EMBED_URL, DRAWIO_ORIGIN } from '@/lib/diagram/constants';
import type { IProject } from '@/types';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X, Save, ImageDown, Loader2, CheckCircle2 } from 'lucide-react';

// ─── Message shape from draw.io ─────────────────────────────────────────────
interface DrawioIncomingMessage {
  event: string;
  xml?: string;
  data?: string;
  [key: string]: unknown;
}

interface DiagramModalProps {
  project: IProject;
}

export function DiagramModal({ project }: DiagramModalProps) {
  const { editingDiagramId, setEditingDiagramId } = useEditorStore();
  const diagram = project.diagrams.find((d) => d.id === editingDiagramId) ?? null;
  const isOpen = editingDiagramId !== null;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const currentXmlRef = useRef('');
  const lastSavedXmlRef = useRef('');
  const exportResolveRef = useRef<((dataUrl: string) => void) | null>(null);

  const [isDirty, setIsDirty] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [exportResult, setExportResult] = useState<{ pngUrl: string; latexCommand: string } | null>(null);

  const { save, isSaving } = useSaveDiagramXml(project._id);
  const { exportPng, isExporting } = useExportDiagramPng(project._id);

  // Reset state when a different diagram is opened
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

  // Listen for messages from draw.io iframe
  useEffect(() => {
    if (!isOpen || !diagram) return;
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
  }, [isOpen, diagram, sendAction]);

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
      if (finalDataUrl.startsWith('<')) {
        console.error('Draw.io returned XML instead of a PNG image.', finalDataUrl);
        return;
      }
      if (!finalDataUrl.startsWith('data:')) {
        finalDataUrl = 'data:image/png;base64,' + finalDataUrl;
      }

      // Trigger local download
      const res = await fetch(finalDataUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const safeName = diagram.name.replace(/[^a-z0-9]/gi, '_') || 'diagram';
      link.download = `${safeName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

      // Save to cloud for LaTeX insertion command
      const result = await exportPng({
        diagramId: diagram.id,
        drawioXml: currentXmlRef.current,
        pngDataUrl: finalDataUrl,
      });
      lastSavedXmlRef.current = currentXmlRef.current;
      setIsDirty(false);
      setExportResult(result);
    } catch (err) {
      console.error('Export PNG failed:', err);
    }
  }, [diagram, requestExportFromDrawio, exportPng]);

  // Insert the figure block at the Monaco cursor
  const handleInsert = useCallback(() => {
    if (!exportResult) return;
    if (typeof window !== 'undefined' && window.__lrsInsertAtCursor) {
      window.__lrsInsertAtCursor(exportResult.latexCommand);
    }
  }, [exportResult]);

  // Close handling with unsaved-changes guard
  const requestClose = useCallback(() => {
    if (isDirty) {
      setCloseConfirmOpen(true);
    } else {
      setEditingDiagramId(null);
    }
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

  return (
    <AnimatePresence>
      {isOpen && diagram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-12 pointer-events-none">
          {/* Glassmorphic backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
            onClick={requestClose}
          />

          {/* Floating Document Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="relative flex flex-col w-full h-full max-w-7xl bg-background rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden border border-border/50 pointer-events-auto"
          >
            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="h-14 border-b bg-muted/30 backdrop-blur-md shrink-0 flex items-center justify-between px-5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium truncate">{diagram.name}</span>
                {isDirty && (
                  <span className="text-xs text-amber-500 shrink-0">• Unsaved</span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Save
                </Button>

                <Button size="sm" onClick={handleExportPng} disabled={isExporting}>
                  {isExporting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <ImageDown className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Export PNG
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={requestClose}
                  aria-label="Close diagram editor"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* ── Export success banner ─────────────────────────────────────── */}
            {exportResult && (
              <div className="flex items-center justify-between gap-3 px-4 py-2 bg-green-500/10 border-b border-green-500/20 shrink-0">
                <span className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Exported successfully — ready to insert into your document
                </span>
                <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={handleInsert}>
                  Insert into Document
                </Button>
              </div>
            )}

            {/* ── draw.io iframe ────────────────────────────────────────────── */}
            <iframe
              key={diagram.id}
              ref={iframeRef}
              src={DRAWIO_EMBED_URL}
              title="Diagram editor"
              className="flex-1 w-full border-0 bg-white"
            />

            {/* ── Close confirmation ────────────────────────────────────────── */}
            <AlertDialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
                  <AlertDialogDescription>
                    You have unsaved changes to &ldquo;{diagram.name}&rdquo;. Save
                    before closing, or discard them?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCloseConfirmOpen(false)}
                  >
                    Keep Editing
                  </Button>
                  <Button variant="outline" size="sm" onClick={confirmDiscardAndClose}>
                    Discard
                  </Button>
                  <Button size="sm" onClick={confirmSaveAndClose}>
                    Save &amp; Close
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

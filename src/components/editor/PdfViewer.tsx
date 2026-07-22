'use client';

// REPLACES src/components/editor/PdfViewer.tsx from Phase 4.
// Renders the compiled PDF using the browser's native PDF viewer inside an
// <iframe>, fed by a Blob URL built from the base64 string in the store.
//
// Why an iframe instead of pdfjs-dist's canvas API:
//   • Zero extra bundle weight — no pdf.worker.js to configure
//   • Browser-native viewer gives free zoom, search, page nav, print
//   • Simpler code, fewer edge cases for an MVP
// pdfjs-dist is still installed (Phase 1) in case a custom in-app viewer
// with page thumbnails is wanted later — this approach just doesn't need it yet.

import { useEffect, useMemo, useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, AlertCircle, RotateCw } from 'lucide-react';

// ─── base64 → Blob URL ────────────────────────────────────────────────────────

function base64ToBlobUrl(base64: string): string {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PdfViewer() {
  const { isCompiling, compiledPdfBase64, compileError } = useEditorStore();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Rebuild the blob URL whenever the compiled PDF changes.
  // Always revoke the previous URL to avoid leaking memory across compiles.
  useEffect(() => {
    if (!compiledPdfBase64) {
      setBlobUrl(null);
      return;
    }

    const url = base64ToBlobUrl(compiledPdfBase64);
    setBlobUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [compiledPdfBase64]);

  const downloadFileName = useMemo(() => 'report.pdf', []);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ── Compiling ──────────────────────────────────────────────────────────────
  if (isCompiling) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 p-6 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm font-medium">Compiling LaTeX…</p>
        <p className="text-xs opacity-70 text-center max-w-[220px]">
          This usually takes 5–20 seconds depending on document length.
        </p>
      </div>
    );
  }

  // ── Compile error ──────────────────────────────────────────────────────────
  if (compileError) {
    return (
      <div className="h-full flex flex-col p-4 gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-destructive shrink-0">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Compilation Error
        </div>
        <p className="text-xs text-muted-foreground shrink-0">
          Review the log below, fix the issue in your chapters, then compile again.
        </p>
        <pre className="flex-1 min-h-0 overflow-auto text-[11px] leading-relaxed bg-destructive/5 text-destructive/90 rounded-md p-3 whitespace-pre-wrap break-all font-mono border border-destructive/20">
          {compileError}
        </pre>
      </div>
    );
  }

  // ── PDF ready ──────────────────────────────────────────────────────────────
  if (blobUrl) {
    return (
      <div className="h-full flex flex-col bg-[#525659] relative">
        {/* Mini toolbar - floating glass */}
        <div className="absolute top-2 right-4 z-10 flex items-center justify-end px-3 py-1.5 bg-background/80 backdrop-blur-md rounded-md shadow-sm border border-border/50">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs gap-1.5 font-medium"
            onClick={handleDownload}
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>

        {/* Native browser PDF viewer */}
        <iframe
          src={blobUrl}
          title="Compiled PDF preview"
          className="flex-1 w-full border-0 shadow-inner"
        />
      </div>
    );
  }

  // ── Default: no compile attempted yet ─────────────────────────────────────
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center bg-muted/5">
      <div className="rounded-full bg-background border p-5 shadow-sm">
        <FileText className="h-8 w-8 text-muted-foreground/60" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-serif font-medium">No preview yet</p>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
          Click <strong className="font-semibold text-foreground">Compile</strong> in the top bar to generate a live PDF
          preview of your document.
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { useEditorStore } from '@/store/editorStore';
import {
  generateTableLatex,
  type ColAlignment,
} from '@/lib/latex/tableGenerator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, CornerDownLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ─── Grid helpers ─────────────────────────────────────────────────────────────

function makeGrid(rows: number, cols: number, existing: string[][]): string[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => existing[r]?.[c] ?? '')
  );
}

// ─── Spinner (row/col count) ──────────────────────────────────────────────────

function CountSpinner({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs shrink-0">{label}</Label>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="h-7 w-7 border rounded-l text-sm hover:bg-muted disabled:opacity-40 transition-colors"
        >
          −
        </button>
        <span className="h-7 w-8 border-t border-b flex items-center justify-center text-xs tabular-nums">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="h-7 w-7 border rounded-r text-sm hover:bg-muted disabled:opacity-40 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TableBuilderModal() {
  const { tableBuilderOpen, setTableBuilderOpen } = useEditorStore();
  const { toast } = useToast();

  // ── Grid state ────────────────────────────────────────────────────────────
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [cells, setCells] = useState<string[][]>(() => makeGrid(3, 3, []));

  // ── Options ───────────────────────────────────────────────────────────────
  const [caption, setCaption] = useState('');
  const [label, setLabel] = useState('');
  const [firstRowIsHeader, setFirstRowIsHeader] = useState(true);
  const [alignment, setAlignment] = useState<ColAlignment>('l');

  // ── Resize grid while preserving existing content ─────────────────────────
  const handleRowChange = useCallback((newRows: number) => {
    setRows(newRows);
    setCells((prev) => makeGrid(newRows, cols, prev));
  }, [cols]);

  const handleColChange = useCallback((newCols: number) => {
    setCols(newCols);
    setCells((prev) => makeGrid(rows, newCols, prev));
  }, [rows]);

  const handleCellChange = useCallback(
    (r: number, c: number, value: string) => {
      setCells((prev) => {
        const next = prev.map((row) => [...row]);
        next[r][c] = value;
        return next;
      });
    },
    []
  );

  // ── Tab key navigation between cells ──────────────────────────────────────
  const cellRefs = useRef<(HTMLInputElement | null)[][]>([]);

  const handleCellKeyDown = useCallback(
    (e: React.KeyboardEvent, r: number, c: number) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const nextC = e.shiftKey ? c - 1 : c + 1;
        const nextR = e.shiftKey
          ? nextC < 0 ? r - 1 : r
          : nextC >= cols ? r + 1 : r;
        const wrappedC = e.shiftKey
          ? nextC < 0 ? cols - 1 : nextC
          : nextC >= cols ? 0 : nextC;

        if (nextR >= 0 && nextR < rows) {
          cellRefs.current[nextR]?.[wrappedC]?.focus();
        }
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const nextR = r + 1;
        if (nextR < rows) {
          cellRefs.current[nextR]?.[0]?.focus();
        }
      }
    },
    [cols, rows]
  );

  // ── Live LaTeX preview ────────────────────────────────────────────────────
  const latexOutput = useMemo(
    () => generateTableLatex({ cells, caption, label, firstRowIsHeader, alignment }),
    [cells, caption, label, firstRowIsHeader, alignment]
  );

  // ── Reset on close ────────────────────────────────────────────────────────
  const handleOpenChange = (open: boolean) => {
    setTableBuilderOpen(open);
    if (!open) {
      setRows(3);
      setCols(3);
      setCells(makeGrid(3, 3, []));
      setCaption('');
      setLabel('');
      setFirstRowIsHeader(true);
      setAlignment('l');
    }
  };

  // ── Insert at cursor ──────────────────────────────────────────────────────
  const handleInsert = () => {
    if (typeof window !== 'undefined' && window.__lrsInsertAtCursor) {
      window.__lrsInsertAtCursor(latexOutput);
      setTableBuilderOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Could not insert',
        description: 'Click inside the editor first, then try again.',
      });
    }
  };

  // ── Copy to clipboard ─────────────────────────────────────────────────────
  const handleCopy = async () => {
    await navigator.clipboard.writeText(latexOutput);
    toast({ title: 'Copied to clipboard' });
  };

  // ── Ensure cellRefs array is correctly sized ──────────────────────────────
  cellRefs.current = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => cellRefs.current[r]?.[c] ?? null)
  );

  return (
    <Dialog open={tableBuilderOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
          <DialogTitle>Table Builder</DialogTitle>
          <DialogDescription>
            Build a table visually and insert the generated LaTeX into your document.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex overflow-hidden">

          {/* ── Left column: controls + grid ──────────────────────────── */}
          <div className="flex flex-col w-[55%] border-r">

            {/* Controls bar */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 border-b bg-muted/20 shrink-0">
              <CountSpinner label="Rows" value={rows} min={1} max={20} onChange={handleRowChange} />
              <CountSpinner label="Cols" value={cols} min={1} max={8} onChange={handleColChange} />

              <div className="flex items-center gap-2">
                <Label htmlFor="alignment" className="text-xs shrink-0">Alignment</Label>
                <Select value={alignment} onValueChange={(v) => setAlignment(v as ColAlignment)}>
                  <SelectTrigger id="alignment" className="h-7 w-24 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="l">Left</SelectItem>
                    <SelectItem value="c">Center</SelectItem>
                    <SelectItem value="r">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="header-toggle"
                  checked={firstRowIsHeader}
                  onCheckedChange={setFirstRowIsHeader}
                />
                <Label htmlFor="header-toggle" className="text-xs cursor-pointer">
                  First row is header
                </Label>
              </div>
            </div>

            {/* Scrollable grid */}
            <div className="flex-1 overflow-auto p-4">
              <table className="border-collapse w-full">
                <tbody>
                  {cells.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => {
                        const isHeader = firstRowIsHeader && r === 0;
                        return (
                          <td key={c} className="border border-border p-0">
                            <input
                              ref={(el) => {
                                if (!cellRefs.current[r]) cellRefs.current[r] = [];
                                cellRefs.current[r][c] = el;
                              }}
                              value={cell}
                              onChange={(e) => handleCellChange(r, c, e.target.value)}
                              onKeyDown={(e) => handleCellKeyDown(e, r, c)}
                              className={cn(
                                'w-full min-w-[80px] h-8 px-2 text-xs bg-transparent',
                                'focus:outline-none focus:bg-primary/5',
                                isHeader && 'font-semibold'
                              )}
                              placeholder={isHeader ? `Header ${c + 1}` : `R${r + 1}C${c + 1}`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Caption + label inputs */}
            <div className="flex gap-3 px-4 py-3 border-t shrink-0">
              <div className="flex-1 space-y-1">
                <Label htmlFor="caption" className="text-xs">Caption</Label>
                <Input
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Table caption…"
                  className="h-8 text-sm"
                />
              </div>
              <div className="w-36 space-y-1">
                <Label htmlFor="label" className="text-xs">
                  Label <span className="text-muted-foreground">(tab:…)</span>
                </Label>
                <Input
                  id="label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="results"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>

          {/* ── Right column: LaTeX preview ────────────────────────────── */}
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/20 shrink-0">
              <span className="text-xs font-medium text-muted-foreground">LaTeX Preview</span>
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5" onClick={handleCopy}>
                <Copy className="h-3 w-3" />
                Copy
              </Button>
            </div>
            <pre className="flex-1 overflow-auto p-4 text-xs font-mono leading-relaxed text-foreground whitespace-pre-wrap break-all">
              {latexOutput}
            </pre>
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t shrink-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleInsert} className="gap-1.5">
            <CornerDownLeft className="h-3.5 w-3.5" />
            Insert into Document
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

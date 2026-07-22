'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import {
  generateTableLatex,
  type ColAlignment,
} from '@/lib/latex/tableGenerator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
    <div className="flex items-center gap-1.5">
      <Label className="text-[10px] shrink-0 text-muted-foreground">{label}</Label>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="h-6 w-6 border rounded-l text-[10px] hover:bg-muted disabled:opacity-40 transition-colors bg-background"
        >
          −
        </button>
        <span className="h-6 w-6 border-t border-b flex items-center justify-center text-[10px] tabular-nums bg-background">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="h-6 w-6 border rounded-r text-[10px] hover:bg-muted disabled:opacity-40 transition-colors bg-background"
        >
          +
        </button>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TableTool() {
  const { toast } = useToast();

  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [cells, setCells] = useState<string[][]>(() => makeGrid(3, 3, []));

  const [caption, setCaption] = useState('');
  const [label, setLabel] = useState('');
  const [firstRowIsHeader, setFirstRowIsHeader] = useState(true);
  const [alignment, setAlignment] = useState<ColAlignment>('l');

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

  const latexOutput = useMemo(
    () => generateTableLatex({ cells, caption, label, firstRowIsHeader, alignment }),
    [cells, caption, label, firstRowIsHeader, alignment]
  );

  const handleInsert = () => {
    if (typeof window !== 'undefined' && window.__lrsInsertAtCursor) {
      window.__lrsInsertAtCursor(latexOutput);
    } else {
      toast({
        variant: 'destructive',
        title: 'Could not insert',
        description: 'Click inside the editor first, then try again.',
      });
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(latexOutput);
    toast({ title: 'Copied to clipboard' });
  };

  cellRefs.current = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => cellRefs.current[r]?.[c] ?? null)
  );

  return (
    <div className="flex h-full min-h-0 divide-x bg-background">
      {/* ── Left column: controls + grid ──────────────────────────── */}
      <div className="flex flex-col w-3/5 min-h-0">
        
        {/* Controls bar */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2 border-b bg-muted/5 shrink-0">
          <CountSpinner label="Rows" value={rows} min={1} max={20} onChange={handleRowChange} />
          <CountSpinner label="Cols" value={cols} min={1} max={8} onChange={handleColChange} />

          <div className="flex items-center gap-1.5 ml-2">
            <Label htmlFor="alignment" className="text-[10px] shrink-0 text-muted-foreground">Align</Label>
            <Select value={alignment} onValueChange={(v) => setAlignment(v as ColAlignment)}>
              <SelectTrigger id="alignment" className="h-6 w-16 text-[10px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="l" className="text-[10px]">Left</SelectItem>
                <SelectItem value="c" className="text-[10px]">Center</SelectItem>
                <SelectItem value="r" className="text-[10px]">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <Label htmlFor="header-toggle" className="text-[10px] cursor-pointer text-muted-foreground">
              Header Row
            </Label>
            <Switch
              id="header-toggle"
              checked={firstRowIsHeader}
              onCheckedChange={setFirstRowIsHeader}
              className="scale-75 origin-right"
            />
          </div>
        </div>

        {/* Scrollable grid */}
        <div className="flex-1 overflow-auto p-3">
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
                            'w-full min-w-[60px] h-7 px-2 text-[11px] bg-transparent transition-colors',
                            'focus:outline-none focus:bg-primary/5',
                            isHeader && 'font-semibold bg-muted/20'
                          )}
                          placeholder={isHeader ? `H${c + 1}` : `R${r + 1}C${c + 1}`}
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
        <div className="flex gap-3 px-3 py-2 border-t shrink-0 bg-muted/5">
          <div className="flex-1 space-y-1">
            <Label htmlFor="caption" className="text-[10px]">Caption</Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Table caption…"
              className="h-6 text-[11px]"
            />
          </div>
          <div className="w-28 space-y-1">
            <Label htmlFor="label" className="text-[10px]">
              Label <span className="text-muted-foreground">(tab:…)</span>
            </Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="results"
              className="h-6 text-[11px]"
            />
          </div>
        </div>
      </div>

      {/* ── Right column: LaTeX preview ────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 bg-muted/10">
        <div className="flex items-center justify-between px-3 py-1.5 border-b shrink-0 bg-background">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">LaTeX Preview</span>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 px-2" onClick={handleCopy}>
              <Copy className="h-3 w-3" />
              Copy
            </Button>
            <Button size="sm" variant="secondary" className="h-6 text-[10px] gap-1 px-2" onClick={handleInsert}>
              <CornerDownLeft className="h-3 w-3" />
              Insert
            </Button>
          </div>
        </div>
        <pre className="flex-1 overflow-auto p-3 text-[10px] font-mono leading-relaxed text-foreground whitespace-pre-wrap break-all">
          {latexOutput}
        </pre>
      </div>
    </div>
  );
}

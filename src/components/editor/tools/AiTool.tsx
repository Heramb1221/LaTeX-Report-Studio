'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useEditorStore } from '@/store/editorStore';
import { useAuth } from '@/hooks/useAuth';
import { useAi } from '@/hooks/useAi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import {
  Sparkles,
  Copy,
  CornerDownLeft,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AiTool() {
  const { aiDrawerMode, setAiDrawerMode } = useEditorStore();
  const { user } = useAuth();
  const {
    humanize,
    isHumanizing,
    convert,
    isConverting,
    insertAtCursor,
    copyToClipboard,
  } = useAi();

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const isProcessing = isHumanizing || isConverting;
  const hasKey = user?.hasGeminiKey ?? false;

  const handleProcess = async () => {
    if (!input.trim()) return;
    try {
      const result =
        aiDrawerMode === 'humanize' ? await humanize(input) : await convert(input);
      setOutput(result);
    } catch {
      // Error toast is shown by useAi's onError handler
    }
  };

  const handleInsert = () => {
    if (!output) return;
    insertAtCursor(output);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div className="flex items-center px-4 py-2 border-b shrink-0 bg-muted/10">
        <div className="flex bg-muted p-0.5 rounded-md">
          <button
            onClick={() => setAiDrawerMode('humanize')}
            className={cn(
              "text-xs h-6 px-3 rounded-sm font-medium transition-all",
              aiDrawerMode === 'humanize' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Humanize
          </button>
          <button
            onClick={() => setAiDrawerMode('convert')}
            className={cn(
              "text-xs h-6 px-3 rounded-sm font-medium transition-all",
              aiDrawerMode === 'convert' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            LaTeX Convert
          </button>
        </div>
      </div>

      {/* ── No API key warning ──────────────────────────────────────── */}
      {!hasKey ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
          <KeyRound className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">No Gemini API key configured</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Add your free Gemini API key in Settings to use the Humanizer
              and LaTeX Converter.
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/settings">Go to Settings</Link>
          </Button>
        </div>
      ) : (
        /* ── Two-column input/output ─────────────────────────────────── */
        <div className="flex-1 grid grid-cols-2 gap-3 p-3 min-h-0">

          {/* Input column */}
          <div className="flex flex-col gap-2 min-h-0">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                aiDrawerMode === 'humanize'
                  ? 'Paste text to make it sound more natural…'
                  : 'Paste plain text to convert into IEEE-format LaTeX…'
              }
              className="flex-1 resize-none text-sm font-mono focus-visible:ring-1"
              disabled={isProcessing}
              maxLength={8000}
            />
            <div className="flex items-center justify-between shrink-0">
              <span className="text-[11px] text-muted-foreground">
                {input.length} / 8000
              </span>
              <Button
                size="sm"
                onClick={handleProcess}
                disabled={isProcessing || !input.trim()}
                className="gap-1.5 h-8"
              >
                {isProcessing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {isProcessing ? 'Processing…' : 'Process with Gemini'}
              </Button>
            </div>
          </div>

          {/* Output column */}
          <div className="flex flex-col gap-2 min-h-0">
            <div className="flex-1 overflow-auto rounded-md border bg-muted/10 p-3 text-sm font-mono whitespace-pre-wrap">
              {output || (
                <span className="text-muted-foreground italic">
                  Output will appear here…
                </span>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 h-8"
                onClick={() => copyToClipboard(output)}
                disabled={!output}
              >
                <Copy className="h-3 w-3" />
                Copy
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 h-8"
                onClick={handleInsert}
                disabled={!output}
              >
                <CornerDownLeft className="h-3 w-3" />
                Insert at Cursor
              </Button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

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
  X,
  Copy,
  CornerDownLeft,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AiDrawer() {
  const { isAiDrawerOpen, aiDrawerMode, setIsAiDrawerOpen, setAiDrawerMode } =
    useEditorStore();
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

  const handleClose = () => {
    setIsAiDrawerOpen(false);
  };

  const handleInsert = () => {
    if (!output) return;
    insertAtCursor(output);
  };

  return (
    <div
      className={cn(
        'fixed bottom-11 left-0 right-0 z-40 h-80 border-t border-border/50 bg-background/80 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]',
        'transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]',
        isAiDrawerOpen ? 'translate-y-0' : 'translate-y-[calc(100%+44px)] pointer-events-none'
      )}
      aria-hidden={!isAiDrawerOpen}
    >
      <div className="h-full flex flex-col">

        {/* ΓöÇΓöÇ Header ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Panel
            </span>

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

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleClose}
            aria-label="Close AI panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* ΓöÇΓöÇ No API key warning ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
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
            <Button asChild size="sm" onClick={handleClose}>
              <Link href="/settings">Go to Settings</Link>
            </Button>
          </div>
        ) : (
          /* ΓöÇΓöÇ Two-column input/output ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
          <div className="flex-1 grid grid-cols-2 gap-3 p-3 min-h-0">

            {/* Input column */}
            <div className="flex flex-col gap-2 min-h-0">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  aiDrawerMode === 'humanize'
                    ? 'Paste text to make it sound more naturalΓÇª'
                    : 'Paste plain text to convert into IEEE-format LaTeXΓÇª'
                }
                className="flex-1 resize-none text-sm font-mono"
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
                  className="gap-1.5"
                >
                  {isProcessing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {isProcessing ? 'ProcessingΓÇª' : 'Process with Gemini'}
                </Button>
              </div>
            </div>

            {/* Output column */}
            <div className="flex flex-col gap-2 min-h-0">
              <div className="flex-1 overflow-auto rounded-md border bg-muted/20 p-3 text-sm font-mono whitespace-pre-wrap">
                {output || (
                  <span className="text-muted-foreground italic">
                    Output will appear hereΓÇª
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => copyToClipboard(output)}
                  disabled={!output}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={handleInsert}
                  disabled={!output}
                >
                  <CornerDownLeft className="h-3.5 w-3.5" />
                  Insert at Cursor
                </Button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

'use client';

// REPLACES src/components/editor/MonacoLatexEditor.tsx from Phase 4.
// Changes:
//   • Registers LaTeX language + custom theme via registerLatexLanguage()
//   • Adds 1500ms debounced auto-save via useSaveChapter
//   • Accepts projectId prop so it can call the save API

import { useRef, useCallback } from 'react';
import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react';
import type * as MonacoNS from 'monaco-editor';
import { useEditorStore } from '@/store/editorStore';
import { useSaveChapter } from '@/hooks/useChapter';
import { registerLatexLanguage } from '@/lib/latex/monacoLanguage';

// ─── Props ────────────────────────────────────────────────────────────────────

interface MonacoLatexEditorProps {
  /** Needed for the auto-save API call */
  projectId: string;
}

// ─── Editor options ───────────────────────────────────────────────────────────

const EDITOR_OPTIONS: MonacoNS.editor.IStandaloneEditorConstructionOptions = {
  fontSize: 14,
  fontFamily:
    '"JetBrains Mono", "Fira Code", "Cascadia Code", "Consolas", monospace',
  fontLigatures: true,
  wordWrap: 'on',
  lineNumbers: 'on',
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  padding: { top: 16, bottom: 64 },
  renderLineHighlight: 'gutter',
  cursorBlinking: 'smooth',
  smoothScrolling: true,
  scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
  overviewRulerLanes: 0,
  renderWhitespace: 'none',
  tabSize: 2,
  // snippetSuggestions, quickSuggestions — off by default to keep it lightweight
  quickSuggestions: false,
};

// ─── Global insert helper type ────────────────────────────────────────────────

declare global {
  interface Window {
    __lrsInsertAtCursor?: (text: string) => void;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MonacoLatexEditor({ projectId }: MonacoLatexEditorProps) {
  const editorRef = useRef<MonacoNS.editor.IStandaloneCodeEditor | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeChapterId = useEditorStore((s) => s.activeChapterId);
  const editorContent = useEditorStore((s) => s.editorContent);
  const setEditorContent = useEditorStore((s) => s.setEditorContent);
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus);
  const focusMode = useEditorStore((s) => s.focusMode);

  const { save } = useSaveChapter(projectId);

  // ── Before mount: register LaTeX language ──────────────────────────────────
  // beforeMount fires synchronously before the editor is created, which is the
  // right time to register a custom language so it applies from the first render.
  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    registerLatexLanguage(monaco);
  }, []);

  // ── On mount: store editor ref + register insert helper ───────────────────
  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;

    window.__lrsInsertAtCursor = (text: string) => {
      const sel = editor.getSelection();
      if (!sel) return;
      editor.executeEdits('lrs-insert', [
        { range: sel, text, forceMoveMarkers: true },
      ]);
      editor.focus();
    };
  }, []);

  // ── onChange: update store + schedule auto-save ───────────────────────────
  const handleChange = useCallback(
    (value: string | undefined) => {
      const content = value ?? '';
      setEditorContent(content);
      setSaveStatus('unsaved');

      // Cancel the previous save timer and start a new one
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      // Only save if a chapter is actually active
      if (!activeChapterId) return;

      saveTimerRef.current = setTimeout(() => {
        save(activeChapterId, content);
      }, 1500);
    },
    [activeChapterId, setEditorContent, setSaveStatus, save]
  );

  return (
    <div className="h-full w-full">
      <Editor
        key={activeChapterId ?? '__empty__'}
        height="100%"
        language="latex"            // registered by registerLatexLanguage above
        theme="latex-dark"          // custom theme defined in monacoLanguage.ts
        defaultValue={editorContent}
        options={{
          ...EDITOR_OPTIONS,
          lineNumbers: focusMode ? 'off' : 'on',
          lineDecorationsWidth: focusMode ? 0 : 10,
          lineNumbersMinChars: focusMode ? 0 : 3,
          padding: { top: 16, bottom: 64 },
        }}
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        onChange={handleChange}
        loading={
          <div className="h-full w-full flex items-center justify-center bg-[#09090b]">
            <p className="text-sm text-neutral-500 animate-pulse font-serif">
              Loading editor…
            </p>
          </div>
        }
      />
    </div>
  );
}

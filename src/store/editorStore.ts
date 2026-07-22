import { create } from 'zustand';

// REPLACES src/store/editorStore.ts from Phase 10.
// Only addition: imageManagerOpen boolean.

type SaveStatus = 'idle' | 'saving' | 'saved' | 'unsaved';
type AiDrawerMode = 'humanize' | 'convert' | 'grammar';
export type BottomPanelTab = 'ai' | 'citations' | 'diagrams' | 'images' | 'tables' | null;

interface EditorStore {
  activeChapterId: string | null;
  setActiveChapterId: (id: string | null) => void;

  editorContent: string;
  setEditorContent: (content: string) => void;

  saveStatus: SaveStatus;
  setSaveStatus: (status: SaveStatus) => void;

  isCompiling: boolean;
  compiledPdfBase64: string | null;
  compileError: string | null;
  setIsCompiling: (value: boolean) => void;
  setCompiledPdf: (base64: string | null) => void;
  setCompileError: (error: string | null) => void;

  activeBottomPanelTab: BottomPanelTab;
  setActiveBottomPanelTab: (tab: BottomPanelTab) => void;

  aiDrawerMode: AiDrawerMode;
  setAiDrawerMode: (mode: AiDrawerMode) => void;

  editingDiagramId: string | null;
  setEditingDiagramId: (id: string | null) => void;

  focusMode: boolean;
  setFocusMode: (open: boolean) => void;

  reset: () => void;
}

const INITIAL: Omit<
  EditorStore,
  | 'setActiveChapterId'
  | 'setEditorContent'
  | 'setSaveStatus'
  | 'setIsCompiling'
  | 'setCompiledPdf'
  | 'setCompileError'
  | 'setActiveBottomPanelTab'
  | 'setAiDrawerMode'
  | 'setEditingDiagramId'
  | 'setFocusMode'
  | 'reset'
> = {
  activeChapterId: null,
  editorContent: '',
  saveStatus: 'idle',
  isCompiling: false,
  compiledPdfBase64: null,
  compileError: null,
  activeBottomPanelTab: null,
  aiDrawerMode: 'humanize',
  editingDiagramId: null,
  focusMode: false,
};

export const useEditorStore = create<EditorStore>((set) => ({
  ...INITIAL,

  setActiveChapterId: (id) => set({ activeChapterId: id }),
  setEditorContent: (content) => set({ editorContent: content }),
  setSaveStatus: (status) => set({ saveStatus: status }),

  setIsCompiling: (value) => set({ isCompiling: value }),
  setCompiledPdf: (base64) =>
    set({ compiledPdfBase64: base64, compileError: null, isCompiling: false }),
  setCompileError: (error) =>
    set({ compileError: error, compiledPdfBase64: null, isCompiling: false }),

  setActiveBottomPanelTab: (tab) => set({ activeBottomPanelTab: tab }),
  setAiDrawerMode: (mode) => set({ aiDrawerMode: mode }),

  setEditingDiagramId: (id) => set({ editingDiagramId: id }),
  
  setFocusMode: (open) => set({ focusMode: open }),

  reset: () => set(INITIAL),
}));

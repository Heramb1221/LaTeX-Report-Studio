import { create } from 'zustand';

// REPLACES src/store/editorStore.ts from Phase 10.
// Only addition: imageManagerOpen boolean.

type SaveStatus = 'idle' | 'saving' | 'saved' | 'unsaved';
type AiDrawerMode = 'humanize' | 'convert' | 'grammar';

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

  isAiDrawerOpen: boolean;
  aiDrawerMode: AiDrawerMode;
  setIsAiDrawerOpen: (open: boolean) => void;
  setAiDrawerMode: (mode: AiDrawerMode) => void;

  newDiagramModalOpen: boolean;
  setNewDiagramModalOpen: (open: boolean) => void;
  editingDiagramId: string | null;
  setEditingDiagramId: (id: string | null) => void;

  citationModalOpen: boolean;
  setCitationModalOpen: (open: boolean) => void;

  tableBuilderOpen: boolean;
  setTableBuilderOpen: (open: boolean) => void;

  /** Phase 11: Image Manager modal */
  imageManagerOpen: boolean;
  setImageManagerOpen: (open: boolean) => void;

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
  | 'setIsAiDrawerOpen'
  | 'setAiDrawerMode'
  | 'setNewDiagramModalOpen'
  | 'setEditingDiagramId'
  | 'setCitationModalOpen'
  | 'setTableBuilderOpen'
  | 'setImageManagerOpen'
  | 'setFocusMode'
  | 'reset'
> = {
  activeChapterId: null,
  editorContent: '',
  saveStatus: 'idle',
  isCompiling: false,
  compiledPdfBase64: null,
  compileError: null,
  isAiDrawerOpen: false,
  aiDrawerMode: 'humanize',
  newDiagramModalOpen: false,
  editingDiagramId: null,
  citationModalOpen: false,
  tableBuilderOpen: false,
  imageManagerOpen: false,
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

  setIsAiDrawerOpen: (open) => set({ isAiDrawerOpen: open }),
  setAiDrawerMode: (mode) => set({ aiDrawerMode: mode }),

  setNewDiagramModalOpen: (open) => set({ newDiagramModalOpen: open }),
  setEditingDiagramId: (id) => set({ editingDiagramId: id }),

  setCitationModalOpen: (open) => set({ citationModalOpen: open }),
  setTableBuilderOpen: (open) => set({ tableBuilderOpen: open }),
  setImageManagerOpen: (open) => set({ imageManagerOpen: open }),
  
  setFocusMode: (open) => set({ focusMode: open }),

  reset: () => set(INITIAL),
}));

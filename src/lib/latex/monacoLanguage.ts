// LaTeX language definition for Monaco Editor.
// Registered once per page load (guarded by hasRegistered flag).
// Import and call registerLatexLanguage() inside the Monaco onMount handler.

import type * as Monaco from 'monaco-editor';

export const LATEX_LANGUAGE_ID = 'latex';

// ─── Language configuration ───────────────────────────────────────────────────
// Controls bracket matching, auto-close, comment toggling, etc.

export const LATEX_LANG_CONFIG: Monaco.languages.LanguageConfiguration = {
  comments: { lineComment: '%' },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '$', close: '$', notIn: ['string'] },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '$', close: '$' },
  ],
  folding: {
    markers: {
      start: /\\begin\{/,
      end: /\\end\{/,
    },
  },
  wordPattern: /\\?[a-zA-Z][\w]*/,
};

// ─── Monarch tokenizer ────────────────────────────────────────────────────────
// Token names map to the custom theme rules registered below.

export const LATEX_TOKENS: Monaco.languages.IMonarchLanguage = {
  defaultToken: '',
  ignoreCase: false,

  // Top-level keyword groups for the tokenizer rules
  controlKeywords: ['begin', 'end'],
  sectionKeywords: [
    'chapter', 'section', 'subsection', 'subsubsection',
    'paragraph', 'subparagraph', 'part',
  ],
  formatKeywords: [
    'textbf', 'textit', 'underline', 'emph', 'texttt', 'textrm',
    'textsc', 'textsf', 'text',
  ],
  refKeywords: [
    'label', 'ref', 'eqref', 'cite', 'citet', 'citep',
    'footnote', 'index', 'hyperref',
  ],
  importKeywords: [
    'includegraphics', 'input', 'include', 'usepackage',
    'documentclass', 'bibliography', 'bibliographystyle',
  ],

  tokenizer: {
    root: [
      // ── Comments ──────────────────────────────────────────────────────────
      [/%.*$/, 'comment'],

      // ── Display math $$ ... $$ ────────────────────────────────────────────
      [/\$\$/, { token: 'latex-math', next: '@displayMath' }],

      // ── Inline math $ ... $ ───────────────────────────────────────────────
      [/\$/, { token: 'latex-math', next: '@inlineMath' }],

      // ── \begin{} and \end{} ───────────────────────────────────────────────
      [/\\(begin|end)(?=\{)/, 'latex-control'],

      // ── Sectioning commands ───────────────────────────────────────────────
      [
        /\\(chapter|section|subsection|subsubsection|paragraph|subparagraph|part)\*?(?=[\{\s])/,
        'latex-section',
      ],

      // ── Formatting commands ───────────────────────────────────────────────
      [
        /\\(textbf|textit|underline|emph|texttt|textrm|textsc|textsf|text)(?=\{)/,
        'latex-format',
      ],

      // ── Reference / cite commands ─────────────────────────────────────────
      [
        /\\(label|ref|eqref|cite[tp]?|footnote|index|hyperref)(?=\{|\[)/,
        'latex-ref',
      ],

      // ── Import / document structure ───────────────────────────────────────
      [
        /\\(includegraphics|input|include|usepackage|documentclass|bibliography|bibliographystyle)(?=\{|\[)/,
        'latex-import',
      ],

      // ── All other \commands ───────────────────────────────────────────────
      [/\\[a-zA-Z]+\*?/, 'latex-keyword'],

      // ── Escaped special chars ─────────────────────────────────────────────
      [/\\[^a-zA-Z\s]/, 'latex-escape'],

      // ── Delimiters ────────────────────────────────────────────────────────
      [/[{}]/, 'latex-brace'],
      [/[\[\]]/, 'latex-bracket'],

      // ── Numbers ───────────────────────────────────────────────────────────
      [/\d+(\.\d+)?/, 'latex-number'],
    ],

    inlineMath: [
      [/\$/, { token: 'latex-math', next: '@pop' }],
      [/\\[a-zA-Z]+/, 'latex-math-cmd'],
      [/[^$\\]+/, 'latex-math'],
    ],

    displayMath: [
      [/\$\$/, { token: 'latex-math', next: '@pop' }],
      [/\\[a-zA-Z]+/, 'latex-math-cmd'],
      [/[^$\\]+/, 'latex-math'],
    ],
  },
};

// ─── Custom dark theme ────────────────────────────────────────────────────────
// Extends vs-dark with LaTeX-specific token colours.

export const LATEX_THEME: Monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment',        foreground: '6A9955', fontStyle: 'italic' },
    { token: 'latex-control',  foreground: 'C586C0', fontStyle: 'bold' },   // \begin \end — purple
    { token: 'latex-section',  foreground: 'DCDCAA', fontStyle: 'bold' },   // \section — yellow
    { token: 'latex-format',   foreground: '9CDCFE' },                       // \textbf — light blue
    { token: 'latex-ref',      foreground: '4EC9B0' },                       // \cite \ref — teal
    { token: 'latex-import',   foreground: 'CE9178' },                       // \usepackage — orange
    { token: 'latex-keyword',  foreground: '569CD6' },                       // other \commands — blue
    { token: 'latex-escape',   foreground: 'D7BA7D' },                       // \# \$ etc — gold
    { token: 'latex-brace',    foreground: 'FFD700' },                       // {} — gold
    { token: 'latex-bracket',  foreground: 'DA70D6' },                       // [] — orchid
    { token: 'latex-number',   foreground: 'B5CEA8' },                       // numbers — sage
    { token: 'latex-math',     foreground: '4EC9B0', fontStyle: 'italic' },  // $math$ — teal italic
    { token: 'latex-math-cmd', foreground: '4FC1FF' },                       // \cmd inside math
  ],
  colors: {
    'editor.background': '#09090b', // Matches deep Next.js dark background
    'editor.lineHighlightBackground': '#ffffff07',
    'editorLineNumber.foreground': '#3f3f46',
    'editorLineNumber.activeForeground': '#a1a1aa',
    'editorIndentGuide.background': '#ffffff00',
    'editorIndentGuide.activeBackground': '#ffffff00',
    'scrollbarSlider.background': '#ffffff10',
    'scrollbarSlider.hoverBackground': '#ffffff20',
    'scrollbarSlider.activeBackground': '#ffffff30',
  },
};

// ─── Registration helper ──────────────────────────────────────────────────────
// Call once inside Monaco's beforeMount callback to avoid duplicate registration.

let hasRegistered = false;

export function registerLatexLanguage(monaco: typeof Monaco): void {
  if (hasRegistered) return;
  hasRegistered = true;

  monaco.languages.register({ id: LATEX_LANGUAGE_ID });
  monaco.languages.setLanguageConfiguration(LATEX_LANGUAGE_ID, LATEX_LANG_CONFIG);
  monaco.languages.setMonarchTokensProvider(LATEX_LANGUAGE_ID, LATEX_TOKENS);
  monaco.editor.defineTheme('latex-dark', LATEX_THEME);
}

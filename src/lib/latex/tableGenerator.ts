// ─── Types ────────────────────────────────────────────────────────────────────

export type ColAlignment = 'l' | 'c' | 'r';

export interface TableOptions {
  cells: string[][];       // [row][col], 0-indexed
  caption: string;
  label: string;           // used in \label{tab:<label>}
  firstRowIsHeader: boolean;
  alignment: ColAlignment;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function escapeLatex(text: string): string {
  // Escape characters that have special meaning in LaTeX.
  // Order matters: backslash must come first.
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/&/g, '\\&')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\^/g, '\\^{}')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}');
}

function cellContent(text: string, bold: boolean): string {
  const escaped = escapeLatex(text.trim());
  return bold ? `\\textbf{${escaped || '~'}}` : (escaped || '~');
  // ~ is a non-breaking space — produces a valid empty cell in LaTeX
  // rather than leaving the cell truly empty, which can cause alignment warnings.
}

// ─── Main generator ───────────────────────────────────────────────────────────

/**
 * Converts a TableOptions object into a complete LaTeX table/tabular block.
 * Pure function — no side effects, safe to call on every keystroke for
 * the live preview.
 */
export function generateTableLatex(opts: TableOptions): string {
  const { cells, caption, label, firstRowIsHeader, alignment } = opts;

  if (cells.length === 0 || cells[0].length === 0) {
    return '% Empty table — add rows and columns first.';
  }

  const numCols = cells[0].length;
  const colSpec = Array(numCols).fill(`|${alignment}|`).join('');
  // e.g. 3 columns with center alignment → |c||c||c|
  // This produces the outer borders correctly. A cleaner spec would be |c|c|c|
  // but we build it column-by-column so each interior bar is auto-included.
  const colSpecClean = `|${Array(numCols).fill(alignment).join('|')}|`;

  const safeCap = caption.trim() || 'Table Caption';
  const safeLabel = label.trim().replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase() || 'table1';

  const lines: string[] = [
    '\\begin{table}[h!]',
    '  \\centering',
    `  \\caption{${safeCap}}`,
    `  \\label{tab:${safeLabel}}`,
    `  \\begin{tabular}{${colSpecClean}}`,
    '    \\hline',
  ];

  cells.forEach((row, rowIdx) => {
    const isHeader = firstRowIsHeader && rowIdx === 0;
    const rowCells = row.map((cell) => cellContent(cell, isHeader));
    lines.push(`    ${rowCells.join(' & ')} \\\\`);
    // Always add \hline after the header row, and after the last data row.
    if (isHeader || rowIdx === cells.length - 1) {
      lines.push('    \\hline');
    }
  });

  lines.push('  \\end{tabular}');
  lines.push('\\end{table}');

  return lines.join('\n');
}

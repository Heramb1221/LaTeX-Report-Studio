import type { EntryType } from './fieldConfig';

// ─── Cite key generation ──────────────────────────────────────────────────────

function extractFirstAuthorLastName(author: string): string {
  if (!author || !author.trim()) return 'Unknown';
  const firstAuthor = author.split(/\s+and\s+/i)[0].trim();
  if (firstAuthor.includes(',')) {
    return sanitizeForCiteKey(firstAuthor.split(',')[0].trim());
  }
  const parts = firstAuthor.split(/\s+/);
  return sanitizeForCiteKey(parts[parts.length - 1]);
}

function sanitizeForCiteKey(str: string): string {
  const normalized = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return normalized.replace(/[^a-zA-Z0-9]/g, '') || 'Unknown';
}

export function generateCiteKey(
  author: string,
  year: string,
  existingKeys: Set<string>
): string {
  const lastName = extractFirstAuthorLastName(author);
  const yearStr = year.trim().slice(0, 4);
  const base = `${lastName}${yearStr}`;
  if (!existingKeys.has(base)) return base;
  for (let i = 0; i < 26; i++) {
    const candidate = `${base}${String.fromCharCode(97 + i)}`;
    if (!existingKeys.has(candidate)) return candidate;
  }
  return `${base}${Date.now()}`;
}

// ─── BibTeX string builder ────────────────────────────────────────────────────

export interface BibtexInput {
  entryType: EntryType;
  citeKey: string;
  fields: Record<string, string>;
}

export function buildBibtex(input: BibtexInput): string {
  const { entryType, citeKey, fields } = input;
  const nonEmptyFields = Object.entries(fields).filter(([, v]) => v && v.trim());
  if (nonEmptyFields.length === 0) return `@${entryType}{${citeKey},\n}`;
  const maxKeyLen = Math.max(...nonEmptyFields.map(([k]) => k.length));
  const fieldLines = nonEmptyFields
    .map(([key, value]) => `  ${key.padEnd(maxKeyLen)} = {${value.trim()}}`)
    .join(',\n');
  return `@${entryType}{${citeKey},\n${fieldLines},\n}`;
}

export function buildBibFile(entries: string[]): string {
  if (entries.length === 0) return '% No references added yet.\n';
  return entries.join('\n\n') + '\n';
}

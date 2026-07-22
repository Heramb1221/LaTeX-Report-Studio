// Each entry type has required fields (always shown, must be filled to submit)
// and optional fields (shown but not required). The `label` is what appears
// in the form; `placeholder` guides the user on expected format.

export type EntryType = 'article' | 'book' | 'inproceedings' | 'online' | 'misc';

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  article: 'Journal Article',
  book: 'Book',
  inproceedings: 'Conference Paper',
  online: 'Website / Online',
  misc: 'Miscellaneous',
};

export const ENTRY_TYPES: EntryType[] = [
  'article',
  'book',
  'inproceedings',
  'online',
  'misc',
];

export interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
  multiline?: boolean; // textarea instead of input
}

export const FIELD_DEFS: Record<EntryType, FieldDef[]> = {
  article: [
    { key: 'title',   label: 'Title',   placeholder: 'Full article title', required: true },
    { key: 'author',  label: 'Author(s)', placeholder: 'Last, First and Last, First', required: true },
    { key: 'year',    label: 'Year',    placeholder: '2023', required: true },
    { key: 'journal', label: 'Journal', placeholder: 'IEEE Transactions on...', required: true },
    { key: 'volume',  label: 'Volume',  placeholder: '12', required: false },
    { key: 'pages',   label: 'Pages',   placeholder: '100--115', required: false },
    { key: 'doi',     label: 'DOI',     placeholder: '10.1109/...', required: false },
    { key: 'url',     label: 'URL',     placeholder: 'https://...', required: false },
  ],
  book: [
    { key: 'title',     label: 'Title',     placeholder: 'Book title', required: true },
    { key: 'author',    label: 'Author(s)', placeholder: 'Last, First', required: true },
    { key: 'year',      label: 'Year',      placeholder: '2022', required: true },
    { key: 'publisher', label: 'Publisher', placeholder: 'Springer / IEEE Press', required: true },
    { key: 'address',   label: 'Address',   placeholder: 'New York, NY', required: false },
    { key: 'note',      label: 'Note',      placeholder: 'e.g. 3rd edition', required: false },
  ],
  inproceedings: [
    { key: 'title',     label: 'Title',     placeholder: 'Paper title', required: true },
    { key: 'author',    label: 'Author(s)', placeholder: 'Last, First and Last, First', required: true },
    { key: 'year',      label: 'Year',      placeholder: '2024', required: true },
    { key: 'booktitle', label: 'Conference (booktitle)', placeholder: 'Proc. IEEE ICSE 2024', required: true },
    { key: 'pages',     label: 'Pages',     placeholder: '55--63', required: false },
    { key: 'publisher', label: 'Publisher', placeholder: 'IEEE', required: false },
    { key: 'doi',       label: 'DOI',       placeholder: '10.1109/...', required: false },
  ],
  online: [
    { key: 'title',  label: 'Title',      placeholder: 'Page or article title', required: true },
    { key: 'author', label: 'Author(s)', placeholder: 'Last, First or Organisation', required: true },
    { key: 'year',   label: 'Year',      placeholder: '2024', required: true },
    { key: 'url',    label: 'URL',       placeholder: 'https://...', required: true },
    { key: 'note',   label: 'Accessed',  placeholder: 'Accessed: 01 Jan 2025', required: false },
  ],
  misc: [
    { key: 'title',  label: 'Title',     placeholder: 'Title of the work', required: true },
    { key: 'author', label: 'Author(s)', placeholder: 'Last, First', required: true },
    { key: 'year',   label: 'Year',      placeholder: '2023', required: false },
    { key: 'note',   label: 'Note',      placeholder: 'Any additional information', required: false },
  ],
};

// Human-readable description shown in the entry type selector
export const ENTRY_TYPE_DESCRIPTIONS: Record<EntryType, string> = {
  article:       'Published in a journal or magazine',
  book:          'A full book with an ISBN',
  inproceedings: 'Paper in a conference proceedings',
  online:        'Website, blog post, or online resource',
  misc:          'Anything that doesn\'t fit elsewhere',
};

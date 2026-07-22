import { z } from 'zod';

export const ENTRY_TYPES_ENUM = [
  'article',
  'book',
  'inproceedings',
  'online',
  'misc',
] as const;

export const citationSchema = z.object({
  entryType: z.enum(ENTRY_TYPES_ENUM, {
    errorMap: () => ({ message: 'Invalid entry type' }),
  }),
  fields: z.record(z.string().max(500)).refine(
    (f) => f['title'] && f['title'].trim().length > 0,
    { message: 'Title is required' }
  ).refine(
    (f) => f['author'] && f['author'].trim().length > 0,
    { message: 'Author is required' }
  ),
});

export const citationUpdateSchema = z.object({
  entryType: z.enum(ENTRY_TYPES_ENUM).optional(),
  fields: z.record(z.string().max(500)).optional(),
});

export type CitationInput = z.infer<typeof citationSchema>;

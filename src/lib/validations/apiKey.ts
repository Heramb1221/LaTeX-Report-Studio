import { z } from 'zod';

// ─── API key save ──────────────────────────────────────────────────────────────
// Gemini keys typically start with "AIza" and are ~39 chars, but we keep the
// check loose (min length only) since Google could change the format.

export const saveApiKeySchema = z.object({
  apiKey: z
    .string()
    .min(1, 'API key is required')
    .min(20, 'That doesn\'t look like a valid Gemini API key')
    .trim(),
});

export type SaveApiKeyInput = z.infer<typeof saveApiKeySchema>;

// ─── AI text processing (humanize / convert) ──────────────────────────────────
// Capped at 8000 characters — the product targets "short chapters" per the
// original spec, not full document dumps. This also keeps Gemini latency low.

export const aiTextSchema = z.object({
  text: z
    .string()
    .min(1, 'Text is required')
    .max(8000, 'Text must be 8000 characters or fewer (process shorter sections at a time)'),
});

export type AiTextInput = z.infer<typeof aiTextSchema>;

import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Model configuration ──────────────────────────────────────────────────────
// Configurable via env var since Gemini model names change over time.
// See PHASE7-SETUP.md for how to update this if calls start failing.

const MODEL_NAME = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
const CALL_TIMEOUT_MS = 30_000;

// ─── Friendly error class ─────────────────────────────────────────────────────
// API routes catch this and map `status` directly to the HTTP response code.

export class GeminiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GeminiError';
    this.status = status;
  }
}

// ─── Error message mapping ────────────────────────────────────────────────────
// The Google SDK throws generic Error objects with provider-specific text
// in the message. We pattern-match common cases to give the user something
// actionable instead of a raw stack trace.

function toFriendlyError(err: unknown): GeminiError {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  if (lower.includes('api key not valid') || lower.includes('api_key_invalid')) {
    return new GeminiError(
      'Your Gemini API key is invalid or has been revoked. Update it in Settings.',
      401
    );
  }
  if (lower.includes('quota') || lower.includes('rate limit') || lower.includes('429')) {
    return new GeminiError(
      'Your Gemini API quota has been exceeded. Wait a moment and try again, ' +
      'or check your usage at aistudio.google.com.',
      429
    );
  }
  if (lower.includes('safety') || lower.includes('blocked')) {
    return new GeminiError(
      'Gemini declined to process this text due to its safety filters. ' +
      'Try rephrasing or shortening the input.',
      422
    );
  }
  if (lower.includes('model') && (lower.includes('not found') || lower.includes('404'))) {
    return new GeminiError(
      `The configured model "${MODEL_NAME}" is not available. ` +
      'Check aistudio.google.com for current model names and update GEMINI_MODEL.',
      500
    );
  }

  return new GeminiError(
    'Could not reach Gemini right now. Please try again in a moment.',
    502
  );
}

// ─── Timeout wrapper ──────────────────────────────────────────────────────────
// The Google SDK doesn't expose an AbortSignal option directly on
// generateContent in all versions, so we race the call against a timer.

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms)
    ),
  ]);
}

// ─── callGemini ──────────────────────────────────────────────────────────────
// Sends a system prompt + user text to Gemini and returns the text response.
// Throws GeminiError with a user-safe message and HTTP status on failure.

export async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userText: string
): Promise<string> {
  if (!userText.trim()) {
    throw new GeminiError('Text to process cannot be empty.', 400);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: systemPrompt,
    });

    const result = await withTimeout(
      model.generateContent(userText),
      CALL_TIMEOUT_MS
    );

    const text = result.response.text();

    if (!text || !text.trim()) {
      throw new GeminiError(
        'Gemini returned an empty response. Try rephrasing your input.',
        422
      );
    }

    return text.trim();
  } catch (err) {
    if (err instanceof GeminiError) throw err;
    throw toFriendlyError(err);
  }
}

// ─── validateGeminiKey ────────────────────────────────────────────────────────
// Makes a minimal test call to confirm the key actually works before we
// store it. Used by the PATCH /api/user/api-key route.

export async function validateGeminiKey(apiKey: string): Promise<void> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    await withTimeout(
      model.generateContent('Reply with exactly: OK'),
      15_000
    );
  } catch (err) {
    if (err instanceof GeminiError) throw err;
    throw toFriendlyError(err);
  }
}

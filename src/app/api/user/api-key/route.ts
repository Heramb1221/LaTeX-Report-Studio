import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/User.model';
import { encrypt } from '@/lib/auth/crypto';
import { validateGeminiKey, GeminiError } from '@/lib/gemini/client';
import { saveApiKeySchema } from '@/lib/validations/apiKey';
import { withAuth, validationError, notFound, serverError } from '@/lib/auth/middleware';

// ─── GET /api/user/api-key ────────────────────────────────────────────────────
// Returns whether a key is configured, plus the last 4 chars for display.
// Never returns the actual key or the encrypted blob.

export async function GET(req: NextRequest): Promise<Response> {
  return withAuth(req, async (_req, { userId }) => {
    try {
      await connectDB();

      const user = await User.findById(userId).select(
        'geminiApiKeyEncrypted geminiKeyLast4'
      );
      if (!user) return notFound('User');

      return Response.json({
        data: {
          hasKey: Boolean(user.geminiApiKeyEncrypted),
          last4: user.geminiKeyLast4 ?? null,
        },
      });
    } catch (err) {
      return serverError(err, 'GET /api/user/api-key');
    }
  });
}

// ─── PATCH /api/user/api-key ──────────────────────────────────────────────────
// Validates the key with a real test call to Gemini BEFORE saving it.
// This catches typos and revoked keys immediately instead of failing later
// during an actual humanize/convert request.

export async function PATCH(req: NextRequest): Promise<Response> {
  return withAuth(req, async (innerReq, { userId }) => {
    try {
      let body: unknown;
      try { body = await innerReq.json(); }
      catch { return validationError('Request body must be valid JSON'); }

      const parsed = saveApiKeySchema.safeParse(body);
      if (!parsed.success) {
        return validationError(parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      const { apiKey } = parsed.data;

      // ── Test the key with a real Gemini call before persisting ─────────────
      try {
        await validateGeminiKey(apiKey);
      } catch (err) {
        const status = err instanceof GeminiError ? err.status : 400;
        const message = err instanceof GeminiError
          ? err.message
          : 'Could not validate this API key. Double-check it and try again.';
        return Response.json({ error: message }, { status: status === 502 ? 400 : status });
      }

      // ── Encrypt and save ────────────────────────────────────────────────────
      await connectDB();

      const encrypted = encrypt(apiKey);
      const last4 = apiKey.slice(-4);

      const user = await User.findByIdAndUpdate(
        userId,
        { geminiApiKeyEncrypted: encrypted, geminiKeyLast4: last4 },
        { new: true }
      );

      if (!user) return notFound('User');

      return Response.json({
        data: { hasKey: true, last4 },
        message: 'API key saved and verified successfully.',
      });
    } catch (err) {
      return serverError(err, 'PATCH /api/user/api-key');
    }
  });
}

// ─── DELETE /api/user/api-key ─────────────────────────────────────────────────

export async function DELETE(req: NextRequest): Promise<Response> {
  return withAuth(req, async (_req, { userId }) => {
    try {
      await connectDB();

      const user = await User.findByIdAndUpdate(userId, {
        $unset: { geminiApiKeyEncrypted: '', geminiKeyLast4: '' },
      });

      if (!user) return notFound('User');

      return Response.json({ message: 'API key removed.' });
    } catch (err) {
      return serverError(err, 'DELETE /api/user/api-key');
    }
  });
}

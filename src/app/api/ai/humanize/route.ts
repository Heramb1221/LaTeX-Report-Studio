import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/User.model';
import { decrypt } from '@/lib/auth/crypto';
import { callGemini, GeminiError } from '@/lib/gemini/client';
import { aiTextSchema } from '@/lib/validations/apiKey';
import { withAuth, validationError, notFound, serverError } from '@/lib/auth/middleware';

// System prompt is intentionally narrow: rewrite only, never add new facts,
// never invent content. This matches the product's core philosophy of
// minimizing AI involvement to assistance, not authorship.
const HUMANIZE_SYSTEM_PROMPT = `You are a technical writing assistant. Rewrite the provided text to sound natural and human-written while preserving all technical accuracy, terminology, and meaning. Do not add new information, facts, or claims that are not already present in the input. Do not shorten or summarize — preserve the original length and level of detail. Output only the rewritten text with no explanation, preamble, or markdown formatting.`;

export async function POST(req: NextRequest): Promise<Response> {
  return withAuth(req, async (innerReq, { userId }) => {
    try {
      let body: unknown;
      try { body = await innerReq.json(); }
      catch { return validationError('Request body must be valid JSON'); }

      const parsed = aiTextSchema.safeParse(body);
      if (!parsed.success) {
        return validationError(parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      await connectDB();

      const user = await User.findById(userId).select('geminiApiKeyEncrypted');
      if (!user) return notFound('User');

      if (!user.geminiApiKeyEncrypted) {
        return Response.json(
          {
            error:
              'No Gemini API key configured. Add one in Settings to use AI features.',
          },
          { status: 400 }
        );
      }

      const apiKey = decrypt(user.geminiApiKeyEncrypted);

      const result = await callGemini(
        apiKey,
        HUMANIZE_SYSTEM_PROMPT,
        parsed.data.text
      );

      return Response.json({ data: { result } });
    } catch (err) {
      if (err instanceof GeminiError) {
        return Response.json({ error: err.message }, { status: err.status });
      }
      return serverError(err, 'POST /api/ai/humanize');
    }
  });
}

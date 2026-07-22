import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/User.model';
import { decrypt } from '@/lib/auth/crypto';
import { callGemini, GeminiError } from '@/lib/gemini/client';
import { aiTextSchema } from '@/lib/validations/apiKey';
import { withAuth, validationError, notFound, serverError } from '@/lib/auth/middleware';

const CONVERT_SYSTEM_PROMPT = `You are a LaTeX formatting expert. Convert the provided plain text into valid LaTeX markup suitable for an IEEE-format academic report. Use appropriate commands for paragraphs, emphasis (\\textbf, \\textit), lists (itemize/enumerate) where the text implies a list, and standard LaTeX special-character escaping (%, &, #, _, etc). Do not add section or chapter headings unless the input text clearly is one. Do not invent content, citations, or labels that are not implied by the input. Preserve all original meaning and information exactly. Output only the LaTeX code with no explanation, preamble, or markdown code fences.`;

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
        CONVERT_SYSTEM_PROMPT,
        parsed.data.text
      );

      return Response.json({ data: { result } });
    } catch (err) {
      if (err instanceof GeminiError) {
        return Response.json({ error: err.message }, { status: err.status });
      }
      return serverError(err, 'POST /api/ai/convert');
    }
  });
}

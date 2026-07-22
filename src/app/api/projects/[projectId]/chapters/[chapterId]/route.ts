import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { Project } from '@/lib/db/models/Project.model';
import { withAuth, validationError, notFound, serverError } from '@/lib/auth/middleware';

// ─── Schema ───────────────────────────────────────────────────────────────────
// Both fields are optional so callers can update just content OR just title.

const patchSchema = z.object({
  content: z.string().optional(),
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(120)
    .trim()
    .optional(),
}).refine(
  (d) => d.content !== undefined || d.title !== undefined,
  { message: 'Provide at least one of: content, title' }
);

// ─── Shared param helper ──────────────────────────────────────────────────────

async function getParams(params: Promise<{ projectId: string; chapterId: string }>) {
  return params;
}

// ─── PATCH /api/projects/[projectId]/chapters/[chapterId] ─────────────────────
// Used for both auto-save (content only) and inline rename (title only).

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; chapterId: string }> }
): Promise<Response> {
  return withAuth(req, async (innerReq, { userId }) => {
    try {
      const { projectId, chapterId } = await getParams(params);

      let body: unknown;
      try { body = await innerReq.json(); }
      catch { return validationError('Request body must be valid JSON'); }

      const parsed = patchSchema.safeParse(body);
      if (!parsed.success) {
        return validationError(parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      await connectDB();

      // Build the $set payload using the positional $ operator.
      // The query condition 'chapters.id': chapterId makes $ point to that element.
      const setFields: Record<string, string> = {};
      if (parsed.data.content !== undefined) {
        setFields['chapters.$.content'] = parsed.data.content;
      }
      if (parsed.data.title !== undefined) {
        setFields['chapters.$.title'] = parsed.data.title;
      }

      const result = await Project.updateOne(
        { _id: projectId, userId, 'chapters.id': chapterId },
        { $set: setFields }
      );

      if (result.matchedCount === 0) return notFound('Chapter');

      return Response.json({ message: 'Chapter updated' });
    } catch (err) {
      return serverError(err, 'PATCH /chapters/[chapterId]');
    }
  });
}

// ─── DELETE /api/projects/[projectId]/chapters/[chapterId] ────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; chapterId: string }> }
): Promise<Response> {
  return withAuth(req, async (_req, { userId }) => {
    try {
      const { projectId, chapterId } = await getParams(params);

      await connectDB();

      const result = await Project.updateOne(
        { _id: projectId, userId },
        { $pull: { chapters: { id: chapterId } } }
      );

      if (result.matchedCount === 0) return notFound('Project');

      return Response.json({ message: 'Chapter deleted' });
    } catch (err) {
      return serverError(err, 'DELETE /chapters/[chapterId]');
    }
  });
}

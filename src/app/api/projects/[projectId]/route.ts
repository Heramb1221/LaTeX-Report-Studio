import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { Project } from '@/lib/db/models/Project.model';
import { withAuth, validationError, notFound, serverError } from '@/lib/auth/middleware';

// ─── Validation ───────────────────────────────────────────────────────────────

const updateSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name cannot be empty')
    .max(120, 'Name must be 120 characters or fewer')
    .trim()
    .optional(),
  description: z
    .string()
    .max(300, 'Description must be 300 characters or fewer')
    .trim()
    .optional(),
});

// ─── Shared param extractor ───────────────────────────────────────────────────
// In Next.js 15, route segment params are async.

async function getProjectId(
  params: Promise<{ projectId: string }>
): Promise<string> {
  const { projectId } = await params;
  return projectId;
}

function serializeProject(doc: Record<string, unknown>): Record<string, unknown> {
  return {
    ...doc,
    _id: String(doc._id),
    userId: String(doc.userId),
  };
}

// ─── GET /api/projects/[projectId] ───────────────────────────────────────────
// Returns the full project document including all chapters, references, etc.

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<Response> {
  return withAuth(req, async (_req, { userId }) => {
    try {
      const projectId = await getProjectId(params);
      await connectDB();

      const project = await Project.findOne({ _id: projectId, userId }).lean();
      if (!project) return notFound('Project');

      return Response.json({ data: serializeProject(project as Record<string, unknown>) });
    } catch (err) {
      return serverError(err, 'GET /api/projects/[projectId]');
    }
  });
}

// ─── PATCH /api/projects/[projectId] ─────────────────────────────────────────
// Updates the project name and/or description.
// Chapter content is updated via /api/projects/[id]/chapters/[cid] (Phase 5).

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<Response> {
  return withAuth(req, async (innerReq, { userId }) => {
    try {
      const projectId = await getProjectId(params);

      let body: unknown;
      try {
        body = await innerReq.json();
      } catch {
        return validationError('Request body must be valid JSON');
      }

      const parsed = updateSchema.safeParse(body);
      if (!parsed.success) {
        return validationError(parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      // Guard against empty update
      if (Object.keys(parsed.data).length === 0) {
        return validationError('No fields to update');
      }

      await connectDB();

      const updated = await Project.findOneAndUpdate(
        { _id: projectId, userId },
        { $set: parsed.data },
        { new: true }
      ).lean();

      if (!updated) return notFound('Project');

      return Response.json({ data: serializeProject(updated as Record<string, unknown>) });
    } catch (err) {
      return serverError(err, 'PATCH /api/projects/[projectId]');
    }
  });
}

// ─── DELETE /api/projects/[projectId] ────────────────────────────────────────
// Deletes the project document.
// NOTE: R2 asset cleanup (images, diagram PNGs) is added in Phase 12.

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<Response> {
  return withAuth(req, async (_req, { userId }) => {
    try {
      const projectId = await getProjectId(params);
      await connectDB();

      const deleted = await Project.findOneAndDelete({ _id: projectId, userId });
      if (!deleted) return notFound('Project');

      return Response.json({ message: 'Project deleted successfully' });
    } catch (err) {
      return serverError(err, 'DELETE /api/projects/[projectId]');
    }
  });
}

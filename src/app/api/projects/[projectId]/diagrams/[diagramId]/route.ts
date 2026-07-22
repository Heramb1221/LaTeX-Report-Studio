import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { Project } from '@/lib/db/models/Project.model';
import { deleteFile } from '@/lib/storage/client';
import { withAuth, validationError, notFound, serverError } from '@/lib/auth/middleware';

const patchSchema = z.object({
  drawioXml: z.string().optional(),
  name: z.string().min(1).max(120).trim().optional(),
}).refine(
  (d) => d.drawioXml !== undefined || d.name !== undefined,
  { message: 'Provide at least one of: drawioXml, name' }
);

// ─── PATCH — plain save (no PNG export) ───────────────────────────────────────
// Used by the diagram modal's "Save" button. Persists the latest XML
// (cached from draw.io's autosave events) without touching the PNG.

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; diagramId: string }> }
): Promise<Response> {
  return withAuth(req, async (innerReq, { userId }) => {
    try {
      const { projectId, diagramId } = await params;

      let body: unknown;
      try { body = await innerReq.json(); }
      catch { return validationError('Request body must be valid JSON'); }

      const parsed = patchSchema.safeParse(body);
      if (!parsed.success) {
        return validationError(parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      await connectDB();

      const setFields: Record<string, string> = {};
      if (parsed.data.drawioXml !== undefined) {
        setFields['diagrams.$.drawioXml'] = parsed.data.drawioXml;
      }
      if (parsed.data.name !== undefined) {
        setFields['diagrams.$.name'] = parsed.data.name;
      }

      const result = await Project.updateOne(
        { _id: projectId, userId, 'diagrams.id': diagramId },
        { $set: setFields }
      );

      if (result.matchedCount === 0) return notFound('Diagram');

      return Response.json({ message: 'Diagram saved' });
    } catch (err) {
      return serverError(err, 'PATCH /diagrams/[diagramId]');
    }
  });
}

// ─── DELETE ────────────────────────────────────────────────────────────────────
// Also removes the exported PNG from R2 if one exists, so we don't leak
// orphaned files in the bucket.

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; diagramId: string }> }
): Promise<Response> {
  return withAuth(req, async (_req, { userId }) => {
    try {
      const { projectId, diagramId } = await params;

      await connectDB();

      const project = await Project.findOne({ _id: projectId, userId });
      if (!project) return notFound('Project');

      const diagram = project.diagrams.find((d) => d.id === diagramId);
      if (!diagram) return notFound('Diagram');

      // Best-effort Blob cleanup — don't fail the whole delete if this errors
      if (diagram.pngUrl) {
        try {
          await deleteFile(diagram.pngUrl);
        } catch (blobErr) {
          console.error('[DELETE /diagrams] Blob cleanup failed (continuing):', blobErr);
        }
      }

      project.diagrams = project.diagrams.filter((d) => d.id !== diagramId) as typeof project.diagrams;
      await project.save();

      return Response.json({ message: 'Diagram deleted' });
    } catch (err) {
      return serverError(err, 'DELETE /diagrams/[diagramId]');
    }
  });
}

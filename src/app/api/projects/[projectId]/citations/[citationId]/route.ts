import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Project } from '@/lib/db/models/Project.model';
import { withAuth, validationError, notFound, serverError } from '@/lib/auth/middleware';
import { citationUpdateSchema } from '@/lib/validations/citation';
import {
  buildBibtex,
} from '@/lib/bibtex/generator';
import { FIELD_DEFS } from '@/lib/bibtex/fieldConfig';
import type { IReferenceFields, IReference } from '@/types';

// ─── PATCH ─────────────────────────────────────────────────────────────────────
// Updates a citation's type and/or fields, regenerates its bibtex string.
// The citeKey is intentionally NEVER regenerated here — see PHASE9-SETUP.md
// for why (existing \cite{} commands in chapters must keep working).

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; citationId: string }> }
): Promise<Response> {
  return withAuth(req, async (innerReq, { userId }) => {
    try {
      const { projectId, citationId } = await params;

      let body: unknown;
      try { body = await innerReq.json(); }
      catch { return validationError('Request body must be valid JSON'); }

      const parsed = citationUpdateSchema.safeParse(body);
      if (!parsed.success) {
        return validationError(parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      await connectDB();

      const project = await Project.findOne({ _id: projectId, userId });
      if (!project) return notFound('Project');

      const ref = project.references.find((r) => r.id === citationId);
      if (!ref) return notFound('Citation');

      const newEntryType = (parsed.data.entryType ?? ref.entryType) as IReference['entryType'];
      const newFields = (parsed.data.fields ?? ref.fields) as unknown as IReferenceFields;

      // Re-validate required fields for the (possibly new) entry type
      const requiredDefs = FIELD_DEFS[newEntryType].filter((f) => f.required);
      const missing = requiredDefs.filter((def) => {
        const v = newFields[def.key as keyof IReferenceFields];
        return !v || !v.trim();
      });
      if (missing.length > 0) {
        const labels = missing.map((def) => def.label).join(', ');
        return validationError(`Missing required fields: ${labels}`);
      }

      const bibtex = buildBibtex({ entryType: newEntryType, fields: newFields as unknown as Record<string, string>, citeKey: ref.citeKey });

      ref.entryType = newEntryType;
      ref.fields = newFields as unknown as Record<string, string>;
      ref.bibtex = bibtex;
      await project.save();

      return Response.json({
        data: {
          id: ref.id,
          citeKey: ref.citeKey,
          entryType: newEntryType,
          fields: newFields,
          bibtex,
        },
      });
    } catch (err) {
      return serverError(err, 'PATCH /citations/[citationId]');
    }
  });
}

// ─── DELETE ────────────────────────────────────────────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; citationId: string }> }
): Promise<Response> {
  return withAuth(req, async (_req, { userId }) => {
    try {
      const { projectId, citationId } = await params;

      await connectDB();

      const result = await Project.updateOne(
        { _id: projectId, userId },
        { $pull: { references: { id: citationId } } }
      );

      if (result.matchedCount === 0) return notFound('Project');

      return Response.json({ message: 'Citation deleted' });
    } catch (err) {
      return serverError(err, 'DELETE /citations/[citationId]');
    }
  });
}

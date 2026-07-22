import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '@/lib/db/mongoose';
import { Project } from '@/lib/db/models/Project.model';
import { withAuth, validationError, notFound, serverError } from '@/lib/auth/middleware';
import { citationSchema } from '@/lib/validations/citation';
import {
  generateCiteKey,
  buildBibtex,
} from '@/lib/bibtex/generator';
import { FIELD_DEFS } from '@/lib/bibtex/fieldConfig';
import type { IReferenceFields } from '@/types';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<Response> {
  return withAuth(req, async (innerReq, { userId }) => {
    try {
      const { projectId } = await params;

      let body: unknown;
      try { body = await innerReq.json(); }
      catch { return validationError('Request body must be valid JSON'); }

      const parsed = citationSchema.safeParse(body);
      if (!parsed.success) {
        return validationError(parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      const { entryType, fields } = parsed.data;

      // ── Type-specific required-field check ──────────────────────────────────
      // Can't be expressed in the static Zod schema since requiredness
      // depends on entryType (journal required for articles, not for books).
      const requiredDefs = FIELD_DEFS[entryType].filter((f) => f.required);
      const missing = requiredDefs.filter((def) => {
        const v = fields[def.key as keyof typeof fields];
        return !v || !v.trim();
      });
      if (missing.length > 0) {
        const labels = missing.map((def) => def.label).join(', ');
        return validationError(`Missing required fields: ${labels}`);
      }

      await connectDB();

      const project = await Project.findOne({ _id: projectId, userId });
      if (!project) return notFound('Project');

      const existingKeys = new Set(project.references.map((r) => r.citeKey));
      const citeKey = generateCiteKey(fields.author || 'Unknown', fields.year || new Date().getFullYear().toString(), existingKeys);
      const bibtex = buildBibtex({ entryType, fields: fields as unknown as Record<string, string>, citeKey });

      const newReference = {
        id: uuidv4(),
        citeKey,
        entryType,
        fields: fields as unknown as Record<string, string>,
        bibtex,
      };

      project.references.push(newReference);
      await project.save();

      return Response.json({ data: newReference }, { status: 201 });
    } catch (err) {
      return serverError(err, 'POST /citations');
    }
  });
}

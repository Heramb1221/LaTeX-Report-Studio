import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { Project } from '@/lib/db/models/Project.model';
import { withAuth, validationError, serverError } from '@/lib/auth/middleware';
import { createDefaultChapters } from '@/config/templates';
import type { ProjectTemplate } from '@/types';

// ─── Validation ───────────────────────────────────────────────────────────────

const createSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(120, 'Name must be 120 characters or fewer')
    .trim(),
  description: z
    .string()
    .max(300, 'Description must be 300 characters or fewer')
    .trim()
    .optional(),
  template: z.enum(['ieee_report', 'mini_project', 'seminar', 'fyp'], {
    errorMap: () => ({ message: 'Invalid template selected' }),
  }),
});

// ─── GET /api/projects ────────────────────────────────────────────────────────
// Returns all projects belonging to the current user, sorted newest-first.
// Uses .lean() for raw JS objects — faster than Mongoose documents for reads.

export async function GET(req: NextRequest): Promise<Response> {
  return withAuth(req, async (_req, { userId }) => {
    try {
      await connectDB();

      const projects = await Project.find({ userId })
        .sort({ updatedAt: -1 })
        .select('_id userId name description template chapters updatedAt createdAt')
        .lean();

      // Remap _id to string for the client
      const serialized = projects.map((p) => ({
        ...p,
        _id: p._id.toString(),
        userId: p.userId.toString(),
      }));

      return Response.json({ data: serialized });
    } catch (err) {
      return serverError(err, 'GET /api/projects');
    }
  });
}

// ─── POST /api/projects ───────────────────────────────────────────────────────
// Creates a new project with default chapters populated from the selected template.

export async function POST(req: NextRequest): Promise<Response> {
  return withAuth(req, async (_req, { userId }) => {
    try {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return validationError('Request body must be valid JSON');
      }

      const parsed = createSchema.safeParse(body);
      if (!parsed.success) {
        return validationError(parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      const { name, description, template } = parsed.data;

      await connectDB();

      // Build default chapters from the chosen template
      const chapters = createDefaultChapters(template as ProjectTemplate);

      const project = await Project.create({
        userId,
        name,
        description,
        template,
        chapters,
      });

      // Return the full document with string _id
      const doc = project.toObject();

      return Response.json(
        {
          data: {
            ...doc,
            _id: doc._id.toString(),
            userId: doc.userId.toString(),
          },
        },
        { status: 201 }
      );
    } catch (err) {
      return serverError(err, 'POST /api/projects');
    }
  });
}

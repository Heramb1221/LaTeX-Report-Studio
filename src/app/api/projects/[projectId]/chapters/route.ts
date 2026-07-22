import { NextRequest } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '@/lib/db/mongoose';
import { Project } from '@/lib/db/models/Project.model';
import { withAuth, validationError, notFound, serverError } from '@/lib/auth/middleware';
import { getTemplate } from '@/config/templates';
import type { ProjectTemplate } from '@/types';

const addSchema = z.object({
  title: z
    .string()
    .min(1, 'Chapter title is required')
    .max(120, 'Title must be 120 characters or fewer')
    .trim(),
});

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

      const parsed = addSchema.safeParse(body);
      if (!parsed.success) {
        return validationError(parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      const { title } = parsed.data;

      await connectDB();

      const project = await Project.findOne({ _id: projectId, userId });
      if (!project) return notFound('Project');

      // New chapter order = one after the current highest
      const maxOrder = project.chapters.reduce(
        (max, ch) => Math.max(max, ch.order),
        -1
      );
      const order = maxOrder + 1;

      // Generate a default stub matching the template's section command
      const template = getTemplate(project.template as ProjectTemplate);
      const stub = `${template.sectionCommand}{${title}}\n\n% Write your ${title.toLowerCase()} here.\n`;

      const newChapter = {
        id: uuidv4(),
        title,
        content: stub,
        order,
      };

      project.chapters.push(newChapter);
      await project.save();

      return Response.json({ data: newChapter }, { status: 201 });
    } catch (err) {
      return serverError(err, 'POST /chapters');
    }
  });
}

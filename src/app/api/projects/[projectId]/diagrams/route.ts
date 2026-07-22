import { NextRequest } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '@/lib/db/mongoose';
import { Project } from '@/lib/db/models/Project.model';
import { withAuth, validationError, notFound, serverError } from '@/lib/auth/middleware';
import { DIAGRAM_TYPES, BLANK_DIAGRAM_XML } from '@/lib/diagram/constants';

const createSchema = z.object({
  name: z
    .string()
    .min(1, 'Diagram name is required')
    .max(120, 'Name must be 120 characters or fewer')
    .trim(),
  diagramType: z.enum(DIAGRAM_TYPES, {
    errorMap: () => ({ message: 'Invalid diagram type' }),
  }),
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

      const parsed = createSchema.safeParse(body);
      if (!parsed.success) {
        return validationError(parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      const { name, diagramType } = parsed.data;

      await connectDB();

      const project = await Project.findOne({ _id: projectId, userId });
      if (!project) return notFound('Project');

      const newDiagram = {
        id: uuidv4(),
        name,
        diagramType,
        drawioXml: BLANK_DIAGRAM_XML,
      };

      project.diagrams.push(newDiagram);
      await project.save();

      return Response.json({ data: newDiagram }, { status: 201 });
    } catch (err) {
      return serverError(err, 'POST /diagrams');
    }
  });
}

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { Project } from '@/lib/db/models/Project.model';
import { withAuth, validationError, notFound, serverError } from '@/lib/auth/middleware';

const reorderSchema = z.object({
  // Array of chapter IDs in the desired order.
  // orderedIds[0] → order 0, orderedIds[1] → order 1, etc.
  orderedIds: z.array(z.string().uuid()).min(1, 'orderedIds must not be empty'),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<Response> {
  return withAuth(req, async (innerReq, { userId }) => {
    try {
      const { projectId } = await params;

      let body: unknown;
      try { body = await innerReq.json(); }
      catch { return validationError('Request body must be valid JSON'); }

      const parsed = reorderSchema.safeParse(body);
      if (!parsed.success) {
        return validationError(parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      const { orderedIds } = parsed.data;

      await connectDB();

      const project = await Project.findOne({ _id: projectId, userId });
      if (!project) return notFound('Project');

      // Validate that all provided IDs exist in the project
      const existingIds = new Set(project.chapters.map((ch) => ch.id));
      const unknownIds = orderedIds.filter((id) => !existingIds.has(id));
      if (unknownIds.length > 0) {
        return validationError(`Unknown chapter IDs: ${unknownIds.join(', ')}`);
      }

      // Remap order values: position in orderedIds becomes the new order number.
      // Chapters not mentioned in orderedIds keep their existing order (edge case).
      const orderMap = new Map(orderedIds.map((id, index) => [id, index]));

      const updatedChapters = project.chapters.map((ch) => ({
        id: ch.id,
        title: ch.title,
        content: ch.content,
        order: orderMap.has(ch.id) ? orderMap.get(ch.id)! : ch.order,
      }));

      await Project.updateOne(
        { _id: projectId, userId },
        { $set: { chapters: updatedChapters } }
      );

      return Response.json({ message: 'Chapters reordered' });
    } catch (err) {
      return serverError(err, 'PATCH /chapters/reorder');
    }
  });
}

import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Project } from '@/lib/db/models/Project.model';
import { deleteFile } from '@/lib/storage/client';
import { withAuth, notFound, serverError } from '@/lib/auth/middleware';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; imageId: string }> }
): Promise<Response> {
  return withAuth(req, async (_req, { userId }) => {
    try {
      const { projectId, imageId } = await params;

      await connectDB();

      const project = await Project.findOne({ _id: projectId, userId });
      if (!project) return notFound('Project');

      const image = project.images.find((img) => img.id === imageId);
      if (!image) return notFound('Image');

      // ── Delete from Vercel Blob first (best-effort) ───────────────────────
      // Don't let a Blob error prevent the DB record from being removed.
      // Orphaned Blob objects are much less harmful than orphaned DB records
      // that keep pointing to deleted files.
      try {
        await deleteFile(image.publicUrl);
      } catch (blobErr) {
        console.error('[DELETE /images] Blob cleanup failed (continuing):', blobErr);
      }

      // ── Remove from project.images array ──────────────────────────────────
      project.images = project.images.filter(
        (img) => img.id !== imageId
      ) as typeof project.images;

      await project.save();

      return Response.json({ message: 'Image deleted' });
    } catch (err) {
      return serverError(err, 'DELETE /images/[imageId]');
    }
  });
}

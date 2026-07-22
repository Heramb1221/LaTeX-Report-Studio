import { NextRequest } from 'next/server';
import JSZip from 'jszip';
import { connectDB } from '@/lib/db/mongoose';
import { Project } from '@/lib/db/models/Project.model';
import { getFileBuffer } from '@/lib/storage/client';
import { assembleMainTex, assembleBibFile } from '@/lib/latex/assembler';
import { withAuth, notFound, serverError } from '@/lib/auth/middleware';

// Give the route enough time to fetch all assets from Vercel Blob.
// On Vercel Hobby this cap is ignored (hard 10s), but on Pro / Render it matters.
export const maxDuration = 60;

// ─── Slug helper ──────────────────────────────────────────────────────────────
// Produces a safe filename for the zip itself from the project name.

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || 'project';
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<Response> {
  return withAuth(req, async (_req, { userId }) => {
    try {
      const { projectId } = await params;

      await connectDB();

      const project = await Project.findOne({ _id: projectId, userId });
      if (!project) return notFound('Project');

      const zip = new JSZip();

      // ── 1. main.tex ─────────────────────────────────────────────────────────
      const mainTex = assembleMainTex(project);
      zip.file('main.tex', mainTex);

      // ── 2. references.bib ───────────────────────────────────────────────────
      const bibContent = assembleBibFile(project);
      zip.file('references.bib', bibContent);

      // ── 3. Images from Blob ───────────────────────────────────────────────────
      // Fetch all in parallel; skip any that fail (stale keys, etc.)
      const imageFolder = zip.folder('images')!;

      const imageResults = await Promise.allSettled(
        (project.images ?? []).map(async (img) => {
          const buffer = await getFileBuffer(img.publicUrl);
          // Use just the filename part of the R2 key, preserving the original name
          // so \includegraphics{images/uuid-name.png} resolves correctly.
          const filename = img.r2Key.split('/').pop() ?? img.originalName;
          imageFolder.file(filename, buffer);
        })
      );

      const failedImages = imageResults.filter((r) => r.status === 'rejected');
      if (failedImages.length > 0) {
        console.warn(
          `[export] ${failedImages.length} image(s) could not be fetched from Blob:`,
          failedImages.map((r) => (r as PromiseRejectedResult).reason)
        );
      }

      // ── 4. Diagram PNGs from Blob ─────────────────────────────────────────────
      // Only exported diagrams (those with a pngR2Key) are included.
      // Diagrams that were saved as XML but never exported to PNG are skipped —
      // they have no PNG to include, and the user hasn't inserted them into
      // any chapter either.
      const diagramFolder = zip.folder('diagrams')!;

      const exportedDiagrams = (project.diagrams ?? []).filter(
        (d) => d.pngR2Key && d.pngUrl
      );

      const diagramResults = await Promise.allSettled(
        exportedDiagrams.map(async (d) => {
          const buffer = await getFileBuffer(d.pngUrl!);
          // The R2 key is diagrams/{projectId}/{diagramId}.png
          // We want just the filename portion for the zip path.
          const filename = d.pngR2Key!.split('/').pop()!;
          diagramFolder.file(filename, buffer);
        })
      );

      const failedDiagrams = diagramResults.filter((r) => r.status === 'rejected');
      if (failedDiagrams.length > 0) {
        console.warn(
          `[export] ${failedDiagrams.length} diagram(s) could not be fetched from Blob:`,
          failedDiagrams.map((r) => (r as PromiseRejectedResult).reason)
        );
      }

      // ── 5. Generate zip buffer ───────────────────────────────────────────────
      // compression: DEFLATE gives a meaningful size reduction for text files
      // (.tex, .bib) at the cost of a few extra milliseconds of CPU.
      // Images are already compressed, so DEFLATE has minimal impact on them —
      // but it doesn't hurt to apply it uniformly.
      const zipBuffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const zipFilename = `${slugify(project.name)}.zip`;

      return new Response(zipBuffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${zipFilename}"`,
          'Content-Length': String(zipBuffer.length),
          // Prevent browsers from caching the zip — each export should
          // always reflect the latest project state.
          'Cache-Control': 'no-store',
        },
      });
    } catch (err) {
      return serverError(err, 'GET /export');
    }
  });
}

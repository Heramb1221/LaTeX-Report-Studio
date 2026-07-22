import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { Project } from '@/lib/db/models/Project.model';
import { uploadFile, deleteFile } from '@/lib/storage/client';
import { slugify } from '@/lib/diagram/slug';
import { withAuth, validationError, notFound, serverError } from '@/lib/auth/middleware';

// draw.io returns the export as a data URL: "data:image/png;base64,iVBORw0KG..."
const DATA_URL_PREFIX = 'data:image/png;base64,';

const exportSchema = z.object({
  // The latest in-memory XML, captured from draw.io's autosave events.
  // We persist this alongside the PNG so "Export" also counts as a save.
  drawioXml: z.string().min(1, 'drawioXml is required'),
  pngDataUrl: z
    .string()
    .startsWith(DATA_URL_PREFIX, 'Expected a PNG data URL from draw.io'),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; diagramId: string }> }
): Promise<Response> {
  return withAuth(req, async (innerReq, { userId }) => {
    try {
      const { projectId, diagramId } = await params;

      let body: unknown;
      try { body = await innerReq.json(); }
      catch { return validationError('Request body must be valid JSON'); }

      const parsed = exportSchema.safeParse(body);
      if (!parsed.success) {
        return validationError(parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      const { drawioXml, pngDataUrl } = parsed.data;

      await connectDB();

      const project = await Project.findOne({ _id: projectId, userId });
      if (!project) return notFound('Project');

      const diagram = project.diagrams.find((d) => d.id === diagramId);
      if (!diagram) return notFound('Diagram');

      // ── Decode base64 PNG ────────────────────────────────────────────────────
      const base64Data = pngDataUrl.slice(DATA_URL_PREFIX.length);
      const pngBuffer = Buffer.from(base64Data, 'base64');

      // ── Clean up the previous PNG if this diagram was exported before ───────
      if (diagram.pngUrl) {
        try {
          await deleteFile(diagram.pngUrl);
        } catch (blobErr) {
          console.error('[export] Failed to delete old PNG (continuing):', blobErr);
        }
      }

      // ── Upload new PNG ────────────────────────────────────────────────────────
      const r2Key = `diagrams/${projectId}/${diagramId}.png`;
      const publicUrl = await uploadFile(r2Key, pngBuffer, 'image/png');

      // ── Generate the LaTeX figure block ──────────────────────────────────────
      // IMPORTANT: this must reference the file's *actual* stored basename
      // (the diagramId, since r2Key is `diagrams/{projectId}/{diagramId}.png`),
      // not a human-readable slug — the slug was never the real filename on
      // disk/S3, which silently broke every diagram figure at compile time.
      const pngFilename = r2Key.split('/').pop()!;
      const latexCommand = [
        '\\begin{figure}[h!]',
        '  \\centering',
        `  \\includegraphics[width=0.9\\linewidth]{diagrams/${pngFilename}}`,
        `  \\caption{${diagram.name}}`,
        `  \\label{fig:${slugify(diagram.name)}}`,
        '\\end{figure}',
      ].join('\n');

      // ── Persist everything to the diagram sub-document ──────────────────────
      diagram.drawioXml = drawioXml;
      diagram.pngR2Key = r2Key;
      diagram.pngUrl = publicUrl;
      diagram.latexCommand = latexCommand;
      await project.save();

      return Response.json({
        data: {
          pngUrl: publicUrl,
          latexCommand,
        },
      });
    } catch (err) {
      return serverError(err, 'POST /diagrams/[diagramId]/export');
    }
  });
}

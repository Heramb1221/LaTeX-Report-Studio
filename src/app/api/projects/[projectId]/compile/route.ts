import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Project } from '@/lib/db/models/Project.model';
import { withAuth, notFound, serverError } from '@/lib/auth/middleware';
import { assembleMainTex, assembleBibFile } from '@/lib/latex/assembler';
import { compileLatexToPdf, type CompileAsset } from '@/lib/latex/compiler';

// Vercel Hobby tier caps functions at 10s regardless of this value.
// On Pro tier (or Render/self-hosted), this raises the actual ceiling to 60s,
// which covers slower compiles (multi-chapter reports with several diagrams).
export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<Response> {
  return withAuth(req, async (_req, { userId }) => {
    try {
      const { projectId } = await params;

      await connectDB();

      const project = await Project.findOne({ _id: projectId, userId });
      if (!project) return notFound('Project');

      // ── 1. Assemble the full LaTeX source ───────────────────────────────────
      const mainTex = assembleMainTex(project);
      const bibContent = assembleBibFile(project);

      // ── 1b. Collect every image/diagram figure the source references ────────
      // Paths must exactly match what \includegraphics{...} uses in the
      // generated LaTeX (see images/route.ts and diagrams/export/route.ts) —
      // same convention as the export/zip route's bundling.
      const assets: CompileAsset[] = [
        ...(project.images ?? []).map((img) => ({
          path: `images/${img.r2Key.split('/').pop()}`,
          url: img.publicUrl,
        })),
        ...(project.diagrams ?? [])
          .filter((d) => d.pngR2Key && d.pngUrl)
          .map((d) => ({
            path: `diagrams/${d.pngR2Key!.split('/').pop()}`,
            url: d.pngUrl!,
          })),
      ];

      // ── 2. Send to the compiler service ─────────────────────────────────────
      const result = await compileLatexToPdf(mainTex, bibContent, assets);

      if (!result.success || !result.pdfBuffer) {
        return Response.json(
          {
            error: 'Compilation failed',
            log: result.errorLog ?? 'Unknown compilation error.',
          },
          { status: 422 }
        );
      }

      // ── 3. Record successful compile timestamp ──────────────────────────────
      project.lastCompiledAt = new Date();
      await project.save();

      // ── 4. Return PDF as base64 (JSON-safe transport) ───────────────────────
      const pdfBase64 = result.pdfBuffer.toString('base64');

      return Response.json({
        data: {
          pdfBase64,
          compiledAt: project.lastCompiledAt.toISOString(),
        },
      });
    } catch (err) {
      return serverError(err, 'POST /compile');
    }
  });
}

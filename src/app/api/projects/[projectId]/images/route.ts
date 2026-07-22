import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '@/lib/db/mongoose';
import { Project } from '@/lib/db/models/Project.model';
import { uploadFile } from '@/lib/storage/client';
import { withAuth, notFound, serverError } from '@/lib/auth/middleware';

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// ─── LaTeX figure block generator ────────────────────────────────────────────

function generateFigureLatex(filename: string): string {
  // Strip the uuid prefix to get a clean label
  // e.g. "a1b2c3d4-photo.png" → "photo"
  const nameWithoutUuid = filename.replace(/^[a-f0-9-]{36}-/, '');
  const labelSlug = nameWithoutUuid
    .replace(/\.[^.]+$/, '')           // remove extension
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')       // non-alphanumeric → hyphen
    .replace(/-+/g, '-')              // collapse hyphens
    .replace(/^-|-$/g, '')            // trim edge hyphens
    || 'figure';

  return [
    '\\begin{figure}[h!]',
    '  \\centering',
    `  \\includegraphics[width=0.8\\linewidth]{images/${filename}}`,
    '  \\caption{Figure caption here}',
    `  \\label{fig:${labelSlug}}`,
    '\\end{figure}',
  ].join('\n');
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<Response> {
  return withAuth(req, async (_req, { userId }) => {
    try {
      const { projectId } = await params;

      // ── Parse multipart form data ──────────────────────────────────────────
      let formData: FormData;
      try {
        formData = await req.formData();
      } catch {
        return Response.json(
          { error: 'Invalid multipart form data' },
          { status: 400 }
        );
      }

      const file = formData.get('file') as File | null;

      if (!file) {
        return Response.json(
          { error: 'No file provided. Include a file field in the form data.' },
          { status: 400 }
        );
      }

      // ── Validate MIME type ─────────────────────────────────────────────────
      const ext = ALLOWED_MIME_TYPES[file.type];
      if (!ext) {
        return Response.json(
          {
            error: `File type "${file.type}" is not supported. ` +
              'Upload a JPG, PNG, GIF, or WebP image.',
          },
          { status: 415 }
        );
      }

      // ── Validate file size ─────────────────────────────────────────────────
      if (file.size > MAX_FILE_SIZE) {
        return Response.json(
          { error: 'File is too large. Maximum size is 5 MB.' },
          { status: 413 }
        );
      }

      // ── Build a safe filename ──────────────────────────────────────────────
      // uuid prefix avoids name collisions. Keep the original name (sanitised)
      // so the explorer shows something human-readable.
      const safeOriginal = file.name
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase();

      const uuid = uuidv4();
      const filename = `${uuid}-${safeOriginal}`;
      const r2Key = `images/${projectId}/${filename}`;

      // ── Upload to Vercel Blob ──────────────────────────────────────────────
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const publicUrl = await uploadFile(r2Key, buffer, file.type);

      // ── Generate LaTeX command ─────────────────────────────────────────────
      const latexCommand = generateFigureLatex(filename);

      // ── Save to MongoDB ────────────────────────────────────────────────────
      await connectDB();

      const project = await Project.findOne({ _id: projectId, userId });
      if (!project) {
        // Clean up the uploaded file since the project doesn't exist
        // (best-effort; don't fail if cleanup errors)
        try {
          const { deleteFile } = await import('@/lib/storage/client');
          await deleteFile(publicUrl);
        } catch { /* ignore */ }
        return notFound('Project');
      }

      const newImage = {
        id: uuidv4(),
        originalName: safeOriginal,
        r2Key,
        publicUrl,
        latexCommand,
      };

      project.images.push(newImage);
      await project.save();

      return Response.json({ data: newImage }, { status: 201 });
    } catch (err) {
      return serverError(err, 'POST /images');
    }
  });
}

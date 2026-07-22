// ─── Why YtoTech LaTeX-on-HTTP instead of "LaTeX.Online" ─────────────────────
// The original plan referenced "LaTeX.Online" as a generic compiler API.
// In practice, the most reliable free option that also runs latexmk (so
// \bibliography{} + .bib files resolve correctly in one request) is
// YtoTech's LaTeX-on-HTTP service: https://github.com/YtoTech/latex-on-http
//
// Endpoint: POST https://latex.ytotech.com/builds/sync
// Body:     { compiler: "pdflatex", resources: [{ main: true, content }, ...] }
// Success:  201, Content-Type: application/pdf, raw PDF bytes
// Failure:  4xx, JSON body with a `logs` array describing the LaTeX error
//
// No API key required. No Docker, no server to maintain — fits the zero-budget
// constraint. If this service ever becomes unreliable, swap the URL below for
// a self-hosted Tectonic container on Render's free tier without changing the
// calling code in the compile route.

const COMPILE_ENDPOINT = 'https://latex.ytotech.com/builds/sync';
const COMPILE_TIMEOUT_MS = 45_000;

interface YtoTechResource {
  path?: string;
  main?: boolean;
  content?: string;
  url?: string;
}

export interface CompileAsset {
  /** Path relative to main.tex, exactly as referenced in \includegraphics{...} */
  path: string;
  /** Publicly reachable URL the compiler service can fetch the file from */
  url: string;
}

interface YtoTechErrorLog {
  stage?: string;
  message?: string;
}

interface YtoTechErrorBody {
  logs?: YtoTechErrorLog[] | string;
  description?: string;
}

export interface CompileResult {
  success: boolean;
  pdfBuffer?: Buffer;
  errorLog?: string;
}

// ─── Main compile function ────────────────────────────────────────────────────

export async function compileLatexToPdf(
  mainTex: string,
  bibContent: string,
  assets: CompileAsset[] = []
): Promise<CompileResult> {
  const resources: YtoTechResource[] = [
    { main: true, content: mainTex },
  ];

  // Only attach the .bib file if there's actually bibliography content —
  // sending an essentially-empty file is harmless but unnecessary.
  if (bibContent.trim() && !bibContent.trim().startsWith('% No references')) {
    resources.push({ path: 'references.bib', content: bibContent });
  }

  // Every image and exported diagram referenced via \includegraphics{...}
  // needs to actually be sent to the compiler — otherwise pdflatex fails
  // with "File not found" the moment any figure is in the document. We use
  // YtoTech's `url` resource mode so the compiler fetches straight from S3
  // instead of us downloading + base64-encoding each file ourselves.
  for (const asset of assets) {
    resources.push({ path: asset.path, url: asset.url });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), COMPILE_TIMEOUT_MS);

  try {
    const res = await fetch(COMPILE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compiler: 'pdflatex',
        resources,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // ── Success: response body is the raw PDF ────────────────────────────────
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      return { success: true, pdfBuffer: Buffer.from(arrayBuffer) };
    }

    // ── Failure: response body is JSON describing the LaTeX error ────────────
    const contentType = res.headers.get('content-type') ?? '';
    let errorLog = `Compilation failed with HTTP ${res.status}.`;

    if (contentType.includes('application/json')) {
      const body = (await res.json()) as YtoTechErrorBody;
      if (Array.isArray(body.logs)) {
        errorLog = body.logs
          .map((l) => l.message ?? JSON.stringify(l))
          .join('\n');
      } else if (typeof body.logs === 'string') {
        errorLog = body.logs;
      } else if (body.description) {
        errorLog = body.description;
      }
    } else {
      // Fallback: response was plain text
      errorLog = await res.text();
    }

    return { success: false, errorLog: truncateLog(errorLog) };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof Error && err.name === 'AbortError') {
      return {
        success: false,
        errorLog:
          'Compilation timed out after 45 seconds. Your document may be too ' +
          'large or the compiler service is temporarily slow. Try again, or ' +
          'simplify your document.',
      };
    }

    return {
      success: false,
      errorLog: `Could not reach the compilation service: ${(err as Error).message}`,
    };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// LaTeX logs can be extremely long (thousands of lines for a single missing
// brace). Truncate to keep the response payload and UI panel manageable.
function truncateLog(log: string, maxLength = 4000): string {
  if (log.length <= maxLength) return log;
  return log.slice(0, maxLength) + '\n\n… (log truncated)';
}

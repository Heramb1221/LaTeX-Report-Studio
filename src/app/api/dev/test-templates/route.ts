import { NextRequest } from 'next/server';
import { compileLatexToPdf } from '@/lib/latex/compiler';
import { assembleTemplateForTest } from '@/lib/latex/templateTest';
import type { ProjectTemplate } from '@/types';

// ─── Dev-only guard ───────────────────────────────────────────────────────────
// This route is for local verification only — never expose it in production.
// It costs LaTeX.Online quota and reveals internal template structure.

const ALL_TEMPLATES: ProjectTemplate[] = [
  'ieee_report',
  'mini_project',
  'seminar',
  'fyp',
];

interface TemplateResult {
  template: ProjectTemplate;
  status: 'pass' | 'fail';
  durationMs: number;
  log?: string;
}

export async function GET(_req: NextRequest): Promise<Response> {
  if (process.env.NODE_ENV !== 'development') {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const results: TemplateResult[] = [];

  // Compile sequentially — avoids overwhelming LaTeX.Online with 4 concurrent
  // requests and makes it easier to attribute errors to specific templates.
  for (const templateId of ALL_TEMPLATES) {
    const start = Date.now();

    try {
      const mainTex = assembleTemplateForTest(templateId);

      const result = await compileLatexToPdf(
        mainTex,
        '% No references for template test\n'
      );

      const durationMs = Date.now() - start;

      if (result.success) {
        results.push({ template: templateId, status: 'pass', durationMs });
      } else {
        results.push({
          template: templateId,
          status: 'fail',
          durationMs,
          log: result.errorLog ?? 'Unknown error',
        });
      }
    } catch (err) {
      results.push({
        template: templateId,
        status: 'fail',
        durationMs: Date.now() - start,
        log: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.length - passed;

  return Response.json(
    { results, passed, failed },
    {
      status: failed > 0 ? 207 : 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

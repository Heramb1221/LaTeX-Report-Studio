import { ieeeReportTemplate, type TemplateConfig } from './ieee-report';
import { miniProjectTemplate } from './mini-project';
import { seminarTemplate } from './seminar';
import { fypTemplate } from './fyp';
import { v4 as uuidv4 } from 'uuid';
import type { ProjectTemplate } from '@/types';
import type { IChapterDoc } from '@/lib/db/models/Project.model';

// ─── Re-exports ───────────────────────────────────────────────────────────────
export type { TemplateConfig };
export { ieeeReportTemplate, miniProjectTemplate, seminarTemplate, fypTemplate };

// ─── Template registry ────────────────────────────────────────────────────────
// All templates in a map for O(1) lookup by template id.
export const TEMPLATES: Record<ProjectTemplate, TemplateConfig> = {
  ieee_report: ieeeReportTemplate,
  mini_project: miniProjectTemplate,
  seminar: seminarTemplate,
  fyp: fypTemplate,
};

// Ordered list for UI display (template selector in CreateProjectModal)
export const TEMPLATE_LIST: TemplateConfig[] = [
  ieeeReportTemplate,
  miniProjectTemplate,
  seminarTemplate,
  fypTemplate,
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the template config for a given template id.
 * Throws if the id is not registered — this is a programming error, not a
 * user error, so a hard throw is appropriate here.
 */
export function getTemplate(id: ProjectTemplate): TemplateConfig {
  const template = TEMPLATES[id];
  if (!template) {
    throw new Error(`Unknown template id: "${id}". Valid ids: ${Object.keys(TEMPLATES).join(', ')}`);
  }
  return template;
}

/**
 * Builds the default chapter documents for a new project from a template.
 * Each chapter gets a fresh UUID so we can reference it independently.
 */
export function createDefaultChapters(templateId: ProjectTemplate): IChapterDoc[] {
  const template = getTemplate(templateId);
  return template.defaultChapters.map((ch) => ({
    id: uuidv4(),
    title: ch.title,
    content: ch.stub,
    order: ch.order,
  }));
}

/**
 * Assembles the full LaTeX source for a project.
 * Called by the compile route (Phase 6).
 *
 * Structure:
 *   template.preamble
 *   chapter[0].content
 *   chapter[1].content
 *   ...
 *   template.closing
 */
export function assembleLatex(
  templateId: ProjectTemplate,
  chapters: IChapterDoc[],
  mainTexOverride?: string
): string {
  // If the user has manually edited main.tex, use that directly
  if (mainTexOverride) return mainTexOverride;

  const template = getTemplate(templateId);
  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);
  const body = sortedChapters.map((ch) => ch.content).join('\n\n');

  return [template.preamble, body, template.closing].join('\n');
}

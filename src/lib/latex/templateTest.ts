// Lightweight version of the main assembler used only by the template
// test route. Avoids importing the full Project model and Mongoose so
// the test can run without a DB connection.

import { TEMPLATES } from '@/config/templates';
import type { ProjectTemplate } from '@/types';

/**
 * Assembles the full LaTeX source for a template using its default
 * chapter stubs. Returns the same string that would be compiled for a
 * freshly-created project before the user edits anything.
 */
export function assembleTemplateForTest(templateId: ProjectTemplate): string {
  const template = TEMPLATES[templateId];

  const body = template.defaultChapters
    .sort((a, b) => a.order - b.order)
    .map((ch) => ch.stub)
    .join('\n\n');

  return [template.preamble, body, template.closing].join('\n');
}

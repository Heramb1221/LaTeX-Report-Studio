import { assembleLatex as assembleFromTemplate } from '@/config/templates';
import type { IProjectDocument } from '@/lib/db/models/Project.model';
import type { ProjectTemplate } from '@/types';

// ─── Main .tex assembly ───────────────────────────────────────────────────────
// Thin wrapper around the template helper. Kept as its own module so the
// compile route doesn't need to know about config/templates internals,
// and so Phase 12 (export) can import this same function for project.zip.

export function assembleMainTex(project: IProjectDocument): string {
  return assembleFromTemplate(
    project.template as ProjectTemplate,
    project.chapters,
    project.mainTexOverride
  );
}

// ─── references.bib assembly ──────────────────────────────────────────────────
// Concatenates every reference's pre-generated bibtex string.
// Returns an empty string if there are no references — LaTeX.Online handles
// a missing/empty .bib file gracefully as long as \bibliography{} isn't called
// with citations that don't exist (undefined citations become warnings, not errors).

export function assembleBibFile(project: IProjectDocument): string {
  if (!project.references || project.references.length === 0) {
    return '% No references added yet.\n';
  }
  return project.references.map((ref) => ref.bibtex).join('\n\n') + '\n';
}

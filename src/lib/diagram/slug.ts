/**
 * Converts a diagram name into a filesystem/LaTeX-safe slug.
 * Used to generate the \includegraphics{diagrams/<slug>.png} path.
 *
 * "System Architecture (v2)" → "system-architecture-v2"
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')  // strip anything that isn't alphanumeric/space/hyphen
    .replace(/\s+/g, '-')          // spaces → hyphens
    .replace(/-+/g, '-')           // collapse multiple hyphens
    .replace(/^-|-$/g, '')         // trim leading/trailing hyphens
    || 'diagram';                  // fallback if the name was all special chars
}

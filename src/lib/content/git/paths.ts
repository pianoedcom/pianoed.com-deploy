/**
 * Path utilities for the Git content adapter.
 *
 * Centralizes all path manipulation so the adapter and provider stay free of
 * string-concatenation bugs. Paths inside the repository use forward slashes
 * regardless of the host OS.
 */
/** Join path segments with `/`, collapsing duplicate slashes. */
export function joinPath(...segments: string[]): string {
  return segments
    .map((s) => s.replace(/^\/+|\/+$/g, ""))
    .filter((s) => s.length > 0)
    .join("/");
}
/** Normalize a path: strip leading/trailing slashes, collapse duplicates. */
export function normalizePath(path: string): string {
  const trimmed = path.replace(/^\/+|\/+$/g, "").replace(/\/+/g, "/");
  return trimmed;
}
/** Whether a path has a content file extension (.mdx or .md). */
export function isContentFile(path: string): boolean {
  return /\.(mdx|md)$/i.test(path);
}
/**
 * Derive a slug from a content file path.
 * e.g. "posts/hello-world.mdx" -> "hello-world"
 */
export function slugFromPath(path: string): string {
  const fileName = path.split("/").pop() ?? "";
  return fileName.replace(/\.(mdx|md)$/i, "");
}
/**
 * Build the full repository path for a post slug.
 * e.g. ("posts", "hello-world") -> "posts/hello-world.mdx"
 *
 * Tries `.mdx` first; the adapter falls back to `.md` if needed.
 */
export function postPath(contentPath: string, slug: string): string {
  return joinPath(contentPath, `${slug}.mdx`);
}
/** Build the full repository path for an author slug. */
export function authorPath(authorsPath: string, slug: string): string {
  return joinPath(authorsPath, `${slug}.mdx`);
}
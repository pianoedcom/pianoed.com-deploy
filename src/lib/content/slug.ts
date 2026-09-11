/**
 * Slug utilities.
 *
 * Derives stable, URL-safe slugs from titles or arbitrary strings and
 * validates that a slug is well-formed.
 */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Convert a title or string into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric (keep spaces/hyphens)
    .replace(/[\s_]+/g, "-") // spaces/underscores -> hyphen
    .replace(/-+/g, "-") // collapse repeated hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}
/** Whether a string is a valid slug. */
export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}
/** Throw if a slug is not well-formed. */
export function assertValidSlug(slug: string): void {
  if (!isValidSlug(slug)) {
    throw new Error(
      `Invalid slug "${slug}". Slugs must be lowercase, alphanumeric, and hyphen-separated.`,
    );
  }
}
/**
 * Re-export of taxonomy definitions from the content directory.
 *
 * The `@` alias maps to `./src`, so `content/` is not directly importable
 * via the alias. This module provides a stable import path for the rest of
 * `src/` to consume category and tag definitions.
 */
import type { CategoryRef } from "../../../content/categories";
import type { TagRef } from "../../../content/tags";
// Use a dynamic read so the content files remain the single source of truth.
// Vite bundles these at build time.
import { categories } from "../../../content/categories";
import { tags } from "../../../content/tags";
export { categories, tags };
/**
 * Helper to get the full taxonomy configuration.
 * Resolves Task 1.2/1.6 by providing a centralized getter for frontmatter parsing.
 */
export function getTaxonomyConfig() {
  return { categories, tags };
}
export type { CategoryRef, TagRef };
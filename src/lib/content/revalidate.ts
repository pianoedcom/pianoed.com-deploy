/**
 * Revalidation helpers.
 *
 * These functions invalidate cached content by tag, mirroring Next.js
 * `revalidateTag()` semantics. They are server-only helpers: in a Next.js
 * deployment they would call `revalidateTag()` from `next/cache`; in this
 * Vite SPA environment they invalidate the in-memory `contentCache`.
 *
 * Usage flow:
 *   1. Read article → cached under post:{slug}, posts, category:{cat}, etc.
 *   2. Content changes in Git.
 *   3. Revalidation helper is invoked (e.g. via webhook → revalidatePost).
 *   4. Cached entry becomes stale/evicted.
 *   5. Next request obtains fresh content.
 *   6. Unrelated articles remain cached.
 */
import { contentCache } from "./cache";
import {
  POSTS_TAG,
  CATEGORIES_TAG,
  TAGS_TAG,
  AUTHORS_TAG,
  HOMEPAGE_TAG,
  postTag,
  categoryTag,
  tagTag,
  authorTag,
} from "@/lib/cache/tags";
/**
 * Revalidate a single post and all listings it appears in.
 *
 * Invalidates: post:{slug}, posts (index), category:{cat}, tag:{t} for each
 * tag, and homepage (latest/featured). Other posts remain cached.
 */
export function revalidatePost(slug: string, category: string, tags: string[]): void {
  contentCache.invalidateTags([
    postTag(slug),
    POSTS_TAG,
    categoryTag(category),
    ...tags.map(tagTag),
    HOMEPAGE_TAG,
  ]);
}
/**
 * Revalidate the entire post index.
 *
 * Invalidates: posts, homepage, categories, tags (all derived from the index).
 */
export function revalidatePostIndex(): void {
  contentCache.invalidateTags([POSTS_TAG, HOMEPAGE_TAG, CATEGORIES_TAG, TAGS_TAG]);
}
/** Revalidate a category listing and the categories collection. */
export function revalidateCategory(slug: string): void {
  contentCache.invalidateTags([categoryTag(slug), CATEGORIES_TAG]);
}
/** Revalidate a tag listing and the tags collection. */
export function revalidateTag(slug: string): void {
  contentCache.invalidateTags([tagTag(slug), TAGS_TAG]);
}
/** Revalidate a single author and the authors collection. */
export function revalidateAuthor(slug: string): void {
  contentCache.invalidateTags([authorTag(slug), AUTHORS_TAG]);
}
/** Revalidate all homepage-specific caches (latest + featured). */
export function revalidateHomepage(): void {
  contentCache.invalidateTags([HOMEPAGE_TAG, POSTS_TAG]);
}
/**
 * Revalidate all content caches.
 *
 * Use sparingly — this evicts every cached entry. Suitable for full content
 * syncs or deployments.
 */
export function revalidateAll(): void {
  contentCache.clear();
}
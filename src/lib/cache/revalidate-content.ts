/**
 * Content revalidation dispatcher.
 *
 * Maps a ContentChangeSet (from the change detector) to targeted cache tag
 * invalidations. This is the bridge between "what changed in Git" and "which
 * cache entries should be evicted."
 *
 * Security: this module never accepts arbitrary cache tags from callers. It
 * computes tags deterministically from the changed slugs using the same tag
 * builders used by the caching layer. A public webhook caller cannot inject
 * or request arbitrary tag invalidation.
 *
 * Rename handling: when a file is renamed (old-slug → new-slug), both the old
 * and new slugs are invalidated. The old slug is recorded so the application
 * can later support redirect management (old-slug → new-slug).
 */
import type { ContentChangeSet } from "@/lib/content/change-detector";
import { revalidatePostIndex, revalidateAll } from "@/lib/content/revalidate";
import { POSTS_TAG, CATEGORIES_TAG, TAGS_TAG, HOMEPAGE_TAG, postTag } from "@/lib/cache/tags";
import { contentCache } from "@/lib/content/cache";
import { resetSearchIndex } from "@/lib/search/query";
import { recordRuntimeRedirect, getRuntimeRedirects } from "@/lib/content/redirects";
/** A redirect entry recorded for renamed content. */
export interface RedirectEntry {
  /** The old slug (source of the redirect). */
  from: string;
  /** The new slug (destination of the redirect). */
  to: string;
  /** When the rename was detected (ISO timestamp). */
  detectedAt: string;
}
/** Result of processing a content change set. */
export interface RevalidationResult {
  /** Tags that were invalidated. */
  invalidatedTags: string[];
  /** Slugs whose caches were invalidated. */
  invalidatedSlugs: string[];
  /** Redirect entries recorded for renames. */
  redirects: RedirectEntry[];
  /** Whether the post index was invalidated. */
  indexRevalidated: boolean;
  /** Whether all caches were cleared (full sync). */
  fullRevalidation: boolean;
}
/**
 * Retrieve all recorded redirects from the centralized redirect system.
 *
 * Delegates to `@/lib/content/redirects` so there is a single source of
 * truth for redirect data (static + runtime).
 */
export function getRecordedRedirects(): RedirectEntry[] {
  return getRuntimeRedirects().map((r) => ({
    from: r.from,
    to: r.to,
    detectedAt: r.createdAt,
  }));
}
/**
 * Invalidate caches for a single slug.
 *
 * Since the webhook only knows the slug (not the category/tags from
 * frontmatter — those require fetching the file), we invalidate:
 *   - post:{slug} (the individual post)
 *   - posts (the index — the post may appear in listings)
 *   - homepage (the post may appear in latest/featured)
 *   - categories + tags (derived collections may change)
 *
 * This is intentionally broader than a single-post revalidation to ensure
 * consistency, but still targeted — unrelated posts remain cached.
 */
function invalidateForSlug(slug: string): string[] {
  const tags = [postTag(slug), POSTS_TAG, HOMEPAGE_TAG, CATEGORIES_TAG, TAGS_TAG];
  contentCache.invalidateTags(tags);
  return tags;
}
/**
 * Process a content change set and perform targeted cache invalidation.
 *
 * @param changes - The change set from the change detector.
 * @returns A result describing what was invalidated.
 */
export function revalidateContent(changes: ContentChangeSet): RevalidationResult {
  const invalidatedTags = new Set<string>();
  const invalidatedSlugs = new Set<string>();
  const redirects: RedirectEntry[] = [];
  // If there are no content changes, do nothing.
  if (!changes.hasContentChanges) {
    return {
      invalidatedTags: [],
      invalidatedSlugs: [],
      redirects: [],
      indexRevalidated: false,
      fullRevalidation: false,
    };
  }
  // Process renames: record redirects in the centralized redirect system
  // and invalidate both old + new slugs.
  for (const r of changes.renamed) {
    if (r.previousSlug && r.slug && r.previousSlug !== r.slug) {
      recordRuntimeRedirect(r.previousSlug, r.slug, "rename");
      redirects.push({
        from: r.previousSlug,
        to: r.slug,
        detectedAt: new Date().toISOString(),
      });
      for (const tag of invalidateForSlug(r.previousSlug)) {
        invalidatedTags.add(tag);
      }
      invalidatedSlugs.add(r.previousSlug);
    }
    if (r.slug) {
      for (const tag of invalidateForSlug(r.slug)) {
        invalidatedTags.add(tag);
      }
      invalidatedSlugs.add(r.slug);
    }
  }
  // Process created files: invalidate the new slug + index + homepage.
  for (const c of changes.created) {
    if (c.slug) {
      for (const tag of invalidateForSlug(c.slug)) {
        invalidatedTags.add(tag);
      }
      invalidatedSlugs.add(c.slug);
    }
  }
  // Process modified files: invalidate the slug + index + homepage.
  for (const m of changes.modified) {
    if (m.slug) {
      for (const tag of invalidateForSlug(m.slug)) {
        invalidatedTags.add(tag);
      }
      invalidatedSlugs.add(m.slug);
    }
  }
  // Process deleted files: invalidate the slug + index + homepage + collections.
  for (const d of changes.deleted) {
    if (d.slug) {
      for (const tag of invalidateForSlug(d.slug)) {
        invalidatedTags.add(tag);
      }
      invalidatedSlugs.add(d.slug);
    }
  }
  // Always invalidate the post index when any content changes, since
  // listings, categories, and tags are derived from it.
  revalidatePostIndex();
  invalidatedTags.add(POSTS_TAG);
  invalidatedTags.add(HOMEPAGE_TAG);
  invalidatedTags.add(CATEGORIES_TAG);
  invalidatedTags.add(TAGS_TAG);
  // Invalidate the search index so new/modified content is searchable.
  resetSearchIndex();
  return {
    invalidatedTags: Array.from(invalidatedTags),
    invalidatedSlugs: Array.from(invalidatedSlugs),
    redirects,
    indexRevalidated: true,
    fullRevalidation: false,
  };
}
/**
 * Perform a full content revalidation (clear all caches).
 *
 * Use sparingly — for full content syncs or when the change set is too
 * complex to process incrementally.
 */
export function revalidateAllContent(): RevalidationResult {
  revalidateAll();
  resetSearchIndex();
  return {
    invalidatedTags: ["*"],
    invalidatedSlugs: ["*"],
    redirects: [],
    indexRevalidated: true,
    fullRevalidation: true,
  };
}
// Re-export tag builders for convenience in the webhook handler.
export { postTag, POSTS_TAG, CATEGORIES_TAG, TAGS_TAG, HOMEPAGE_TAG };
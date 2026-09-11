/**
 * Canonical URL utilities.
 *
 * Centralizes canonical URL resolution so every page, sitemap entry, and
 * RSS feed item uses the same logic. Supports per-article canonical
 * overrides (e.g. for cross-posted content) while defaulting to the
 * site-relative path.
 */
import { siteConfig } from "@/lib/site-config";
/** Build an absolute URL from a site-relative path. */
export function buildCanonical(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalized}`;
}
/**
 * Resolve the canonical URL for a page.
 *
 * If an explicit `canonicalUrl` is provided (e.g. from frontmatter for
 * cross-posted articles), it is used as-is. Otherwise the site URL + path
 * is used. Query strings for pagination are stripped — canonical URLs
 * always point to the first page.
 */
export function resolveCanonical(path: string, canonicalUrl?: string): string {
  if (canonicalUrl) return canonicalUrl;
  return buildCanonical(path.split("?")[0]);
}
/** Strip query parameters from a path, returning the clean path only. */
export function cleanPath(path: string): string {
  return path.split("?")[0].split("#")[0];
}
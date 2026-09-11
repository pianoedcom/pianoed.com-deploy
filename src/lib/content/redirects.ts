/**
 * Permanent URL redirect management.
 *
 * Supports:
 *   - old slug → new slug (article renames)
 *   - deleted article → appropriate destination
 *   - moved article (category change)
 *   - legacy URL aliases
 *
 * Redirects are loaded from `content/redirects.ts` (version-controlled
 * alongside content) and merged with runtime redirects recorded by the
 * webhook change detector (rename events). The runtime store allows
 * automatic redirect creation when a file is renamed in Git.
 *
 * Design principles:
 *   - Permanent (308) redirects for genuine URL migrations.
 *   - No redirect chains: if A → B and B → C, resolve to C directly.
 *   - Redirect history is preserved (each entry records when it was created).
 *   - The public article page checks redirects before rendering, so old
 *     URLs permanently redirect to new ones with correct canonical metadata.
 */
import { isValidSlug } from "./slug";
import { staticRedirectsData } from "../../../content/redirects";
/** HTTP status codes used for redirects. */
export const REDIRECT_STATUS_PERMANENT = 308;
export const REDIRECT_STATUS_MOVED = 301;
/** The type of redirect. */
export type RedirectType = "rename" | "deleted" | "moved" | "legacy" | "alias";
/** A single redirect entry. */
export interface RedirectEntry {
  /** The source path (old URL, relative to site root, e.g. "/blog/old-slug"). */
  from: string;
  /** The destination path (new URL, e.g. "/blog/new-slug"). */
  to: string;
  /** The type of redirect. */
  type: RedirectType;
  /** ISO timestamp when the redirect was created. */
  createdAt: string;
  /** Optional note explaining why the redirect exists. */
  note?: string;
}
/** The shape of content/redirects.json. */
export interface RedirectsFile {
  redirects: RedirectEntry[];
}
// --- Path normalization -----------------------------------------------------
/**
 * Normalize a redirect path to a consistent format.
 *
 * Ensures leading slash, no trailing slash (except root), lowercase.
 * This is the canonical form used for lookup.
 */
export function normalizeRedirectPath(path: string): string {
  let p = path.trim().toLowerCase();
  if (!p.startsWith("/")) p = `/${p}`;
  // Strip trailing slash except for root
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}
/**
 * Build the blog article path for a slug.
 * e.g. "my-article" → "/blog/my-article"
 */
export function articlePath(slug: string): string {
  return `/blog/${slug}`;
}
// --- Runtime redirect store (from webhook renames) -------------------------
/**
 * In-memory store of redirects recorded by the webhook change detector.
 *
 * When a file is renamed (old-slug → new-slug), the webhook records a
 * redirect here. These are merged with the static redirects from
 * content/redirects.json at lookup time.
 *
 * In production this would be persisted (database, KV). The interface
 * is designed so a persistent store can be swapped in without changing
 * callers.
 */
const runtimeRedirects = new Map<string, RedirectEntry>();
/** Record a runtime redirect (from webhook rename detection). */
export function recordRuntimeRedirect(
  fromSlug: string,
  toSlug: string,
  type: RedirectType = "rename",
  note?: string,
): RedirectEntry {
  const from = normalizeRedirectPath(articlePath(fromSlug));
  const to = normalizeRedirectPath(articlePath(toSlug));
  const entry: RedirectEntry = { from, to, type, createdAt: new Date().toISOString(), note };
  runtimeRedirects.set(from, entry);
  return entry;
}
/** Get all runtime-recorded redirects (for inspection/testing). */
export function getRuntimeRedirects(): RedirectEntry[] {
  return Array.from(runtimeRedirects.values());
}
/** Clear runtime redirects (for testing). */
export function clearRuntimeRedirects(): void {
  runtimeRedirects.clear();
}
// --- Static redirects (from content/redirects.ts) --------------------------
let staticRedirects: RedirectEntry[] | null = null;
/**
 * Load static redirects from the content/redirects module.
 *
 * The redirect data is defined in TypeScript (content/redirects.ts) and
 * imported at build time. Entries are validated and normalized. Invalid
 * entries are silently skipped so a malformed redirect doesn't crash
 * the site.
 */
function loadStaticRedirects(): RedirectEntry[] {
  if (staticRedirects !== null) return staticRedirects;
  const data = staticRedirectsData;
  if (!data || !Array.isArray(data.redirects)) {
    staticRedirects = [];
    return staticRedirects;
  }
  staticRedirects = data.redirects
    .map(validateRedirectEntry)
    .filter((e): e is RedirectEntry => e !== null);
  return staticRedirects;
}
/** Validate a single redirect entry. Returns null if invalid. */
function validateRedirectEntry(raw: unknown): RedirectEntry | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  const from = typeof obj.from === "string" ? normalizeRedirectPath(obj.from) : "";
  const to = typeof obj.to === "string" ? normalizeRedirectPath(obj.to) : "";
  const type = typeof obj.type === "string" ? (obj.type as RedirectType) : "legacy";
  const createdAt = typeof obj.createdAt === "string" ? obj.createdAt : new Date(0).toISOString();
  const note = typeof obj.note === "string" ? obj.note : undefined;
  if (!from || !to || from === to) return null;
  if (!isValidRedirectType(type)) return null;
  return { from, to, type, createdAt, note };
}
function isValidRedirectType(type: string): type is RedirectType {
  return ["rename", "deleted", "moved", "legacy", "alias"].includes(type);
}
// --- Chain resolution -------------------------------------------------------
/**
 * Resolve a redirect path, following chains to the final destination.
 *
 * If A → B and B → C, resolving A returns C (not B). This prevents
 * redirect chains. A maximum hop count prevents infinite loops from
 * circular redirect definitions.
 *
 * @param path - The incoming path (already normalized).
 * @param maxHops - Maximum redirects to follow (default 10).
 * @returns The final destination path, or null if no redirect exists.
 */
export function resolveRedirect(path: string, maxHops = 10): string | null {
  const normalized = normalizeRedirectPath(path);
  const visited = new Set<string>();
  let current = normalized;
  let hops = 0;
  while (hops < maxHops) {
    if (visited.has(current)) {
      // Circular redirect — stop and return current to avoid infinite loop.
      return current;
    }
    visited.add(current);
    const entry = lookupRedirect(current);
    if (!entry) break;
    current = entry.to;
    hops++;
  }
  if (hops === 0) return null;
  return current;
}
/**
 * Look up a single redirect entry (static or runtime) by normalized path.
 */
function lookupRedirect(normalizedPath: string): RedirectEntry | null {
  // Check runtime redirects first (most recent, from webhook renames).
  const runtime = runtimeRedirects.get(normalizedPath);
  if (runtime) return runtime;
  // Check static redirects from content/redirects.json.
  const statics = loadStaticRedirects();
  return statics.find((r) => r.from === normalizedPath) ?? null;
}
// --- Public API -------------------------------------------------------------
/** Result of checking a path for redirects. */
export interface RedirectCheckResult {
  /** Whether a redirect was found. */
  hasRedirect: boolean;
  /** The final destination path (already chain-resolved), or null. */
  destination: string | null;
  /** The redirect status code to use. */
  statusCode: number;
  /** The original redirect entry (first hop), if any. */
  entry: RedirectEntry | null;
}
/**
 * Check if a path should redirect, and return the final destination.
 *
 * This is the primary function used by the article page to check if an
 * old slug should redirect to a new one before attempting to render.
 *
 * @param path - The incoming request path (e.g. "/blog/old-slug").
 * @returns Redirect check result with destination and status code.
 */
export function checkRedirect(path: string): RedirectCheckResult {
  const normalized = normalizeRedirectPath(path);
  const entry = lookupRedirect(normalized);
  if (!entry) {
    return { hasRedirect: false, destination: null, statusCode: 0, entry: null };
  }
  const destination = resolveRedirect(normalized);
  const statusCode = entry.type === "deleted" ? REDIRECT_STATUS_MOVED : REDIRECT_STATUS_PERMANENT;
  return {
    hasRedirect: true,
    destination,
    statusCode,
    entry,
  };
}
/**
 * Check if an article slug should redirect to a different slug.
 *
 * Convenience wrapper around `checkRedirect` for article slugs.
 * Returns the new slug if a redirect exists, or null.
 *
 * @param slug - The article slug from the URL.
 * @returns The destination slug, or null if no redirect.
 */
export function checkSlugRedirect(slug: string): string | null {
  if (!isValidSlug(slug)) return null;
  const path = articlePath(slug);
  const result = checkRedirect(path);
  if (!result.hasRedirect || !result.destination) return null;
  // Extract the slug from the destination path "/blog/new-slug".
  const destSlug = result.destination.replace(/^\/blog\//, "");
  return destSlug || null;
}
/**
 * Get all known redirects (static + runtime), for inspection or sitemap
 * exclusion.
 */
export function getAllRedirects(): RedirectEntry[] {
  const statics = loadStaticRedirects();
  const runtime = Array.from(runtimeRedirects.values());
  // Merge, with runtime taking precedence on duplicate `from` paths.
  const map = new Map<string, RedirectEntry>();
  for (const r of statics) map.set(r.from, r);
  for (const r of runtime) map.set(r.from, r);
  return Array.from(map.values());
}
/**
 * Get all source paths that have redirects (for sitemap exclusion).
 */
export function getRedirectSources(): string[] {
  return getAllRedirects().map((r) => r.from);
}
/**
 * Reload static redirects from the content module.
 *
 * Useful after the webhook invalidates content — the redirects file may
 * have changed. Clears the cache so the next lookup re-reads the data.
 */
export function reloadRedirects(): void {
  staticRedirects = null;
}
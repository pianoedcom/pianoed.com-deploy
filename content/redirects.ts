/**
 * Static redirect entries.
 *
 * This module defines permanent URL redirects in TypeScript rather than JSON
 * to avoid tooling issues with raw JSON file creation. The structure matches
 * the `RedirectsFile` interface from `redirects.ts`.
 *
 * Redirect types:
 *   - rename:  article was renamed (old-slug → new-slug)
 *   - legacy:  old URL alias kept for inbound links
 *   - alias:   alternative URL for the same content
 *   - moved:   article moved to a different category/section
 *   - deleted: article removed, redirect to a related resource
 */
import type { RedirectsFile } from "@/lib/content/redirects";
export const staticRedirectsData: RedirectsFile = {
  redirects: [],
};
/**
 * Content source resolver.
 *
 * Extracted into its own module to avoid a circular dependency between
 * `index.ts` (which re-exports the cached query layer) and `queries.ts`
 * (which needs the content source). Both `index.ts` and `queries.ts` import
 * from here.
 */
import type { ContentSource } from "./source";
import { localSource } from "./local-source";
import { createGitSource, createGitHubProvider } from "./git";
import { serverEnv } from "@/lib/env";
import { siteConfig } from "@/lib/site-config";
export { localSource };
let resolvedSource: ContentSource | null = null;
/**
 * Resolve the active content source based on environment.
 *
 * - `CONTENT_SOURCE=local` (default): uses the local adapter with MDX bundled
 *   at build time. Best for local development.
 * - `CONTENT_SOURCE=git`: uses the Git-backed adapter that fetches content
 *   from the repository provider API with a tagged cache. A changed article
 *   becomes visible without rebuilding the application. Requires server-side
 *   environment (no `window`) and repo config.
 */
export function getContentSource(): ContentSource {
  if (resolvedSource) return resolvedSource;
  const useGit =
    siteConfig.content.source === "git" && typeof window === "undefined" && serverEnv !== null;
  if (useGit) {
    resolvedSource = createGitSource({
      provider: createGitHubProvider({
        owner: siteConfig.content.owner,
        repo: siteConfig.content.name,
        branch: siteConfig.content.branch,
        contentPath: siteConfig.content.path,
        token: serverEnv!.CONTENT_REPO_TOKEN || undefined,
      }),
    });
  } else {
    resolvedSource = localSource;
  }
  return resolvedSource;
}
/**
 * Shared content source instance for the rendering layer.
 *
 * Components should import this (via `@/lib/content`) rather than
 * `localSource` directly so the source can be swapped without touching
 * rendering code.
 */
export const contentSource: ContentSource = getContentSource();
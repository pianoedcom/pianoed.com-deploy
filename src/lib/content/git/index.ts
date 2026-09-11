/**
 * Git content adapter public API.
 */
export type { GitFileEntry, GitProvider, GitProviderConfig, GitProviderErrorKind } from "./types";
export { GitProviderError } from "./types";
export { createGitHubProvider } from "./github";
export { createGitSource } from "./source";
export type { GitSourceOptions } from "./source";
// ContentCache and cacheKeys are internal to the git adapter.
// source.ts imports them directly from ./cache to avoid duplicate
// export errors when Vite bundles the barrel.
/**
 * Git provider abstraction types.
 *
 * These types define a provider-agnostic interface for retrieving content files
 * from a Git hosting service (GitHub, GitLab, etc.). A concrete provider
 * (e.g. `github.ts`) implements `GitProvider`; the `GitContentSource` adapter
 * depends only on this interface so additional providers can be added without
 * touching the adapter.
 */
/** A single file entry returned by `listFiles`. */
export interface GitFileEntry {
  /** Full path within the repository, e.g. "posts/hello-world.mdx". */
  path: string;
  /** File type. Only "file" is relevant for content; directories are skipped. */
  type: "file" | "dir";
  /** Optional SHA (used for cache invalidation by some providers). */
  sha?: string;
  /** Optional file size in bytes. */
  size?: number;
}
/** Configuration shared by all Git providers. */
export interface GitProviderConfig {
  /** Repository owner (user or org). */
  owner: string;
  /** Repository name. */
  repo: string;
  /** Branch or ref to read from. */
  branch: string;
  /** Root directory inside the repo where content lives. */
  contentPath: string;
  /** Optional access token for private repositories. Never logged or leaked. */
  token?: string;
}
/**
 * Provider-agnostic interface for retrieving raw content from a Git host.
 *
 * Implementations must:
 * - list files under a given directory (recursively)
 * - fetch the raw content of a single file
 * - handle 404s by returning `null` (not throwing)
 * - surface rate-limit and transient errors via `GitProviderError`
 */
export interface GitProvider {
  /** Provider identifier, e.g. "github". */
  readonly id: string;
  /**
   * List all files under `config.contentPath` (recursively) on the configured
   * branch. Returns only `file` entries (directories excluded).
   */
  listFiles(directory: string): Promise<GitFileEntry[]>;
  /**
   * Fetch the raw text content of a single file by its full path.
   * Returns `null` if the file does not exist (404).
   */
  getFile(path: string): Promise<string | null>;
}
/** Error categories for Git provider failures. */
export type GitProviderErrorKind =
  "not_found" | "rate_limited" | "unauthorized" | "server_error" | "network_error" | "unknown";
/** Structured error thrown by Git providers. */
export class GitProviderError extends Error {
  readonly kind: GitProviderErrorKind;
  readonly status?: number;
  readonly retryAfter?: number;
  constructor(
    kind: GitProviderErrorKind,
    message: string,
    opts?: { status?: number; retryAfter?: number },
  ) {
    super(message);
    this.name = "GitProviderError";
    this.kind = kind;
    this.status = opts?.status;
    this.retryAfter = opts?.retryAfter;
  }
}
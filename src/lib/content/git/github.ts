/**
 * GitHub provider implementation.
 *
 * Uses the GitHub REST API (Contents API) to list files and fetch raw content.
 * Handles 404s, rate limits, and transient server errors, surfacing them as
 * structured `GitProviderError`s. The token (if provided) is sent only in the
 * `Authorization` header and never logged.
 *
 * Rate-limit handling: GitHub returns 403 with a `X-RateLimit-Remaining: 0`
 * header when the rate limit is exhausted, and a `Retry-After` header (for
 * secondary rate limits). We map these to the `rate_limited` error kind so the
 * adapter can back off.
 */
import {
  type GitFileEntry,
  type GitProvider,
  type GitProviderConfig,
  GitProviderError,
} from "./types";
import { isContentFile, joinPath } from "./paths";
const GITHUB_API_BASE = "https://api.github.com";
/** Default request timeout in ms (network-level abort). */
const REQUEST_TIMEOUT_MS = 15_000;
/** Build the API URL for listing a directory's contents. */
function contentsUrl(config: GitProviderConfig, directory: string): string {
  const path = joinPath(config.contentPath, directory);
  const params = new URLSearchParams({ ref: config.branch });
  return `${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/contents/${path}?${params}`;
}
/** Build the raw URL for fetching a single file. */
function rawUrl(config: GitProviderConfig, filePath: string): string {
  const path = joinPath(filePath);
  return `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${path}`;
}
/** Map a GitHub API error response to a structured error. */
async function mapError(status: number, headers: Headers, body: string): Promise<GitProviderError> {
  const retryAfter = headers.get("Retry-After");
  const retryAfterSec = retryAfter ? Number(retryAfter) : undefined;
  if (status === 401 || status === 403) {
    // 403 with rate-limit exhausted is a rate limit, not auth.
    const remaining = headers.get("X-RateLimit-Remaining");
    if (status === 403 && remaining === "0") {
      return new GitProviderError("rate_limited", "GitHub API rate limit exceeded.", {
        status,
        retryAfter: retryAfterSec,
      });
    }
    if (status === 401) {
      return new GitProviderError("unauthorized", "GitHub API rejected the provided token.", {
        status,
      });
    }
    // 403 without rate-limit exhaustion — could be secondary rate limit.
    return new GitProviderError(
      "rate_limited",
      "GitHub API returned 403 (possibly a secondary rate limit).",
      { status, retryAfter: retryAfterSec },
    );
  }
  if (status === 404) {
    return new GitProviderError("not_found", "Resource not found.", { status });
  }
  if (status >= 500) {
    return new GitProviderError(
      "server_error",
      `GitHub server error (${status}): ${body.slice(0, 200)}`,
      { status },
    );
  }
  return new GitProviderError(
    "unknown",
    `Unexpected GitHub API status ${status}: ${body.slice(0, 200)}`,
    { status },
  );
}
/** Fetch with timeout via AbortController. */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
/** Build auth headers; token is never logged. */
function authHeaders(config: GitProviderConfig): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "blog-content-adapter",
  };
  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`;
  }
  return headers;
}
/**
 * Recursively list files under `directory` using the Contents API.
 * The Contents API returns immediate children; we recurse into subdirectories.
 */
async function listFilesRecursive(
  config: GitProviderConfig,
  directory: string,
): Promise<GitFileEntry[]> {
  const url = contentsUrl(config, directory);
  let res: Response;
  try {
    res = await fetchWithTimeout(url, { headers: authHeaders(config) });
  } catch (err) {
    if (err instanceof GitProviderError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new GitProviderError("network_error", "Request timed out.");
    }
    throw new GitProviderError("network_error", `Network error: ${(err as Error).message}`);
  }
  if (res.status === 404) {
    return [];
  }
  if (!res.ok) {
    throw await mapError(res.status, res.headers, await res.text());
  }
  const entries = (await res.json()) as Array<{
    path: string;
    type: "file" | "dir";
    sha?: string;
    size?: number;
  }>;
  const files: GitFileEntry[] = [];
  for (const entry of entries) {
    if (entry.type === "file") {
      files.push({ path: entry.path, type: "file", sha: entry.sha, size: entry.size });
    } else if (entry.type === "dir") {
      // Recurse into subdirectory using its path relative to repo root.
      const subDir = entry.path.replace(
        new RegExp(`^${joinPath(config.contentPath, directory)}/?`),
        "",
      );
      const subFiles = await listFilesRecursive(config, joinPath(directory, subDir));
      files.push(...subFiles);
    }
  }
  return files;
}
/**
 * Create a GitHub Git provider instance.
 */
export function createGitHubProvider(config: GitProviderConfig): GitProvider {
  return {
    id: "github",
    async listFiles(directory: string): Promise<GitFileEntry[]> {
      const all = await listFilesRecursive(config, directory);
      return all.filter((f) => isContentFile(f.path));
    },
    async getFile(path: string): Promise<string | null> {
      const url = rawUrl(config, path);
      let res: Response;
      try {
        res = await fetchWithTimeout(url, {
          headers: { ...authHeaders(config), Accept: "text/plain" },
        });
      } catch (err) {
        if (err instanceof GitProviderError) throw err;
        if (err instanceof DOMException && err.name === "AbortError") {
          throw new GitProviderError("network_error", "Request timed out.");
        }
        throw new GitProviderError("network_error", `Network error: ${(err as Error).message}`);
      }
      if (res.status === 404) return null;
      if (!res.ok) {
        throw await mapError(res.status, res.headers, await res.text());
      }
      return res.text();
    },
  };
}
/**
 * Change detector.
 *
 * Analyzes a GitHub push event payload to identify content-relevant file
 * changes. It distinguishes created, modified, renamed, and deleted files,
 * filters to only `.mdx`/`.md` files within the configured content path, and
 * derives affected slugs.
 *
 * Rename handling: when a file moves from `old-slug.mdx` to `new-slug.mdx`,
 * both the old slug (for potential redirects) and the new slug (for cache
 * invalidation) are reported.
 */
import { isContentFile, slugFromPath, normalizePath } from "@/lib/content/git/paths";
/** The type of change GitHub reports for a single file in a commit. */
export type FileChangeStatus = "added" | "modified" | "removed" | "renamed";
/** A single file change extracted from the webhook payload. */
export interface FileChange {
  /** The file path after the change (null for deletions of fully removed files). */
  path: string | null;
  /** The previous path (only set for renames). */
  previousPath?: string | null;
  /** The slug derived from the new path (null if path is null). */
  slug: string | null;
  /** The slug derived from the previous path (only for renames). */
  previousSlug?: string | null;
  /** The type of change. */
  status: FileChangeStatus;
}
/** Result of analyzing a push event for content changes. */
export interface ContentChangeSet {
  /** Files created (new content). */
  created: FileChange[];
  /** Files modified (content updated). */
  modified: FileChange[];
  /** Files deleted (content removed). */
  deleted: FileChange[];
  /** Files renamed (slug changed — old slug may need a redirect). */
  renamed: FileChange[];
  /** All affected post slugs (new + old for renames + deleted). */
  affectedSlugs: string[];
  /** Whether any content files were changed at all. */
  hasContentChanges: boolean;
}
/**
 * A raw GitHub commit entry from the push event payload.
 * Only the fields we need are typed here.
 */
interface RawCommit {
  id: string;
  added?: string[];
  modified?: string[];
  removed?: string[];
}
/** A raw file entry in the `commits[].added/modified/removed` arrays. */
interface RawFileEntry {
  filename: string;
  status?: string;
  previous_filename?: string;
}
/**
 * Check whether a file path falls within the configured content directory.
 *
 * @param filePath - The full path in the repo, e.g. "posts/hello-world.mdx".
 * @param contentPath - The configured content root, e.g. "posts".
 */
function isInContentPath(filePath: string, contentPath: string): boolean {
  const normalized = normalizePath(filePath);
  const root = normalizePath(contentPath);
  return normalized === root || normalized.startsWith(`${root}/`);
}
/**
 * Build a FileChange from a raw path and status.
 */
function buildFileChange(
  path: string,
  status: FileChangeStatus,
  previousPath?: string | null,
): FileChange {
  return {
    path,
    previousPath: previousPath ?? null,
    slug: slugFromPath(path),
    previousSlug: previousPath ? slugFromPath(previousPath) : null,
    status,
  };
}
/**
 * Analyze a list of raw file entries (from a single commit's files list) and
 * classify them into content-relevant changes.
 *
 * GitHub's "files" API (used in pull request payloads) provides rich entries
 * with `status` and `previous_filename`. The push event webhook uses simpler
 * `added`/`modified`/`removed` string arrays.
 */
function classifyFileEntries(
  entries: RawFileEntry[],
  contentPath: string,
): {
  created: FileChange[];
  modified: FileChange[];
  deleted: FileChange[];
  renamed: FileChange[];
} {
  const created: FileChange[] = [];
  const modified: FileChange[] = [];
  const deleted: FileChange[] = [];
  const renamed: FileChange[] = [];
  for (const entry of entries) {
    if (!entry.filename) continue;
    if (!isContentFile(entry.filename)) continue;
    if (!isInContentPath(entry.filename, contentPath)) continue;
    const status = (entry.status ?? "modified") as FileChangeStatus;
    if (status === "added") {
      created.push(buildFileChange(entry.filename, "added"));
    } else if (status === "modified") {
      modified.push(buildFileChange(entry.filename, "modified"));
    } else if (status === "removed") {
      deleted.push({
        path: entry.filename,
        previousPath: null,
        slug: slugFromPath(entry.filename),
        status: "removed",
      });
    } else if (status === "renamed" && entry.previous_filename) {
      renamed.push(buildFileChange(entry.filename, "renamed", entry.previous_filename));
    } else {
      // Unknown status — treat as modified.
      modified.push(buildFileChange(entry.filename, "modified"));
    }
  }
  return { created, modified, deleted, renamed };
}
/**
 * Analyze a GitHub push event payload and extract content-relevant changes.
 *
 * This function handles the push event's `commits` array, where each commit
 * has `added`, `modified`, and `removed` arrays of file paths. Renames are
 * inferred when a file appears in `removed` and another appears in `added`
 * within the same commit (GitHub does not explicitly mark renames in push
 * events, unlike the richer "files" API used for pull requests).
 *
 * @param commits - The `commits` array from the push event payload.
 * @param contentPath - The configured content root path (e.g. "posts").
 */
export function detectChangesFromCommits(
  commits: RawCommit[],
  contentPath: string,
): ContentChangeSet {
  const created: FileChange[] = [];
  const modified: FileChange[] = [];
  const deleted: FileChange[] = [];
  const renamed: FileChange[] = [];
  for (const commit of commits) {
    const addedPaths = commit.added ?? [];
    const modifiedPaths = commit.modified ?? [];
    const removedPaths = commit.removed ?? [];
    for (const p of addedPaths) {
      if (!isContentFile(p) || !isInContentPath(p, contentPath)) continue;
      created.push(buildFileChange(p, "added"));
    }
    for (const p of modifiedPaths) {
      if (!isContentFile(p) || !isInContentPath(p, contentPath)) continue;
      modified.push(buildFileChange(p, "modified"));
    }
    for (const p of removedPaths) {
      if (!isContentFile(p) || !isInContentPath(p, contentPath)) continue;
      deleted.push({
        path: p,
        previousPath: null,
        slug: slugFromPath(p),
        status: "removed",
      });
    }
  }
  // Detect renames: a removed + added pair in the same commit where the
  // added file is in the content path. This is a heuristic; GitHub's push
  // event doesn't explicitly mark renames.
  detectRenames(created, deleted, renamed);
  return buildChangeSet(created, modified, deleted, renamed);
}
/**
 * Analyze raw file entries (from the richer "files" API used in pull request
 * payloads or the compare commits API). This path provides explicit rename
 * information via `previous_filename`.
 */
export function detectChangesFromFileEntries(
  entries: RawFileEntry[],
  contentPath: string,
): ContentChangeSet {
  const { created, modified, deleted, renamed } = classifyFileEntries(entries, contentPath);
  return buildChangeSet(created, modified, deleted, renamed);
}
/**
 * Heuristic rename detection: if a slug appears in both `deleted` and
 * `created` lists, treat it as a rename. Move matching entries from
 * created/deleted into the renamed list.
 */
function detectRenames(created: FileChange[], deleted: FileChange[], renamed: FileChange[]): void {
  const deletedBySlug = new Map(deleted.map((d) => [d.slug, d]));
  // Match by exact path first (GitHub sometimes reports rename as remove+add
  // of the same path — unlikely, but handle gracefully).
  for (const c of [...created]) {
    const matchingDelete = deletedBySlug.get(c.slug);
    if (matchingDelete && matchingDelete.path !== c.path) {
      renamed.push({
        path: c.path,
        previousPath: matchingDelete.path,
        slug: c.slug,
        previousSlug: matchingDelete.slug,
        status: "renamed",
      });
      // Remove from created and deleted.
      const cIdx = created.indexOf(c);
      if (cIdx >= 0) created.splice(cIdx, 1);
      const dIdx = deleted.indexOf(matchingDelete);
      if (dIdx >= 0) deleted.splice(dIdx, 1);
      deletedBySlug.delete(matchingDelete.slug);
    }
  }
}
/** Assemble the final ContentChangeSet from classified changes. */
function buildChangeSet(
  created: FileChange[],
  modified: FileChange[],
  deleted: FileChange[],
  renamed: FileChange[],
): ContentChangeSet {
  const affectedSlugs = new Set<string>();
  for (const c of created) {
    if (c.slug) affectedSlugs.add(c.slug);
  }
  for (const m of modified) {
    if (m.slug) affectedSlugs.add(m.slug);
  }
  for (const d of deleted) {
    if (d.slug) affectedSlugs.add(d.slug);
  }
  for (const r of renamed) {
    if (r.slug) affectedSlugs.add(r.slug);
    if (r.previousSlug) affectedSlugs.add(r.previousSlug);
  }
  const hasContentChanges =
    created.length > 0 || modified.length > 0 || deleted.length > 0 || renamed.length > 0;
  return {
    created,
    modified,
    deleted,
    renamed,
    affectedSlugs: Array.from(affectedSlugs),
    hasContentChanges,
  };
}
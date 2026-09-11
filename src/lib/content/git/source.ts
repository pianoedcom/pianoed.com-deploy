/**
 * Git content source adapter.
 *
 * Implements the `ContentSource` interface against a `GitProvider` (e.g.
 * GitHub). All retrieved MDX documents are validated through the same schema
 * as local content. A tagged in-memory cache prevents fetching raw Git content
 * on every user request.
 *
 * Architecture:
 *   Git provider API → cached content layer → MDX renderer
 *
 * The rendering layer depends only on `ContentSource`, so it is agnostic to
 * whether content comes from the local filesystem or a Git provider.
 */
import type { Author, Category, Post, PostSummary, Tag } from "../types";
import type { ContentSource, ListPostsOptions } from "../source";
import type { GitProvider, GitFileEntry } from "./types";
import { ContentCache, cacheKeys } from "./cache";
import {
  splitFrontmatter,
  toPost,
  toSummary,
  validateFrontmatter,
  categoryName,
  tagName,
} from "../frontmatter";
import { isContentFile, slugFromPath } from "./paths";
import { GitProviderError } from "./types";
import { ContentParseError, ContentUnavailableError } from "../errors";
import {
  postTag,
  categoryTag,
  tagTag,
  authorTag,
  POSTS_TAG,
  CATEGORIES_TAG,
  TAGS_TAG,
  AUTHORS_TAG,
} from "@/lib/cache/tags";
/** Directory name for authors within the content root. */
const AUTHORS_DIR = "authors";
export interface GitSourceOptions {
  /** The Git provider instance (GitHub, GitLab, etc.). */
  provider: GitProvider;
  /** Cache TTL in ms. Defaults to 5 minutes. */
  cacheTtlMs?: number;
}
interface ParsedPost {
  slug: string;
  path: string;
  frontmatter: ReturnType<typeof validateFrontmatter>;
  body: string;
}
/**
 * Create a Git-backed content source.
 *
 * The source caches the post index, individual posts, categories, tags, and
 * authors with the key/tag scheme:
 *   posts, post:{slug}, category:{slug}, tag:{slug}, authors
 */
export function createGitSource(options: GitSourceOptions): ContentSource {
  const { provider, cacheTtlMs } = options;
  const cache = new ContentCache();
  // --- Internal: load the post index (metadata only) -----------------------
  /**
   * Fetch and parse all post files into metadata-only summaries.
   * Cached under the `posts` tag.
   */
  async function loadPostIndex(): Promise<ParsedPost[]> {
    const cached = cache.get<ParsedPost[]>(cacheKeys.posts());
    if (cached) return cached;
    let entries: GitFileEntry[];
    try {
      entries = await provider.listFiles("");
    } catch (err) {
      if (err instanceof GitProviderError && err.kind === "not_found") {
        entries = [];
      } else if (err instanceof GitProviderError) {
        // Graceful degradation: wrap Git provider failures as content
        // unavailable errors so the rendering layer can show a safe message
        // instead of crashing.
        throw new ContentUnavailableError(`Git provider error (${err.kind}): ${err.message}`, {
          retryable: err.kind === "network_error" || err.kind === "rate_limited",
        });
      } else {
        throw new ContentUnavailableError(
          `Unexpected error listing content: ${(err as Error).message}`,
          { retryable: true },
        );
      }
    }
    const posts: ParsedPost[] = [];
    const seenSlugs = new Set<string>();
    for (const entry of entries) {
      if (!isContentFile(entry.path)) continue;
      const slug = slugFromPath(entry.path);
      if (seenSlugs.has(slug)) {
        throw new ContentParseError(
          `Duplicate post slug "${slug}" found at ${entry.path}.`,
          entry.path,
        );
      }
      seenSlugs.add(slug);
      const raw = await provider.getFile(entry.path);
      if (raw === null) continue;
      let parsed: { frontmatter: Record<string, unknown>; body: string };
      try {
        parsed = splitFrontmatter(raw);
      } catch (err) {
        if (err instanceof ContentParseError) throw err;
        throw new ContentParseError(
          `Error parsing ${entry.path}: ${(err as Error).message}`,
          entry.path,
        );
      }
      const fm = validateFrontmatter(parsed.frontmatter, slug, entry.path);
      posts.push({ slug, path: entry.path, frontmatter: fm, body: parsed.body });
    }
    cache.set(cacheKeys.posts(), posts, {
      ttlMs: cacheTtlMs,
      tags: [POSTS_TAG],
    });
    return posts;
  }
  /** Filter posts by publishing options. */
  function filterPosts(posts: PostSummary[], options?: ListPostsOptions): PostSummary[] {
    let result = posts;
    if (!options?.includeUnpublished) {
      result = result.filter((p) => p.status === "published");
    }
    if (options?.status) {
      result = result.filter((p) => p.status === options.status);
    }
    if (options?.featuredOnly) {
      result = result.filter((p) => p.featured);
    }
    result = [...result].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return result;
  }
  // --- ContentSource implementation -----------------------------------------
  const source: ContentSource = {
    async listPosts(options?: ListPostsOptions): Promise<PostSummary[]> {
      const index = await loadPostIndex();
      const summaries = index.map((p) => toSummary(p.slug, p.frontmatter, p.body));
      return filterPosts(summaries, options);
    },
    async getPostBySlug(slug: string): Promise<Post | null> {
      const cacheKey = cacheKeys.post(slug);
      const cached = cache.get<ParsedPost>(cacheKey);
      if (cached) {
        if (!cached.frontmatter.published) return null;
        return toPost(cached.slug, cached.frontmatter, cached.body);
      }
      // Use the index to find the path, then fetch the full file.
      const index = await loadPostIndex();
      const found = index.find((p) => p.slug === slug);
      if (!found) return null;
      if (!found.frontmatter.published) return null;
      // The index already has the body (we parsed it to compute reading time),
      // but we cache the full post under its own key for direct lookups.
      cache.set(cacheKey, found, {
        ttlMs: cacheTtlMs,
        tags: [postTag(slug)],
      });
      return toPost(found.slug, found.frontmatter, found.body);
    },
    async getAllCategories(): Promise<Category[]> {
      const cacheKey = cacheKeys.categories();
      const cached = cache.get<Category[]>(cacheKey);
      if (cached) return cached;
      const index = await loadPostIndex();
      const published = index.filter((p) => p.frontmatter.published);
      const slugs = new Set(published.map((p) => p.frontmatter.category));
      const categories = Array.from(slugs).map((slug) => ({
        slug,
        name: categoryName(slug),
      }));
      cache.set(cacheKey, categories, {
        ttlMs: cacheTtlMs,
        tags: [CATEGORIES_TAG],
      });
      return categories;
    },
    async getAllTags(): Promise<Tag[]> {
      const cacheKey = cacheKeys.tags();
      const cached = cache.get<Tag[]>(cacheKey);
      if (cached) return cached;
      const index = await loadPostIndex();
      const published = index.filter((p) => p.frontmatter.published);
      const counts = new Map<string, number>();
      for (const post of published) {
        for (const tag of post.frontmatter.tags) {
          counts.set(tag, (counts.get(tag) ?? 0) + 1);
        }
      }
      const tags = Array.from(counts.entries())
        .map(([slug, count]) => ({ slug, name: tagName(slug), count }))
        .sort((a, b) => b.count - a.count);
      cache.set(cacheKey, tags, {
        ttlMs: cacheTtlMs,
        tags: [TAGS_TAG],
      });
      return tags;
    },
    async getPostsByCategory(category: string): Promise<PostSummary[]> {
      const cacheKey = cacheKeys.category(category);
      const cached = cache.get<PostSummary[]>(cacheKey);
      if (cached) return cached;
      const index = await loadPostIndex();
      const summaries = index
        .filter((p) => p.frontmatter.published && p.frontmatter.category === category)
        .map((p) => toSummary(p.slug, p.frontmatter, p.body));
      const filtered = filterPosts(summaries);
      cache.set(cacheKey, filtered, {
        ttlMs: cacheTtlMs,
        tags: [categoryTag(category)],
      });
      return filtered;
    },
    async getPostsByTag(tag: string): Promise<PostSummary[]> {
      const cacheKey = cacheKeys.tag(tag);
      const cached = cache.get<PostSummary[]>(cacheKey);
      if (cached) return cached;
      const index = await loadPostIndex();
      const summaries = index
        .filter((p) => p.frontmatter.published && p.frontmatter.tags.includes(tag))
        .map((p) => toSummary(p.slug, p.frontmatter, p.body));
      const filtered = filterPosts(summaries);
      cache.set(cacheKey, filtered, {
        ttlMs: cacheTtlMs,
        tags: [tagTag(tag)],
      });
      return filtered;
    },
    async getAuthor(slug: string): Promise<Author | null> {
      const cacheKey = cacheKeys.author(slug);
      const cached = cache.get<Author>(cacheKey);
      if (cached) return cached;
      const author = await loadAuthor(slug);
      if (author) {
        cache.set(cacheKey, author, {
          ttlMs: cacheTtlMs,
          tags: [authorTag(slug)],
        });
      }
      return author;
    },
    async getAllAuthors(): Promise<Author[]> {
      const cacheKey = cacheKeys.authors();
      const cached = cache.get<Author[]>(cacheKey);
      if (cached) return cached;
      let entries: GitFileEntry[];
      try {
        entries = await provider.listFiles(AUTHORS_DIR);
      } catch (err) {
        if (err instanceof GitProviderError && err.kind === "not_found") {
          entries = [];
        } else if (err instanceof GitProviderError) {
          throw new ContentUnavailableError(`Git provider error (${err.kind}): ${err.message}`, {
            retryable: err.kind === "network_error" || err.kind === "rate_limited",
          });
        } else {
          throw new ContentUnavailableError(
            `Unexpected error listing authors: ${(err as Error).message}`,
            { retryable: true },
          );
        }
      }
      const authors: Author[] = [];
      for (const entry of entries) {
        if (!isContentFile(entry.path)) continue;
        const slug = slugFromPath(entry.path);
        const author = await loadAuthorFromPath(entry.path, slug);
        if (author) authors.push(author);
      }
      cache.set(cacheKey, authors, {
        ttlMs: cacheTtlMs,
        tags: [AUTHORS_TAG],
      });
      return authors;
    },
    async getPostsByTranslationKey(translationKey: string): Promise<PostSummary[]> {
      const index = await loadPostIndex();
      const summaries = index
        .map((p) => toSummary(p.slug, p.frontmatter, p.body))
        .filter((p) => p.published && p.translationKey === translationKey);
      return filterPosts(summaries, { locale: "all" });
    },
  };
  /** Load a single author by slug from the provider. */
  async function loadAuthor(slug: string): Promise<Author | null> {
    // Try .mdx then .md
    for (const ext of ["mdx", "md"]) {
      const path = `${AUTHORS_DIR}/${slug}.${ext}`;
      let raw: string | null;
      try {
        raw = await provider.getFile(path);
      } catch (err) {
        if (err instanceof GitProviderError && err.kind === "not_found") {
          continue;
        }
        throw new ContentUnavailableError(
          err instanceof GitProviderError
            ? `Git provider error (${err.kind}): ${err.message}`
            : `Unexpected error fetching author: ${(err as Error).message}`,
          { retryable: true, sourceLabel: slug },
        );
      }
      if (raw !== null) {
        return loadAuthorFromPath(path, slug, raw);
      }
    }
    return null;
  }
  /** Parse an author file from raw content (or fetch it if not provided). */
  async function loadAuthorFromPath(
    path: string,
    slug: string,
    raw?: string,
  ): Promise<Author | null> {
    const content = raw ?? (await provider.getFile(path));
    if (content === null) return null;
    let parsed: { frontmatter: Record<string, unknown>; body: string };
    try {
      parsed = splitFrontmatter(content);
    } catch (err) {
      if (err instanceof ContentParseError) throw err;
      throw new ContentParseError(`Error parsing author ${path}: ${(err as Error).message}`, path);
    }
    const fm = parsed.frontmatter as Record<string, unknown>;
    const socialRaw = (fm.social ?? {}) as Record<string, unknown>;
    return {
      slug,
      name: String(fm.name ?? ""),
      bio: String(fm.bio ?? ""),
      avatar: String(fm.avatar ?? "/placeholder.svg"),
      role: String(fm.role ?? ""),
      social: {
        twitter: typeof socialRaw.twitter === "string" ? socialRaw.twitter : undefined,
        github: typeof socialRaw.github === "string" ? socialRaw.github : undefined,
        linkedin: typeof socialRaw.linkedin === "string" ? socialRaw.linkedin : undefined,
        website: typeof socialRaw.website === "string" ? socialRaw.website : undefined,
      },
    };
  }
  return source;
}
/**
 * Cached query layer.
 *
 * Wraps the active `ContentSource` with a tagged, stale-while-revalidate
 * cache. Every query is cached with deterministic tags so revalidation
 * helpers can invalidate precisely:
 *
 *   listPostsCached()         → tags: [posts, homepage]
 *   getPostCached(slug)       → tags: [posts, post:{slug}, category:{cat}, tag:{t}..., homepage]
 *   getPostsByCategoryCached  → tags: [category:{slug}, categories]
 *   getPostsByTagCached       → tags: [tag:{slug}, tags]
 *   getAllCategoriesCached    → tags: [categories]
 *   getAllTagsCached          → tags: [tags]
 *   getAuthorCached           → tags: [author:{slug}, authors]
 *   getAllAuthorsCached       → tags: [authors]
 *   getHomepageLatestCached   → tags: [homepage, posts]
 *   getHomepageFeaturedCached → tags: [homepage, posts]
 *
 * Stale-while-revalidate: when a cached entry is past its fresh window but
 * within the stale window, the stale value is returned immediately and a
 * background refresh is triggered. The caller never blocks on revalidation.
 */
import type { Author, Category, Post, PostSummary, Tag, ListPostsOptions } from "./types";
import { contentSource } from "./source-resolver";
import { contentCache, type CacheResult } from "./cache";
import type { CacheProfileName } from "@/lib/cache/profiles";
import {
  POSTS_TAG,
  CATEGORIES_TAG,
  TAGS_TAG,
  AUTHORS_TAG,
  HOMEPAGE_TAG,
  postTag,
  categoryTag,
  tagTag,
  authorTag,
  tagsForPost,
  tagsForPostIndex,
  tagsForCategory,
  tagsForTag,
  tagsForCategories,
  tagsForTags,
  tagsForAuthor,
  tagsForAuthors,
  tagsForHomepage,
} from "@/lib/cache/tags";
/**
 * Read from cache or fetch from source, with SWR background refresh.
 *
 * If the entry is stale (past freshMs but within staleMs), the stale value
 * is returned immediately and a background refresh runs. If no entry exists,
 * the fetch is blocking.
 */
async function cachedQuery<T>(
  key: string,
  tags: string[],
  profile: CacheProfileName,
  fetcher: () => Promise<T>,
): Promise<T> {
  const result: CacheResult<T> = contentCache.get<T>(key);
  if (result.hasValue && !result.isStale) {
    // Fresh cache hit — return immediately.
    return result.value as T;
  }
  if (result.hasValue && result.isStale) {
    // Stale-but-valid — serve immediately, refresh in background.
    if (contentCache.markRevalidating(key)) {
      fetcher()
        .then((fresh) => {
          contentCache.set(key, fresh, { profile, tags });
          contentCache.clearRevalidating(key);
        })
        .catch(() => {
          contentCache.clearRevalidating(key);
        });
    }
    return result.value as T;
  }
  // Cache miss — blocking fetch.
  const value = await fetcher();
  contentCache.set(key, value, { profile, tags });
  return value;
}
// --- Public cached query functions -----------------------------------------
/** List all published posts (cached under posts + homepage tags). */
export async function listPostsCached(options?: ListPostsOptions): Promise<PostSummary[]> {
  const key = `listPosts:${JSON.stringify(options ?? {})}`;
  return cachedQuery(key, tagsForPostIndex(), "short", () => contentSource.listPosts(options));
}
/** Get a single post by slug (cached with post, category, tag, and homepage tags). */
export async function getPostCached(slug: string): Promise<Post | null> {
  const key = `getPost:${slug}`;
  // Check cache first — if fresh or stale, return from cache (SWR handles
  // background refresh for stale entries).
  const cached = contentCache.get<Post>(key);
  if (cached.hasValue) {
    // If stale, trigger background refresh (same SWR pattern as cachedQuery).
    if (cached.isStale && contentCache.markRevalidating(key)) {
      contentSource
        .getPostBySlug(slug)
        .then((fresh) => {
          if (fresh) {
            contentCache.set(key, fresh, {
              profile: "default",
              tags: tagsForPost(fresh.slug, fresh.category, fresh.tags),
            });
          } else {
            // Post was deleted or unpublished — evict the cache entry.
            contentCache.delete(key);
          }
          contentCache.clearRevalidating(key);
        })
        .catch(() => {
          contentCache.clearRevalidating(key);
        });
    }
    return cached.value as Post;
  }
  // Cache miss — blocking fetch, then cache with full tags.
  const post = await contentSource.getPostBySlug(slug);
  if (post) {
    contentCache.set(key, post, {
      profile: "default",
      tags: tagsForPost(post.slug, post.category, post.tags),
    });
  }
  return post;
}
/** List posts in a category (cached under category:{slug} + categories). */
export async function getPostsByCategoryCached(
  category: string,
  options?: ListPostsOptions,
): Promise<PostSummary[]> {
  const key = `byCategory:${category}:${JSON.stringify(options ?? {})}`;
  return cachedQuery(key, tagsForCategory(category), "short", () =>
    contentSource.getPostsByCategory(category, options),
  );
}
/** List posts with a tag (cached under tag:{slug} + tags). */
export async function getPostsByTagCached(
  tag: string,
  options?: ListPostsOptions,
): Promise<PostSummary[]> {
  const key = `byTag:${tag}:${JSON.stringify(options ?? {})}`;
  return cachedQuery(key, tagsForTag(tag), "short", () =>
    contentSource.getPostsByTag(tag, options),
  );
}
/** Get all categories (cached under categories tag). */
export async function getAllCategoriesCached(): Promise<Category[]> {
  const key = "allCategories";
  return cachedQuery(key, tagsForCategories(), "long", () => contentSource.getAllCategories());
}
/** Get all tags (cached under tags tag). */
export async function getAllTagsCached(): Promise<Tag[]> {
  const key = "allTags";
  return cachedQuery(key, tagsForTags(), "long", () => contentSource.getAllTags());
}
/** Get a single author by slug (cached under author:{slug} + authors). */
export async function getAuthorCached(slug: string): Promise<Author | null> {
  const key = `author:${slug}`;
  return cachedQuery(key, tagsForAuthor(slug), "long", () => contentSource.getAuthor(slug));
}
/** Get all authors (cached under authors tag). */
export async function getAllAuthorsCached(): Promise<Author[]> {
  const key = "allAuthors";
  return cachedQuery(key, tagsForAuthors(), "long", () => contentSource.getAllAuthors());
}
/** Get latest posts for the homepage (cached under homepage + posts). */
export async function getHomepageLatestCached(limit = 3, locale = "en"): Promise<PostSummary[]> {
  const key = `homepage:latest:${limit}:${locale}`;
  return cachedQuery(key, tagsForHomepage(), "homepage", async () => {
    const all = await contentSource.listPosts({ locale });
    return all.slice(0, limit);
  });
}
/** Get featured posts for the homepage (cached under homepage + posts). */
export async function getHomepageFeaturedCached(limit = 3, locale = "en"): Promise<PostSummary[]> {
  const key = `homepage:featured:${limit}:${locale}`;
  return cachedQuery(key, tagsForHomepage(), "homepage", async () => {
    const all = await contentSource.listPosts({ featuredOnly: true, locale });
    return all.slice(0, limit);
  });
}
/** Get latest posts for the homepage ticker (cached under homepage + posts). */
export async function getHomepageTickerCached(limit = 5, locale = "en"): Promise<PostSummary[]> {
  const key = `homepage:ticker:${limit}:${locale}`;
  return cachedQuery(key, tagsForHomepage(), "homepage", async () => {
    const all = await contentSource.listPosts({ locale });
    return all.slice(0, limit);
  });
}
/** Get posts for a category for the homepage (cached under category + homepage). */
export async function getHomepageCategoryCached(
  category: string,
  limit = 4,
  locale = "en",
): Promise<PostSummary[]> {
  const key = `homepage:category:${category}:${limit}:${locale}`;
  return cachedQuery(
    key,
    [...tagsForCategory(category), ...tagsForHomepage()],
    "homepage",
    async () => {
      const all = await contentSource.getPostsByCategory(category, { locale });
      return all.slice(0, limit);
    },
  );
}
/** Get trending posts for the homepage sidebar (cached under homepage + posts). */
export async function getHomepageTrendingCached(limit = 5, locale = "en"): Promise<PostSummary[]> {
  const key = `homepage:trending:${limit}:${locale}`;
  return cachedQuery(key, tagsForHomepage(), "homepage", async () => {
    const all = await contentSource.listPosts({ locale });
    return all.slice(0, limit);
  });
}
/** Get recent posts by a specific author for the homepage spotlight. */
export async function getHomepageAuthorPostsCached(
  authorSlug: string,
  limit = 3,
  locale = "en",
): Promise<PostSummary[]> {
  const key = `homepage:author:${authorSlug}:${limit}:${locale}`;
  return cachedQuery(
    key,
    [...tagsForAuthor(authorSlug), ...tagsForHomepage()],
    "homepage",
    async () => {
      const all = await contentSource.listPosts({ locale });
      return all.filter((p) => p.author === authorSlug).slice(0, limit);
    },
  );
}
/** Find all published posts sharing a translationKey (for i18n). */
export async function getPostsByTranslationKeyCached(
  translationKey: string,
): Promise<PostSummary[]> {
  const key = `translations:${translationKey}`;
  return cachedQuery(key, [POSTS_TAG], "long", () =>
    contentSource.getPostsByTranslationKey(translationKey),
  );
}

/**
 * Get adjacent published posts (previous and next) strictly filtering out
 * draft and future-dated posts.
 */
export async function getAdjacentPosts(
  currentSlug: string,
  locale = "en",
): Promise<{ previous: PostSummary | null; next: PostSummary | null }> {
  const allPosts = await contentSource.listPosts({ locale });
  const now = Date.now();
  const publishedPosts = allPosts
    .filter((p) => p.published && new Date(p.date).getTime() <= now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const currentIndex = publishedPosts.findIndex((p) => p.slug === currentSlug);
  if (currentIndex === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: currentIndex > 0 ? publishedPosts[currentIndex - 1] : null,
    next: currentIndex < publishedPosts.length - 1 ? publishedPosts[currentIndex + 1] : null,
  };
}

/**
 * Get related published posts for an article, respecting category, tags,
 * curated relatedArticles, and strict publish date guards.
 */
export async function getRelatedPosts(
  post: Post,
  limit = 3,
  locale = "en",
): Promise<PostSummary[]> {
  const allPosts = await contentSource.listPosts({ locale });
  const now = Date.now();
  const publishedPosts = allPosts.filter(
    (p) => p.slug !== post.slug && p.published && new Date(p.date).getTime() <= now,
  );

  // 1. Curated relatedArticles
  if (post.relatedArticles && post.relatedArticles.length > 0) {
    const curated = post.relatedArticles
      .map((slug) => publishedPosts.find((p) => p.slug === slug))
      .filter((p): p is PostSummary => p !== undefined);
    if (curated.length > 0) return curated.slice(0, limit);
  }

  // 2. Fall back to scoring
  const scored = publishedPosts
    .map((p) => {
      let score = 0;
      if (p.category === post.category) score += 20;
      const sharedTags = p.tags.filter((t) => post.tags.includes(t));
      score += sharedTags.length * 10;
      const titleWords = post.title.toLowerCase().split(/\s+/);
      const pTitleWords = p.title.toLowerCase().split(/\s+/);
      const sharedWords = titleWords.filter((w) => pTitleWords.includes(w));
      score += sharedWords.length * 5;
      const ageDays = (now - new Date(p.date).getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 10 - ageDays / 30);
      return { post: p, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.post);
}
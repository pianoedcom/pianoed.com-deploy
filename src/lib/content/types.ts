/**
 * Content-pipeline types.
 *
 * These are the runtime contracts used by the content source abstraction and
 * the rendering layer. They are inferred from the Zod frontmatter schema
 * (see `./schema`) wherever possible so validation and types never drift.
 */
/** Publishing status of a post. */
export type PostStatus = "draft" | "published" | "archived";
/** A category record. */
export interface Category {
  /** Unique slug, e.g. "software-craft". */
  slug: string;
  /** Display name. */
  name: string;
  /** Optional short description. */
  description?: string;
}
/** A tag aggregate. */
export interface Tag {
  /** Unique slug, e.g. "typescript". */
  slug: string;
  /** Display name. */
  name: string;
  /** Number of published posts with this tag. */
  count: number;
}
/** A single author record. */
export interface Author {
  /** Unique slug, e.g. "site-team". */
  slug: string;
  /** Display name. */
  name: string;
  /** Short biography. */
  bio: string;
  /** Avatar URL. */
  avatar: string;
  /** Role/title, e.g. "Lead Editor". */
  role?: string;
  /** Optional social links. */
  social?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
}
/** Lightweight post metadata used in listings. */
export interface PostSummary {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  author: string;
  category: string;
  tags: string[];
  image?: string;
  imageAlt?: string;
  published: boolean;
  featured: boolean;
  status: PostStatus;
  readingTime: number;
  /** Whether search engines should ignore this post. */
  noindex: boolean;
  /**
   * First ~2000 characters of the post body for full-text search.
   * Not rendered in listings — only used by the search index for body matching.
   */
  bodyExcerpt?: string;
  /** BCP-47 locale code (e.g. "en", "hi"). Defaults to site default if unset. */
  locale?: string;
  /** Shared key linking translated versions of the same article. */
  translationKey?: string;
  /** Series identifier linking sequential articles. */
  series?: string;
  /** Position within the series (1-indexed). */
  seriesPart?: number;
  /** Whether this article is sponsored content. */
  sponsored?: boolean;
}
/** A fully resolved post including its raw MDX body. */
export interface Post extends PostSummary {
  /** Raw MDX body (frontmatter stripped). */
  body: string;
  /** Canonical URL override, if set in frontmatter. */
  canonicalUrl?: string;
  /** Manually curated related article slugs. */
  relatedArticles?: string[];
}
/** Options for listing posts. */
export interface ListPostsOptions {
  /** When true, include draft and archived posts. Defaults to false. */
  includeUnpublished?: boolean;
  /** Limit to a specific status. */
  status?: PostStatus;
  /** Limit to featured posts only. */
  featuredOnly?: boolean;
  /** Filter posts by locale code (e.g. "en", "de", "es", "fr"). Defaults to "en" if not specified. Pass "all" for all locales. */
  locale?: string;
}
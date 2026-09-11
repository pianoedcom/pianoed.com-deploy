import type { Author, Category, Post, PostSummary, PostStatus, Tag } from "./types";
import type { ListPostsOptions } from "./types";
/**
 * Content source abstraction.
 *
 * The rendering layer depends on this interface rather than any specific
 * content adapter. A local MDX adapter is provided in `./local-source`, and
 * a remote adapter (e.g. GitHub) can be plugged in later without changing
 * rendering code.
 */
export interface ContentSource {
  /** List post summaries (metadata only — bodies not loaded). */
  listPosts(options?: ListPostsOptions): Promise<PostSummary[]>;
  /** Get a single fully-resolved post by slug, or null if not found. */
  getPostBySlug(slug: string): Promise<Post | null>;
  /** Get all categories that have at least one published post. */
  getAllCategories(): Promise<Category[]>;
  /** Get all tags with counts across published posts. */
  getAllTags(): Promise<Tag[]>;
  /** List published post summaries in a given category slug. */
  getPostsByCategory(category: string, options?: ListPostsOptions): Promise<PostSummary[]>;
  /** List published post summaries with a given tag slug. */
  getPostsByTag(tag: string, options?: ListPostsOptions): Promise<PostSummary[]>;
  /** Get an author by slug, or null. */
  getAuthor(slug: string): Promise<Author | null>;
  /** Get all authors. */
  getAllAuthors(): Promise<Author[]>;
  /** Find all published posts sharing a translationKey (for i18n). */
  getPostsByTranslationKey(translationKey: string): Promise<PostSummary[]>;
}
/** Re-export status types for consumers. */
export type { PostStatus, ListPostsOptions } from "./types";
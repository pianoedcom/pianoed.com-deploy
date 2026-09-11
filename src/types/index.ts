/**
 * Shared TypeScript types for the blog.
 *
 * Content types now live in `@/lib/content/types` (the content pipeline) and
 * are re-exported from `@/types/content`. This file retains the legacy
 * `SeoMeta` type for backward compatibility; new code should use
 * `PageMetadata` from `@/lib/seo` instead.
 */
export type { PageMetadata, MetaTag } from "@/lib/seo";
/**
 * Legacy SEO metadata type. Prefer `PageMetadata` from `@/lib/seo`.
 * @deprecated Use `PageMetadata` from `@/lib/seo` instead.
 */
export interface SeoMeta {
  title: string;
  description: string;
  /** Canonical path, e.g. "/posts/my-post". */
  path: string;
  /** Optional OG image override. */
  image?: string;
  /** Whether this is an article (adds article OG tags). */
  article?: boolean;
  /** Optional published time (ISO) for articles. */
  publishedAt?: string;
}
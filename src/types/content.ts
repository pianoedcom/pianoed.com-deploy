/**
 * Shared content types re-exported from the content pipeline.
 *
 * Consumers can import from `@/types/content` or `@/lib/content` — both point
 * to the same contracts.
 */
export type {
  Author,
  Category,
  Post,
  PostStatus,
  PostSummary,
  Tag,
  ListPostsOptions,
} from "@/lib/content/types";
export type { ContentSource } from "@/lib/content/source";
export type { Frontmatter } from "@/lib/content/schema";
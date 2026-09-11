/**
 * Central cache tag definitions.
 *
 * Every cached content operation is tagged so it can be invalidated
 * precisely. Tags follow the scheme:
 *
 *   posts            — all post metadata / post index
 *   post:{slug}      — a single post
 *   category:{slug}  — a category listing
 *   tag:{slug}       — a tag listing
 *   categories       — the full categories collection
 *   tags             — the full tags collection
 *   authors          — all authors
 *   author:{slug}    — a single author
 *   homepage         — homepage latest & featured posts
 */
/** Tag for the entire post index. */
export const POSTS_TAG = "posts";
/** Tag for the categories collection. */
export const CATEGORIES_TAG = "categories";
/** Tag for the tags collection. */
export const TAGS_TAG = "tags";
/** Tag for all authors. */
export const AUTHORS_TAG = "authors";
/** Tag for homepage-specific cached data. */
export const HOMEPAGE_TAG = "homepage";
/** Tag for search index cached data. */
export const SEARCH_TAG = "search";
/** Build the tag for a single post. */
export function postTag(slug: string): string {
  return `post:${slug}`;
}
/** Build the tag for a category listing. */
export function categoryTag(slug: string): string {
  return `category:${slug}`;
}
/** Build the tag for a tag listing. */
export function tagTag(slug: string): string {
  return `tag:${slug}`;
}
/** Build the tag for a single author. */
export function authorTag(slug: string): string {
  return `author:${slug}`;
}
/**
 * Compute the full set of tags a post should be cached under.
 *
 * A post belongs to:
 *   - the global posts index tag
 *   - its own individual tag
 *   - its category listing tag
 *   - each of its tag listing tags
 *   - the homepage tag (it may appear in latest/featured)
 */
export function tagsForPost(slug: string, category: string, tags: string[]): string[] {
  return [POSTS_TAG, postTag(slug), categoryTag(category), ...tags.map(tagTag), HOMEPAGE_TAG];
}
/** Tags for the post index. */
export function tagsForPostIndex(): string[] {
  return [POSTS_TAG, HOMEPAGE_TAG, CATEGORIES_TAG, TAGS_TAG];
}
/** Tags for a category listing. */
export function tagsForCategory(slug: string): string[] {
  return [categoryTag(slug), CATEGORIES_TAG];
}
/** Tags for a tag listing. */
export function tagsForTag(slug: string): string[] {
  return [tagTag(slug), TAGS_TAG];
}
/** Tags for the categories collection. */
export function tagsForCategories(): string[] {
  return [CATEGORIES_TAG];
}
/** Tags for the tags collection. */
export function tagsForTags(): string[] {
  return [TAGS_TAG];
}
/** Tags for a single author. */
export function tagsForAuthor(slug: string): string[] {
  return [authorTag(slug), AUTHORS_TAG];
}
/** Tags for all authors. */
export function tagsForAuthors(): string[] {
  return [AUTHORS_TAG];
}
/** Tags for the homepage. */
export function tagsForHomepage(): string[] {
  return [HOMEPAGE_TAG, POSTS_TAG];
}
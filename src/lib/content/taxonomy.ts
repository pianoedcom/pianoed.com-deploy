/**
 * Taxonomy helpers.
 *
 * Provides validation and lookup utilities for categories, tags, and
 * authors. Guards against invalid taxonomy slugs and empty taxonomy
 * pages — the rendering layer uses these to 404 unknown categories/tags
 * and to avoid rendering thin or empty listing pages.
 */
import { KNOWN_CATEGORIES, KNOWN_TAGS } from "./constants";
import type { Category, Tag, PostSummary, Author } from "./types";
/**
 * Returns true if the slug is a known category.
 * Uses the canonical category list from content constants.
 */
export function isValidCategory(slug: string): boolean {
  return (KNOWN_CATEGORIES as readonly string[]).includes(slug);
}
/**
 * Returns true if the slug is a known tag.
 * Uses the canonical tag list from content constants.
 */
export function isValidTag(slug: string): boolean {
  return (KNOWN_TAGS as readonly string[]).includes(slug);
}
/**
 * Returns true if the author slug exists in the given author list.
 */
export function isValidAuthor(slug: string, authors: Author[]): boolean {
  return authors.some((a) => a.slug === slug);
}
/**
 * Find a category by slug from a list, or null if not found.
 */
export function findCategory(slug: string, categories: Category[]): Category | null {
  return categories.find((c) => c.slug === slug) ?? null;
}
/**
 * Find a tag by slug from a list, or null if not found.
 */
export function findTag(slug: string, tags: Tag[]): Tag | null {
  return tags.find((t) => t.slug === slug) ?? null;
}
/**
 * Find an author by slug from a list, or null if not found.
 */
export function findAuthor(slug: string, authors: Author[]): Author | null {
  return authors.find((a) => a.slug === slug) ?? null;
}
/**
 * Group posts by year. Returns a map of year (number) to posts.
 * Posts are assumed to be already sorted by date descending.
 */
export function groupByYear(posts: PostSummary[]): Map<number, PostSummary[]> {
  const map = new Map<number, PostSummary[]>();
  for (const post of posts) {
    const year = new Date(post.date).getFullYear();
    const existing = map.get(year);
    if (existing) {
      existing.push(post);
    } else {
      map.set(year, [post]);
    }
  }
  return map;
}
/**
 * Group posts by year and month. Returns a map of "YYYY-MM" to posts.
 */
export function groupByYearMonth(posts: PostSummary[]): Map<string, PostSummary[]> {
  const map = new Map<string, PostSummary[]>();
  for (const post of posts) {
    const d = new Date(post.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const existing = map.get(key);
    if (existing) {
      existing.push(post);
    } else {
      map.set(key, [post]);
    }
  }
  return map;
}
/**
 * Get all distinct years that have at least one published post,
 * sorted descending.
 */
export function getArchiveYears(posts: PostSummary[]): number[] {
  const years = new Set<number>();
  for (const post of posts) {
    years.add(new Date(post.date).getFullYear());
  }
  return Array.from(years).sort((a, b) => b - a);
}
/**
 * Get all distinct year-month keys that have at least one published post,
 * sorted descending. Returns objects with year, month (1-12), and count.
 */
export function getArchiveMonths(
  posts: PostSummary[],
): { year: number; month: number; count: number }[] {
  const map = groupByYearMonth(posts);
  return Array.from(map.entries())
    .map(([key, monthPosts]) => {
      const [yearStr, monthStr] = key.split("-");
      return {
        year: Number(yearStr),
        month: Number(monthStr),
        count: monthPosts.length,
      };
    })
    .sort((a, b) => b.year - a.year || b.month - a.month);
}
/**
 * Filter posts to a specific year.
 */
export function getPostsByYear(posts: PostSummary[], year: number): PostSummary[] {
  return posts.filter((p) => new Date(p.date).getFullYear() === year);
}
/**
 * Filter posts to a specific year and month (1-12).
 */
export function getPostsByYearMonth(
  posts: PostSummary[],
  year: number,
  month: number,
): PostSummary[] {
  return posts.filter((p) => {
    const d = new Date(p.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });
}
/** Month names for display. */
export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
/** Get the display name for a month (1-12). */
export function monthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? "Unknown";
}
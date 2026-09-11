/**
 * Pagination utilities.
 *
 * URL-based pagination for content listings. Supports a configurable
 * page size and produces metadata for rendering pagination controls.
 */
/** Default number of posts per page. */
export const DEFAULT_PAGE_SIZE = 9;
export interface PaginationInput {
  /** Total number of items. */
  total: number;
  /** Current page number (1-based). */
  page: number;
  /** Items per page. */
  pageSize?: number;
}
export interface PaginationResult {
  /** Current page (1-based, clamped to valid range). */
  page: number;
  /** Total number of pages. */
  totalPages: number;
  /** Total number of items. */
  total: number;
  /** Items per page. */
  pageSize: number;
  /** Whether there is a previous page. */
  hasPrev: boolean;
  /** Whether there is a next page. */
  hasNext: boolean;
  /** Start index (inclusive, 0-based) for slicing the items array. */
  start: number;
  /** End index (exclusive, 0-based) for slicing the items array. */
  end: number;
  /** Whether the requested page was out of range (below 1 or above totalPages). */
  outOfRange: boolean;
}
/**
 * Calculate pagination metadata from total count and current page.
 *
 * Page is clamped to a minimum of 1. If page exceeds totalPages, the
 * `outOfRange` flag is set so the caller can return a 404.
 */
export function paginate({
  total,
  page,
  pageSize = DEFAULT_PAGE_SIZE,
}: PaginationInput): PaginationResult {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.max(1, page);
  const outOfRange = clampedPage > totalPages;
  const start = (clampedPage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  return {
    page: clampedPage,
    totalPages,
    total,
    pageSize,
    hasPrev: clampedPage > 1,
    hasNext: clampedPage < totalPages,
    start,
    end,
    outOfRange,
  };
}
/**
 * Slice an items array to the current page.
 */
export function slicePage<T>(items: T[], pagination: PaginationResult): T[] {
  return items.slice(pagination.start, pagination.end);
}
/**
 * Parse a page number from a URL query string value.
 * Returns 1 for invalid/missing values.
 */
export function parsePageParam(value: string | null): number {
  if (!value) return 1;
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n < 1) return 1;
  return n;
}
/**
 * Build an array of page numbers for pagination controls, with ellipsis
 * for large ranges. Returns an array of numbers and "..." strings.
 *
 * Example for 10 pages, current page 5: [1, "...", 4, 5, 6, "...", 10]
 */
export function pageRange(current: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push("...");
  pages.push(totalPages);
  return pages;
}
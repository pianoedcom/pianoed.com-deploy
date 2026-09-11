/**
 * Input validation and sanitization utilities.
 *
 * Centralizes validation for all API inputs to prevent injection attacks,
 * ensure data integrity, and provide consistent error messages.
 *
 * Security principles:
 *   - Never trust user input — validate everything at the boundary.
 *   - Constrain input length to prevent DoS and memory exhaustion.
 *   - Reject control characters that could be used for header injection.
 *   - Sanize strings for safe display (prevent XSS in user-generated content).
 */
/** Maximum length for a slug parameter. */
export const MAX_SLUG_LENGTH = 200;
/** Maximum length for a search query. */
export const MAX_QUERY_LENGTH = 200;
/** Maximum length for a category/tag parameter. */
export const MAX_TAXONOMY_LENGTH = 100;
/** Maximum page number (prevents extreme pagination abuse). */
export const MAX_PAGE_NUMBER = 10_000;
/**
 * Validate a slug parameter.
 *
 * Slugs must be:
 *   - Non-empty
 *   - Max 200 characters
 *   - Only lowercase alphanumeric and hyphens
 *   - Not starting or ending with a hyphen
 */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug || slug.length === 0) {
    return { valid: false, error: "Slug is required." };
  }
  if (slug.length > MAX_SLUG_LENGTH) {
    return { valid: false, error: `Slug must be at most ${MAX_SLUG_LENGTH} characters.` };
  }
  // Only lowercase alphanumeric and hyphens, not starting/ending with hyphen.
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return {
      valid: false,
      error: "Slug must be lowercase alphanumeric with hyphens (e.g. 'my-post').",
    };
  }
  return { valid: true };
}
/**
 * Validate a page number parameter.
 *
 * Must be a positive integer, not exceeding MAX_PAGE_NUMBER.
 */
export function validatePageNumber(page: unknown): {
  valid: boolean;
  value?: number;
  error?: string;
} {
  const num = typeof page === "string" ? parseInt(page, 10) : Number(page);
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return { valid: false, error: "Page must be a number." };
  }
  if (num < 1) {
    return { valid: false, error: "Page must be at least 1." };
  }
  if (num > MAX_PAGE_NUMBER) {
    return { valid: false, error: `Page must be at most ${MAX_PAGE_NUMBER}.` };
  }
  return { valid: true, value: Math.floor(num) };
}
/**
 * Validate a year parameter.
 *
 * Must be a 4-digit year between 1990 and the current year + 1.
 */
export function validateYear(year: unknown): {
  valid: boolean;
  value?: number;
  error?: string;
} {
  const num = typeof year === "string" ? parseInt(year, 10) : Number(year);
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return { valid: false, error: "Year must be a number." };
  }
  const currentYear = new Date().getFullYear();
  if (num < 1990 || num > currentYear + 1) {
    return {
      valid: false,
      error: `Year must be between 1990 and ${currentYear + 1}.`,
    };
  }
  return { valid: true, value: Math.floor(num) };
}
/**
 * Validate a month parameter.
 *
 * Must be an integer between 1 and 12.
 */
export function validateMonth(month: unknown): {
  valid: boolean;
  value?: number;
  error?: string;
} {
  const num = typeof month === "string" ? parseInt(month, 10) : Number(month);
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return { valid: false, error: "Month must be a number." };
  }
  if (num < 1 || num > 12) {
    return { valid: false, error: "Month must be between 1 and 12." };
  }
  return { valid: true, value: Math.floor(num) };
}
/**
 * Sanitize a string for safe display.
 *
 * Strips control characters (except common whitespace) and limits length.
 * This does NOT HTML-escape — use React's built-in escaping for that.
 * Use this for raw strings that might contain control characters from
 * external sources.
 */
export function sanitizeString(input: string, maxLength = 1000): string {
  // Remove control characters except \t, \n, \r
  const cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return cleaned.slice(0, maxLength);
}
/**
 * Validate that a string contains no header injection characters.
 *
 * CRLF injection can be used to inject HTTP headers. Any string that
 * will be used in a header context must pass this check.
 */
export function isHeaderSafe(input: string): boolean {
  return !/[\r\n]/.test(input);
}
/**
 * Validate a content type header.
 *
 * Ensures the request has the expected content type for POST endpoints.
 */
export function validateContentType(contentType: string | null, expected: string): boolean {
  if (!contentType) return false;
  // Content-Type can include charset: "application/json; charset=utf-8"
  return contentType.split(";")[0].trim().toLowerCase() === expected.toLowerCase();
}
/**
 * Constrain a string to a maximum length, truncating with an ellipsis
 * if needed. Used for display contexts where length must be bounded.
 */
export function constrainLength(input: string, max: number): string {
  if (input.length <= max) return input;
  if (max <= 3) return input.slice(0, max);
  return input.slice(0, max - 1).trimEnd() + "…";
}
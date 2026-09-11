/**
 * Content-specific error classes.
 *
 * Provides a structured error hierarchy for content pipeline failures:
 * - ContentNotFoundError: article/category/tag/author not found
 * - ContentValidationError: frontmatter schema failure
 * - ContentParseError: MDX/YAML parsing failure
 * - ContentUnavailableError: content source (Git, local) unreachable
 *
 * Each error carries a `kind` field consumed by the observability layer's
 * `classifyError()` for automatic categorization. User-safe messages are
 * separated from internal diagnostic messages.
 */
/** Error kinds shared across content errors. */
export type ContentErrorKind =
  "content_not_found" | "content_invalid" | "content_parse_error" | "content_unavailable";
/** Base class for all content errors. */
export abstract class ContentError extends Error {
  abstract readonly kind: ContentErrorKind;
  /** User-safe message (no paths, slugs, or internal details). */
  readonly userMessage: string;
  /** Source label (file path or slug) for diagnostics. */
  readonly sourceLabel?: string;
  constructor(message: string, userMessage: string, sourceLabel?: string) {
    super(message);
    this.name = "ContentError";
    this.userMessage = userMessage;
    this.sourceLabel = sourceLabel;
  }
}
/** Thrown when a post, category, tag, or author is not found. */
export class ContentNotFoundError extends ContentError {
  readonly kind: ContentErrorKind = "content_not_found";
  constructor(resource: string, slug: string) {
    super(
      `${resource} not found: "${slug}"`,
      `The requested ${resource.toLowerCase()} could not be found.`,
      slug,
    );
    this.name = "ContentNotFoundError";
  }
}
/** Thrown when frontmatter fails schema validation. */
export class ContentValidationError extends ContentError {
  readonly kind: ContentErrorKind = "content_invalid";
  readonly field?: string;
  constructor(message: string, sourceLabel: string, field?: string) {
    super(message, "The content could not be displayed due to a formatting issue.", sourceLabel);
    this.name = "ContentValidationError";
    this.field = field;
  }
}
/** Thrown when MDX or YAML parsing fails. */
export class ContentParseError extends ContentError {
  readonly kind: ContentErrorKind = "content_parse_error";
  constructor(message: string, sourceLabel: string) {
    super(message, "The content could not be processed.", sourceLabel);
    this.name = "ContentParseError";
  }
}
/** Thrown when the content source (Git provider, filesystem) is unreachable. */
export class ContentUnavailableError extends ContentError {
  readonly kind: ContentErrorKind = "content_unavailable";
  readonly retryable: boolean;
  constructor(message: string, options?: { retryable?: boolean; sourceLabel?: string }) {
    super(
      message,
      "Content is temporarily unavailable. Please try again later.",
      options?.sourceLabel,
    );
    this.name = "ContentUnavailableError";
    this.retryable = options?.retryable ?? false;
  }
}
/** Type guard: is this error a ContentError? */
export function isContentError(error: unknown): error is ContentError {
  return error instanceof ContentError;
}
/** Type guard: is this a not-found error? */
export function isContentNotFoundError(error: unknown): error is ContentNotFoundError {
  return error instanceof ContentNotFoundError;
}
/** Type guard: is this a validation error? */
export function isContentValidationError(error: unknown): error is ContentValidationError {
  return error instanceof ContentValidationError;
}
/** Type guard: is this a parse error? */
export function isContentParseError(error: unknown): error is ContentParseError {
  return error instanceof ContentParseError;
}
/** Type guard: is this an availability error? */
export function isContentUnavailableError(error: unknown): error is ContentUnavailableError {
  return error instanceof ContentUnavailableError;
}
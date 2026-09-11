/**
 * Error classification and error-tracking adapter boundary.
 *
 * Provides a consistent error taxonomy so the application can classify
 * failures (content, network, validation, external service) and route
 * them to appropriate handlers. The `ErrorReporter` interface allows
 * wiring an external service (Sentry, Datadog, Bugsnag) without coupling
 * the application architecture to a single provider.
 *
 * The error layer must NEVER break article rendering. If the error
 * reporter itself throws, it is silently caught so the user still gets
 * a page.
 */
import { logger } from "./logger";
/** High-level error categories. */
export type ErrorCategory =
  | "content_not_found"
  | "content_invalid"
  | "content_parse_error"
  | "git_provider_error"
  | "search_error"
  | "network_error"
  | "server_error"
  | "unknown";
/** Severity levels for error reporting. */
export type ErrorSeverity = "low" | "medium" | "high" | "critical";
/** Structured error context for reporting. */
export interface ErrorContext {
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  /** User-safe message (no stack traces or secrets). */
  userMessage: string;
  requestId?: string;
  /** Additional structured metadata. */
  meta?: Record<string, unknown>;
  /** Original error (for stack trace extraction). */
  cause?: unknown;
}
/**
 * Error reporter interface — the adapter boundary for external
 * error-tracking services.
 *
 * Implement this and call `setErrorReporter()` to integrate Sentry,
 * Datadog, Bugsnag, etc. without changing call sites.
 */
export interface ErrorReporter {
  /** Report an error with context. Must never throw. */
  report(ctx: ErrorContext): void;
}
/** No-op reporter (default). Silently does nothing. */
const noopReporter: ErrorReporter = {
  report() {},
};
let activeReporter: ErrorReporter = noopReporter;
/** Set the active error reporter (e.g. Sentry adapter). */
export function setErrorReporter(reporter: ErrorReporter): void {
  activeReporter = reporter;
}
/** Reset to the no-op reporter (used in tests). */
export function resetErrorReporter(): void {
  activeReporter = noopReporter;
}
/**
 * Classify an unknown error into a structured context.
 *
 * Inspects the error's type and properties to determine category and
 * severity. Known error types (GitProviderError, ContentError, etc.)
 * are classified precisely; unknown errors default to "unknown".
 */
export function classifyError(error: unknown): ErrorContext {
  // Already a structured error with kind info
  if (error && typeof error === "object" && "kind" in error) {
    const kind = (error as { kind: string }).kind;
    const message = (error as unknown as Error).message ?? String(error);
    if (kind === "not_found" || kind === "content_not_found") {
      return {
        category: "content_not_found",
        severity: "low",
        message,
        userMessage: "The requested content could not be found.",
        cause: error,
      };
    }
    if (kind === "content_unavailable") {
      return {
        category: "network_error",
        severity: "high",
        message,
        userMessage: "Content is temporarily unavailable. Please try again later.",
        cause: error,
      };
    }
    if (kind === "content_invalid") {
      return {
        category: "content_invalid",
        severity: "medium",
        message,
        userMessage: "The content could not be displayed due to a formatting issue.",
        cause: error,
      };
    }
    if (kind === "content_parse_error") {
      return {
        category: "content_parse_error",
        severity: "medium",
        message,
        userMessage: "The content could not be processed.",
        cause: error,
      };
    }
    if (kind === "rate_limited" || kind === "unauthorized") {
      return {
        category: "git_provider_error",
        severity: "high",
        message,
        userMessage: "The content service is temporarily unavailable.",
        cause: error,
      };
    }
    if (kind === "network_error" || kind === "server_error") {
      return {
        category: "network_error",
        severity: "high",
        message,
        userMessage: "A network error occurred. Please try again.",
        cause: error,
      };
    }
  }
  // Content validation errors (message contains "frontmatter" or "slug")
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("frontmatter") ||
      msg.includes("invalid category") ||
      msg.includes("invalid tag")
    ) {
      return {
        category: "content_invalid",
        severity: "medium",
        message: error.message,
        userMessage: "The content could not be displayed due to a formatting issue.",
        cause: error,
      };
    }
    if (msg.includes("parse") || msg.includes("yaml")) {
      return {
        category: "content_parse_error",
        severity: "medium",
        message: error.message,
        userMessage: "The content could not be processed.",
        cause: error,
      };
    }
  }
  return {
    category: "unknown",
    severity: "medium",
    message: error instanceof Error ? error.message : String(error),
    userMessage: "An unexpected error occurred. Please try again.",
    cause: error,
  };
}
/**
 * Report an error to the active reporter and log it.
 *
 * This is the main entry point for error handling. It:
 * 1. Classifies the error.
 * 2. Logs it with structured context.
 * 3. Reports to the external error-tracking service (if configured).
 * 4. Never throws — if the reporter fails, the error is swallowed.
 *
 * Returns the user-safe message for display.
 */
export function reportError(
  error: unknown,
  requestId?: string,
  meta?: Record<string, unknown>,
): string {
  const ctx = classifyError(error);
  if (requestId) ctx.requestId = requestId;
  if (meta) ctx.meta = { ...ctx.meta, ...meta };
  // Log with structured context.
  logger.error(ctx.message, {
    category: ctx.category,
    severity: ctx.severity,
    requestId: ctx.requestId,
    ...ctx.meta,
    stack: error instanceof Error ? error.stack : undefined,
  });
  // Report to external service — never let this throw.
  try {
    activeReporter.report(ctx);
  } catch {
    // Swallow — the error reporter must never break rendering.
    logger.warn("Error reporter threw — swallowing.", {
      reporterError: Error("reporter failed").message,
    });
  }
  return ctx.userMessage;
}
/**
 * Get a user-safe error message without reporting.
 *
 * Use this when you only need the display message (e.g. in a catch block
 * that has already been reported).
 */
export function safeErrorMessage(error: unknown): string {
  return classifyError(error).userMessage;
}
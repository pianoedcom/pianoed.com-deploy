/**
 * Tests for the observability layer: error classification, reporting,
 * and structured logging.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  reportError,
  classifyError,
  safeErrorMessage,
  setErrorReporter,
  resetErrorReporter,
  setLogSink,
  resetLogSink,
  createLogger,
  type ErrorReporter,
  type LogEntry,
} from "@/lib/observability";
import {
  ContentNotFoundError,
  ContentValidationError,
  ContentParseError,
  ContentUnavailableError,
} from "@/lib/content/errors";
import { GitProviderError } from "@/lib/content/git/types";
describe("classifyError", () => {
  it("classifies GitProviderError not_found as content_not_found", () => {
    const err = new GitProviderError("not_found", "Resource not found.");
    const ctx = classifyError(err);
    expect(ctx.category).toBe("content_not_found");
    expect(ctx.severity).toBe("low");
  });
  it("classifies GitProviderError rate_limited as git_provider_error", () => {
    const err = new GitProviderError("rate_limited", "Rate limit exceeded.");
    const ctx = classifyError(err);
    expect(ctx.category).toBe("git_provider_error");
    expect(ctx.severity).toBe("high");
  });
  it("classifies GitProviderError network_error as network_error", () => {
    const err = new GitProviderError("network_error", "Request timed out.");
    const ctx = classifyError(err);
    expect(ctx.category).toBe("network_error");
    expect(ctx.severity).toBe("high");
  });
  it("classifies ContentNotFoundError as content_not_found", () => {
    const err = new ContentNotFoundError("Article", "missing-slug");
    const ctx = classifyError(err);
    expect(ctx.category).toBe("content_not_found");
    expect(ctx.severity).toBe("low");
  });
  it("classifies ContentValidationError as content_invalid", () => {
    const err = new ContentValidationError(
      "Invalid category 'foo' in post.mdx",
      "post.mdx",
      "category",
    );
    const ctx = classifyError(err);
    expect(ctx.category).toBe("content_invalid");
  });
  it("classifies ContentParseError as content_parse_error", () => {
    const err = new ContentParseError("Missing frontmatter block.", "unknown");
    const ctx = classifyError(err);
    expect(ctx.category).toBe("content_parse_error");
  });
  it("classifies ContentUnavailableError as network_error", () => {
    const err = new ContentUnavailableError("Git provider error: timeout", {
      retryable: true,
    });
    const ctx = classifyError(err);
    expect(ctx.category).toBe("network_error");
    expect(ctx.severity).toBe("high");
  });
  it("classifies generic Error with 'frontmatter' in message as content_invalid", () => {
    const err = new Error("Error validating frontmatter: missing title");
    const ctx = classifyError(err);
    expect(ctx.category).toBe("content_invalid");
  });
  it("classifies unknown errors as unknown", () => {
    const err = new Error("Something broke");
    const ctx = classifyError(err);
    expect(ctx.category).toBe("unknown");
    expect(ctx.severity).toBe("medium");
  });
  it("provides user-safe messages without internal details", () => {
    const err = new ContentValidationError(
      "Invalid category 'foo' in /content/posts/bad.mdx",
      "/content/posts/bad.mdx",
      "category",
    );
    const ctx = classifyError(err);
    expect(ctx.userMessage).not.toContain("/content/posts/bad.mdx");
    expect(ctx.userMessage).not.toContain("foo");
  });
});
describe("reportError", () => {
  let loggedEntries: LogEntry[];
  let reportedContexts: ReturnType<typeof classifyError>[];
  beforeEach(() => {
    loggedEntries = [];
    reportedContexts = [];
    setLogSink((entry) => loggedEntries.push(entry));
    const reporter: ErrorReporter = {
      report: (ctx) => reportedContexts.push(ctx),
    };
    setErrorReporter(reporter);
  });
  it("logs and reports errors, returns user-safe message", () => {
    const err = new Error("Test error");
    const userMsg = reportError(err, "req-123", { boundary: "test" });
    expect(userMsg).toBe("An unexpected error occurred. Please try again.");
    expect(loggedEntries).toHaveLength(1);
    expect(loggedEntries[0].level).toBe("error");
    expect(loggedEntries[0].requestId).toBe("req-123");
    expect(reportedContexts).toHaveLength(1);
    expect(reportedContexts[0].category).toBe("unknown");
  });
  it("never exposes stack traces in user message", () => {
    const err = new Error("Secret: password123");
    const userMsg = reportError(err);
    expect(userMsg).not.toContain("password123");
  });
  it("swallows reporter failures gracefully", () => {
    const failingReporter: ErrorReporter = {
      report: () => {
        throw new Error("Reporter crashed");
      },
    };
    setErrorReporter(failingReporter);
    expect(() => reportError(new Error("test"))).not.toThrow();
  });
  afterEach(() => {
    resetLogSink();
    resetErrorReporter();
  });
});
describe("safeErrorMessage", () => {
  it("returns user-safe message without reporting", () => {
    const err = new ContentNotFoundError("Article", "missing");
    const msg = safeErrorMessage(err);
    expect(msg).toBe("The requested article could not be found.");
  });
});
describe("logger", () => {
  let entries: LogEntry[];
  beforeEach(() => {
    entries = [];
    setLogSink((entry) => entries.push(entry));
  });
  it("emits structured JSON log entries", () => {
    const log = createLogger("req-456");
    log.info("Test message", { count: 42 });
    expect(entries).toHaveLength(1);
    expect(entries[0].message).toBe("Test message");
    expect(entries[0].level).toBe("info");
    expect(entries[0].requestId).toBe("req-456");
    expect(entries[0].count).toBe(42);
    expect(entries[0].timestamp).toBeTruthy();
  });
  it("redacts sensitive keys from metadata", () => {
    const log = createLogger();
    log.info("Auth event", {
      token: "secret-token-123",
      password: "hidden",
      userId: 42,
    });
    expect(entries[0].token).toBe("[redacted]");
    expect(entries[0].password).toBe("[redacted]");
    expect(entries[0].userId).toBe(42);
  });
  afterEach(() => {
    resetLogSink();
  });
});
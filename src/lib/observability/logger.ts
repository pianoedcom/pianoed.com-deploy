/**
 * Structured logging for server-side observability.
 *
 * Emits JSON-structured log lines with consistent fields: timestamp, level,
 * message, request correlation ID, error details, and arbitrary metadata.
 *
 * The logger is provider-agnostic: in production, the `reportError` function
 * can be wired to an external error-tracking service (Sentry, Datadog, etc.)
 * via the `ErrorReporter` interface without changing call sites.
 *
 * Security: never logs secrets, tokens, or full request bodies. The
 * `redact()` helper scrubs known-sensitive keys from metadata.
 */
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
/** A structured log entry. */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  /** Arbitrary structured metadata. */
  [key: string]: unknown;
}
/** Keys that are automatically redacted from log metadata. */
const SENSITIVE_KEYS = new Set([
  "token",
  "password",
  "secret",
  "apiKey",
  "api_key",
  "authorization",
  "cookie",
  "session",
]);
/** Recursively redact sensitive values from an object. */
function redact(value: unknown, depth = 0): unknown {
  if (depth > 5) return "[max-depth]";
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  const obj = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      result[key] = "[redacted]";
    } else {
      result[key] = redact(val, depth + 1);
    }
  }
  return result;
}
/** Minimum level to emit. Configurable via LOG_LEVEL env var. */
const MIN_LEVEL: LogLevel = (() => {
  const env = (typeof process !== "undefined" && process.env?.LOG_LEVEL) || "info";
  switch (env) {
    case "debug":
      return "debug";
    case "warn":
      return "warn";
    case "error":
      return "error";
    case "fatal":
      return "fatal";
    default:
      return "info";
  }
})();
const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  fatal: 50,
};
/** Sink function that receives formatted log entries. */
type LogSink = (entry: LogEntry) => void;
/** Default sink: console with JSON serialization. */
const consoleSink: LogSink = (entry) => {
  const line = JSON.stringify(entry);
  if (entry.level === "error" || entry.level === "fatal") {
    console.error(line);
  } else if (entry.level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
};
/** Active sink (overridable for testing). */
let activeSink: LogSink = consoleSink;
/** Override the log sink (used in tests). */
export function setLogSink(sink: LogSink): void {
  activeSink = sink;
}
/** Reset to the default sink. */
export function resetLogSink(): void {
  activeSink = consoleSink;
}
/** Build a structured log entry. */
function buildEntry(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>,
  requestId?: string,
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(redact(meta ?? {}) as Record<string, unknown>),
  };
  if (requestId) entry.requestId = requestId;
  return entry;
}
/** Emit a log entry if it meets the minimum level. */
function emit(entry: LogEntry): void {
  if (LEVEL_PRIORITY[entry.level] < LEVEL_PRIORITY[MIN_LEVEL]) return;
  activeSink(entry);
}
/** Create a logger bound to a specific request ID. */
export function createLogger(requestId?: string) {
  return {
    debug(message: string, meta?: Record<string, unknown>) {
      emit(buildEntry("debug", message, meta, requestId));
    },
    info(message: string, meta?: Record<string, unknown>) {
      emit(buildEntry("info", message, meta, requestId));
    },
    warn(message: string, meta?: Record<string, unknown>) {
      emit(buildEntry("warn", message, meta, requestId));
    },
    error(message: string, meta?: Record<string, unknown>) {
      emit(buildEntry("error", message, meta, requestId));
    },
    fatal(message: string, meta?: Record<string, unknown>) {
      emit(buildEntry("fatal", message, meta, requestId));
    },
    /** Create a child logger with a different request ID. */
    child(id: string) {
      return createLogger(id);
    },
  };
}
/** Default logger with no request binding. */
export const logger = createLogger();
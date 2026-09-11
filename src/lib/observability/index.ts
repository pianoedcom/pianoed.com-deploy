/**
 * Observability public API.
 *
 * Re-exports the logger, request-ID utilities, error classification, and
 * the error-reporter adapter boundary.
 */
export { logger, createLogger, setLogSink, resetLogSink } from "./logger";
export type { LogLevel, LogEntry } from "./logger";
export {
  generateRequestId,
  getRequestId,
  requestIdFromHeaders,
  REQUEST_ID_HEADER,
} from "./request-id";
export {
  reportError,
  classifyError,
  safeErrorMessage,
  setErrorReporter,
  resetErrorReporter,
} from "./errors";
export type { ErrorCategory, ErrorSeverity, ErrorContext, ErrorReporter } from "./errors";
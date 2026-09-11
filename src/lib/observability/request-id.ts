/**
 * Request correlation IDs.
 *
 * Generates unique IDs for correlating logs and errors across a single
 * request lifecycle. In a serverless/edge context, the ID is generated
 * per invocation. In a long-running server, it can be propagated via
 * AsyncLocalStorage (not available in all runtimes).
 *
 * The ID uses `crypto.randomUUID()` when available, falling back to a
 * timestamp+random combination.
 */
/** Header name for propagating request IDs. */
export const REQUEST_ID_HEADER = "x-request-id";
/** Generate a unique request ID. */
export function generateRequestId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
/**
 * Get or create a request ID for the current context.
 *
 * In a browser/SPA context, this generates a per-call ID since there's
 * no server-side request lifecycle. In a server context, callers should
 * pass the ID from the request header or generate one per invocation.
 */
export function getRequestId(explicit?: string | null): string {
  if (explicit) return explicit;
  return generateRequestId();
}
/**
 * Extract a request ID from incoming request headers (server-side).
 *
 * Falls back to generating a new ID if none is present.
 */
export function requestIdFromHeaders(headers: Headers): string {
  const existing = headers.get(REQUEST_ID_HEADER);
  if (existing && existing.length <= 128) return existing;
  return generateRequestId();
}
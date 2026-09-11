/**
 * Webhook handler orchestration.
 *
 * This module contains the pure logic for processing a verified GitHub push
 * event. It is separated from the HTTP route so it can be tested without
 * HTTP mocking and reused in different deployment contexts.
 *
 * Flow:
 *   1. Verify the webhook signature (done by the route, using security/webhook).
 *   2. Parse and validate the payload.
 *   3. Check the event type (only "push" triggers content revalidation).
 *   4. Run the change detector to identify content-relevant file changes.
 *   5. If no content changes, return "no relevant changes".
 *   6. Invoke the revalidation dispatcher to invalidate targeted cache tags.
 *   7. Return a structured result.
 *
 * Idempotency: duplicate webhook deliveries are handled safely because cache
 * invalidation is idempotent — invalidating an already-evicted tag is a no-op.
 */
import { detectChangesFromCommits, type ContentChangeSet } from "./change-detector";
import { revalidateContent, type RevalidationResult } from "@/lib/cache/revalidate-content";
import { reloadRedirects } from "./redirects";
/** The GitHub event types we recognize. */
export type GitHubEventType = "push" | "ping" | "unknown";
/** Standardized webhook response contract. */
export interface WebhookResponse {
  /** HTTP status code. */
  status: number;
  /** Machine-readable outcome. */
  ok: boolean;
  /** Human-readable message. */
  message: string;
  /** The event type that was processed. */
  event?: string;
  /** The delivery ID from GitHub. */
  deliveryId?: string;
  /** The change set, if content changes were detected. */
  changes?: ContentChangeSet;
  /** The revalidation result, if invalidation was performed. */
  result?: RevalidationResult;
}
/** Minimal shape of a GitHub push event payload. */
interface PushEventPayload {
  ref?: string;
  commits?: Array<{
    id: string;
    added?: string[];
    modified?: string[];
    removed?: string[];
  }>;
  head_commit?: {
    id: string;
  };
}
/**
 * Parse and validate a raw JSON body as a GitHub push event payload.
 *
 * Returns a typed result: either the parsed payload or a malformed-payload
 * error.
 */
export function parsePushPayload(
  rawBody: string,
): { ok: true; payload: PushEventPayload } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return { ok: false, error: "Request body is not valid JSON." };
  }
  if (typeof parsed !== "object" || parsed === null) {
    return { ok: false, error: "Request body is not a JSON object." };
  }
  const obj = parsed as Record<string, unknown>;
  if (!("commits" in obj) && !("head_commit" in obj)) {
    return { ok: false, error: "Payload does not look like a push event (missing commits)." };
  }
  return { ok: true, payload: obj as PushEventPayload };
}
/**
 * Classify the GitHub event type from the event header.
 */
export function classifyEvent(eventHeader: string | null | undefined): GitHubEventType {
  if (!eventHeader) return "unknown";
  if (eventHeader === "push") return "push";
  if (eventHeader === "ping") return "ping";
  return "unknown";
}
/**
 * Process a verified GitHub webhook.
 *
 * This function assumes the signature has already been verified by the
 * caller (the HTTP route). It handles the remaining logic:
 *   - Event type filtering (only "push" triggers revalidation)
 *   - Payload parsing
 *   - Change detection
 *   - Targeted cache invalidation
 *
 * @param event      - The GitHub event type (from `X-GitHub-Event`).
 * @param deliveryId - The GitHub delivery ID (from `X-GitHub-Delivery`).
 * @param rawBody    - The raw request body.
 * @param contentPath - The configured content root path.
 */
export function processWebhook(
  event: GitHubEventType,
  deliveryId: string | null,
  rawBody: string,
  contentPath: string,
): WebhookResponse {
  const base = { event, deliveryId: deliveryId ?? undefined };
  // Handle ping events (GitHub sends these when a webhook is first configured).
  if (event === "ping") {
    return {
      ...base,
      status: 200,
      ok: true,
      message: "Ping received. Webhook is configured correctly.",
    };
  }
  // Only push events trigger content revalidation.
  if (event !== "push") {
    return {
      ...base,
      status: 200,
      ok: true,
      message: `Event type "${event}" is not handled. Ignored.`,
    };
  }
  // Parse the payload.
  const parsedResult = parsePushPayload(rawBody);
  if (parsedResult.ok === false) {
    return {
      ...base,
      status: 400,
      ok: false,
      message: `Malformed payload: ${parsedResult.error}`,
    };
  }
  const payload = parsedResult.payload;
  // If there are no commits (e.g. a branch deletion), nothing to do.
  if (!payload.commits || payload.commits.length === 0) {
    return {
      ...base,
      status: 200,
      ok: true,
      message: "Push event has no commits. Ignored.",
    };
  }
  // Detect content-relevant changes.
  const changes = detectChangesFromCommits(payload.commits, contentPath);
  if (!changes.hasContentChanges) {
    return {
      ...base,
      status: 200,
      ok: true,
      message: "No relevant content changes in this push. Ignored.",
      changes,
    };
  }
  // Perform targeted cache invalidation and reload redirects.
  try {
    const result = revalidateContent(changes);
    // Reload the static redirect table in case redirects.json was updated.
    reloadRedirects();
    return {
      ...base,
      status: 200,
      ok: true,
      message: `Processed ${payload.commits.length} commit(s). Invalidated ${result.invalidatedSlugs.length} slug(s) and ${result.invalidatedTags.length} tag(s).`,
      changes,
      result,
    };
  } catch (err) {
    return {
      ...base,
      status: 500,
      ok: false,
      message: `Processing failure: ${(err as Error).message}`,
      changes,
    };
  }
}
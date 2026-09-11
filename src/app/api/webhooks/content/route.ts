/**
 * Webhook API route — content revalidation endpoint.
 *
 * In a Next.js deployment this would be an App Router route handler at
 * `src/app/api/webhooks/content/route.ts` exporting `POST`. In this Vite SPA
 * environment, we export the handler logic so it can be wired to a serverless
 * function or edge handler. The route component below provides a debug UI
 * showing webhook configuration and recent deliveries.
 *
 * Security:
 *   - Signature verification is mandatory. Requests without a valid
 *     `X-Hub-Signature-256` header are rejected with 401.
 *   - The webhook secret is read from a server-only environment variable
 *     (`CONTENT_WEBHOOK_SECRET`) and never exposed to the browser.
 *   - Only "push" events trigger content revalidation. "ping" events are
 *     acknowledged but do nothing.
 *   - Cache tags are computed deterministically from changed slugs — the
 *     caller cannot inject arbitrary tags.
 *
 * Response contract:
 *   200 — accepted / ignored / no relevant changes / successful invalidation
 *   400 — malformed payload
 *   401 — invalid signature
 *   500 — processing failure
 */
import {
  verifyGitHubSignature,
  GITHUB_SIGNATURE_HEADER,
  GITHUB_EVENT_HEADER,
  GITHUB_DELIVERY_HEADER,
  rateLimiters,
  getClientIp,
  validateContentType,
} from "@/lib/security";
import { processWebhook, classifyEvent } from "@/lib/content/webhook";
import type { WebhookResponse } from "@/lib/content/webhook";
import { siteConfig } from "@/lib/site-config";
import { reportError, requestIdFromHeaders } from "@/lib/observability";
/**
 * Server-side webhook handler.
 *
 * Call this from your serverless function / edge handler with the raw request
 * body and headers. It verifies the signature, parses the payload, detects
 * content changes, and performs targeted cache invalidation.
 *
 * @param rawBody    - The raw request body as a string.
 * @param headers    - A record of request headers (case-insensitive lookup).
 * @param secret     - The webhook secret from environment variables.
 * @param contentPath - The content root path (defaults to site config).
 */
export async function handleContentWebhook(
  rawBody: string,
  headers: Record<string, string | null | undefined>,
  secret: string,
  contentPath?: string,
): Promise<WebhookResponse> {
  // --- Rate limiting (per-IP) --------------------------------------------
  const headerObj = new Headers(
    Object.entries(headers).filter(([, v]) => v != null) as [string, string][],
  );
  const clientIp = getClientIp(headerObj);
  const rateLimitResult = rateLimiters.webhook.check(clientIp);
  if (!rateLimitResult.allowed) {
    return {
      status: 429,
      ok: false,
      message: "Too many webhook requests. Please retry later.",
    };
  }
  // --- Content type validation --------------------------------------------
  const contentType = headerObj.get("content-type");
  if (!validateContentType(contentType, "application/json")) {
    return {
      status: 400,
      ok: false,
      message: "Content-Type must be application/json.",
    };
  }
  // --- Raw body size constraint ------------------------------------------
  if (rawBody.length > 10_000_000) {
    return {
      status: 413,
      ok: false,
      message: "Webhook payload too large.",
    };
  }
  // --- Signature verification (mandatory) --------------------------------
  const signature =
    headers[GITHUB_SIGNATURE_HEADER] ?? headers[GITHUB_SIGNATURE_HEADER.toLowerCase()];
  const isValid = await verifyGitHubSignature(signature, secret, rawBody);
  if (!isValid) {
    return {
      status: 401,
      ok: false,
      message: "Invalid or missing webhook signature.",
    };
  }
  // --- Event classification ------------------------------------------------
  const eventHeader = headers[GITHUB_EVENT_HEADER] ?? headers[GITHUB_EVENT_HEADER.toLowerCase()];
  const deliveryHeader =
    headers[GITHUB_DELIVERY_HEADER] ?? headers[GITHUB_DELIVERY_HEADER.toLowerCase()];
  const event = classifyEvent(eventHeader as string);
  // --- Process -------------------------------------------------------------
  const root = contentPath ?? siteConfig.content.path;
  const requestId = requestIdFromHeaders(
    new Headers(Object.entries(headers).filter(([, v]) => v != null) as [string, string][]),
  );
  try {
    return await processWebhook(event, deliveryHeader as string, rawBody, root);
  } catch (err) {
    reportError(err, requestId, { boundary: "webhook" });
    return {
      status: 500,
      ok: false,
      message: "Webhook processing failed.",
    };
  }
}
/**
 * Helper to convert a WebhookResponse to a standard Response (for serverless).
 */
export function webhookResponseToResponse(res: WebhookResponse): Response {
  return new Response(JSON.stringify(res), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
/**
 * Webhook security utilities.
 *
 * GitHub secures webhook deliveries with a HMAC-SHA256 signature sent in the
 * `X-Hub-Signature-256` header. The signature is computed over the raw request
 * body using the webhook secret configured on the GitHub repository settings.
 *
 * Security principles:
 *   - Never trust a payload without verifying its signature.
 *   - Never accept an arbitrary cache tag from a public caller.
 *   - Never allow the endpoint to invalidate arbitrary application caches.
 *   - Use a timing-safe comparison to prevent signature oracle attacks.
 *   - The secret is stored in a server-only environment variable.
 */
/** Header name for the GitHub HMAC-SHA256 signature. */
export const GITHUB_SIGNATURE_HEADER = "X-Hub-Signature-256";
/** Header name for the GitHub event type (push, ping, etc.). */
export const GITHUB_EVENT_HEADER = "X-GitHub-Event";
/** Header name for the GitHub delivery ID (unique per delivery). */
export const GITHUB_DELIVERY_HEADER = "X-GitHub-Delivery";
/**
 * Compute the expected HMAC-SHA256 signature for a raw request body.
 *
 * Returns the signature in GitHub's format: `sha256=<hex>`.
 */
export async function computeSignature(secret: string, rawBody: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const hex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `sha256=${hex}`;
}
/**
 * Timing-safe comparison of two hex strings.
 *
 * Compares every byte regardless of where the first difference occurs,
 * preventing timing-based signature oracle attacks.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
/**
 * Verify a GitHub webhook signature.
 *
 * @param signature - The value of the `X-Hub-Signature-256` header.
 * @param secret    - The webhook secret from environment variables.
 * @param rawBody   - The raw request body (must be the exact bytes received).
 * @returns `true` if the signature is valid, `false` otherwise.
 */
export async function verifyGitHubSignature(
  signature: string | null | undefined,
  secret: string,
  rawBody: string,
): Promise<boolean> {
  if (!signature || !secret) return false;
  const expected = await computeSignature(secret, rawBody);
  return timingSafeEqual(signature, expected);
}
/**
 * Newsletter subscription API route.
 *
 * This serverless function handles newsletter subscriptions server-side
 * so API keys are never exposed to the browser. The client posts to
 * /api/newsletter and this route forwards the request to the configured
 * provider using server-only environment variables (no VITE_ prefix).
 *
 * Supported providers: buttondown, convertkit, resend, mailchimp
 *
 * Environment variables (server-only):
 *   NEWSLETTER_PROVIDER   — "buttondown" | "convertkit" | "resend" | "mailchimp"
 *   NEWSLETTER_API_KEY    — Provider API key
 *   NEWSLETTER_FORM_ID     — ConvertKit form ID (convertkit only)
 *   NEWSLETTER_AUDIENCE_ID — Resend audience ID (resend only)
 *   NEWSLETTER_LIST_ID     — Mailchimp list ID (mailchimp only)
 *   NEWSLETTER_DC          — Mailchimp data center (mailchimp only)
 */
import { z } from "zod";
import { rateLimiters, getClientIp } from "@/lib/security/rate-limit";
const newsletterSchema = z.object({
  email: z.string().email(),
});
interface SubscribeResult {
  success: boolean;
  error?: string;
}
async function subscribeToProvider(
  provider: string,
  apiKey: string,
  email: string,
): Promise<SubscribeResult> {
  try {
    switch (provider.toLowerCase()) {
      case "buttondown": {
        const res = await fetch("https://api.buttondown.com/api/v1/subscribers", {
          method: "POST",
          headers: {
            Authorization: `Token ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });
        return res.ok ? { success: true } : { success: false, error: "Subscription failed." };
      }
      case "convertkit": {
        const formId = process.env.NEWSLETTER_FORM_ID;
        if (!formId) return { success: false, error: "Not configured." };
        const res = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ api_key: apiKey, email }),
        });
        return res.ok ? { success: true } : { success: false, error: "Subscription failed." };
      }
      case "resend": {
        const audienceId = process.env.NEWSLETTER_AUDIENCE_ID;
        if (!audienceId) return { success: false, error: "Not configured." };
        const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });
        return res.ok ? { success: true } : { success: false, error: "Subscription failed." };
      }
      case "mailchimp": {
        const listId = process.env.NEWSLETTER_LIST_ID;
        const dc = process.env.NEWSLETTER_DC;
        if (!listId || !dc) return { success: false, error: "Not configured." };
        const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`anystring:${apiKey}`)}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email_address: email, status: "subscribed" }),
        });
        return res.ok ? { success: true } : { success: false, error: "Subscription failed." };
      }
      default:
        return { success: false, error: "Unknown provider." };
    }
  } catch {
    return { success: false, error: "Network error." };
  }
}
export async function POST(request: Request): Promise<Response> {
  try {
    // Rate limit: 5 requests per minute per IP
    const ip = getClientIp(request.headers);
    const rateLimitResult = rateLimiters.newsletter.check(`newsletter:${ip}`);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ success: false, error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(rateLimitResult.retryAfterMs / 1000)),
          },
        },
      );
    }
    const body = (await request.json()) as unknown;
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ success: false, error: "Invalid email address." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { email } = parsed.data;
    const provider = process.env.NEWSLETTER_PROVIDER;
    const apiKey = process.env.NEWSLETTER_API_KEY;
    if (!provider || !apiKey) {
      return new Response(JSON.stringify({ success: false, error: "Newsletter not configured." }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }
    const result = await subscribeToProvider(provider, apiKey, email);
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, error: "Server error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
/**
 * Newsletter provider abstraction.
 *
 * Supports multiple newsletter services (Buttondown, ConvertKit, Resend,
 * Mailchimp) via a unified interface. The provider is selected via
 * `VITE_NEWSLETTER_PROVIDER` and configured with provider-specific env vars.
 *
 * If no provider is configured, `getNewsletterProvider()` returns `null`,
 * and the UI should show a "coming soon" message instead of simulating
 * success.
 */
export interface NewsletterSubscribeResult {
  success: boolean;
  error?: string;
}
export interface NewsletterProvider {
  readonly id: string;
  subscribe(email: string): Promise<NewsletterSubscribeResult>;
}
/**
 * Get the configured newsletter provider, or null if none is configured.
 *
 * Reads from client-safe env vars (VITE_ prefix only).
 */
export function getNewsletterProvider(): NewsletterProvider | null {
  const providerType = import.meta.env.VITE_NEWSLETTER_PROVIDER ?? "";
  switch (providerType.toLowerCase()) {
    case "buttondown":
      return createButtondownProvider();
    case "convertkit":
      return createConvertKitProvider();
    case "resend":
      return createResendProvider();
    case "mailchimp":
      return createMailchimpProvider();
    default:
      return null;
  }
}
// --- Buttondown ---------------------------------------------------------------
function createButtondownProvider(): NewsletterProvider | null {
  const apiKey = import.meta.env.VITE_NEWSLETTER_API_KEY;
  if (!apiKey) return null;
  return {
    id: "buttondown",
    async subscribe(email) {
      try {
        const res = await fetch("https://api.buttondown.com/api/v1/subscribers", {
          method: "POST",
          headers: {
            Authorization: `Token ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) {
          return { success: false, error: "Subscription failed. Please try again." };
        }
        return { success: true };
      } catch {
        return { success: false, error: "Network error. Please try again." };
      }
    },
  };
}
// --- ConvertKit ---------------------------------------------------------------
function createConvertKitProvider(): NewsletterProvider | null {
  const apiKey = import.meta.env.VITE_NEWSLETTER_API_KEY;
  const formId = import.meta.env.VITE_NEWSLETTER_FORM_ID;
  if (!apiKey || !formId) return null;
  return {
    id: "convertkit",
    async subscribe(email) {
      try {
        const res = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ api_key: apiKey, email }),
        });
        if (!res.ok) {
          return { success: false, error: "Subscription failed. Please try again." };
        }
        return { success: true };
      } catch {
        return { success: false, error: "Network error. Please try again." };
      }
    },
  };
}
// --- Resend -------------------------------------------------------------------
function createResendProvider(): NewsletterProvider | null {
  const apiKey = import.meta.env.VITE_NEWSLETTER_API_KEY;
  const audienceId = import.meta.env.VITE_NEWSLETTER_AUDIENCE_ID;
  if (!apiKey || !audienceId) return null;
  return {
    id: "resend",
    async subscribe(email) {
      try {
        const res = await fetch("https://api.resend.com/audiences/" + audienceId + "/contacts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) {
          return { success: false, error: "Subscription failed. Please try again." };
        }
        return { success: true };
      } catch {
        return { success: false, error: "Network error. Please try again." };
      }
    },
  };
}
// --- Mailchimp ----------------------------------------------------------------
function createMailchimpProvider(): NewsletterProvider | null {
  const apiKey = import.meta.env.VITE_NEWSLETTER_API_KEY;
  const listId = import.meta.env.VITE_NEWSLETTER_LIST_ID;
  const dataCenter = import.meta.env.VITE_NEWSLETTER_DC;
  if (!apiKey || !listId || !dataCenter) return null;
  return {
    id: "mailchimp",
    async subscribe(email) {
      try {
        const res = await fetch(
          `https://${dataCenter}.api.mailchimp.com/3.0/lists/${listId}/members`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${btoa(`anystring:${apiKey}`)}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email_address: email, status: "subscribed" }),
          },
        );
        if (!res.ok) {
          return { success: false, error: "Subscription failed. Please try again." };
        }
        return { success: true };
      } catch {
        return { success: false, error: "Network error. Please try again." };
      }
    },
  };
}
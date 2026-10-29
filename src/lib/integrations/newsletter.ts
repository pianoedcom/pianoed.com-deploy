/**
 * Newsletter provider abstraction.
 *
 * Supports multiple newsletter services (Google Apps Script Webhook,
 * Buttondown, ConvertKit, Resend, Mailchimp) via a unified interface.
 */

export interface SubscribeOptions {
  email: string;
  placement?: string;
}

export interface SubscribeResponse {
  success: boolean;
  message?: string;
  alreadySubscribed?: boolean;
  error?: string;
}

export interface NewsletterSubscribeResult {
  success: boolean;
  error?: string;
}

export interface NewsletterProvider {
  readonly id: string;
  subscribe(email: string): Promise<NewsletterSubscribeResult>;
}

/**
 * Subscribes an email to the Google Apps Script webhook endpoint.
 * Uses text/plain transport to avoid CORS preflight (OPTIONS) rejections.
 */
export async function subscribeToNewsletter(
  options: SubscribeOptions,
): Promise<SubscribeResponse> {
  const webhookUrl = import.meta.env.VITE_NEWSLETTER_WEBHOOK_URL;

  // If Google Apps Script webhook URL is present, prioritize it
  if (webhookUrl) {
    try {
      const payload = {
        email: options.email.trim().toLowerCase(),
        placement: options.placement || "website",
        referrer: typeof window !== "undefined" ? window.location.href : "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      };

      const res = await fetch(webhookUrl, {
        method: "POST",
        redirect: "follow",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();

      if (data.status === "success") {
        return {
          success: true,
          alreadySubscribed: !!data.alreadySubscribed,
          message: data.message || "Thanks for subscribing!",
        };
      } else {
        return {
          success: false,
          error: data.message || "Failed to subscribe. Please try again.",
          message: data.message || "Failed to subscribe. Please try again.",
        };
      }
    } catch (error: unknown) {
      console.error("Newsletter GAS webhook submission error:", error);
      return {
        success: false,
        error: "Could not complete subscription. Please try again later.",
        message: "Could not complete subscription. Please try again later.",
      };
    }
  }

  // Fallback to legacy configured provider if one exists
  const legacyProvider = getNewsletterProvider();
  if (legacyProvider) {
    const res = await legacyProvider.subscribe(options.email);
    return {
      success: res.success,
      error: res.error,
      message: res.success ? "Thanks for subscribing!" : res.error,
    };
  }

  // Fallback to server-side /api/newsletter route if available
  try {
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: options.email, placement: options.placement }),
    });
    const data = (await res.json()) as { success: boolean; error?: string };
    return {
      success: data.success,
      error: data.error,
      message: data.success ? "Thanks for subscribing!" : data.error,
    };
  } catch (error: unknown) {
    console.warn("Newsletter service is unconfigured or unreachable:", error);
    return {
      success: false,
      error: "Newsletter service is temporarily unavailable. Please try again later.",
      message: "Newsletter service is temporarily unavailable. Please try again later.",
    };
  }
}

/**
 * Get the configured newsletter provider, or null if none is configured.
 *
 * Reads from client-safe env vars (VITE_ prefix only).
 */
export function getNewsletterProvider(): NewsletterProvider | null {
  const gasWebhookUrl = import.meta.env.VITE_NEWSLETTER_WEBHOOK_URL;
  const providerType = (import.meta.env.VITE_NEWSLETTER_PROVIDER ?? "").toLowerCase();

  if (gasWebhookUrl || providerType === "google-apps-script" || providerType === "gas") {
    return {
      id: "google-apps-script",
      async subscribe(email: string) {
        const res = await subscribeToNewsletter({ email, placement: "provider-adapter" });
        return {
          success: res.success,
          error: res.error,
        };
      },
    };
  }

  switch (providerType) {
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
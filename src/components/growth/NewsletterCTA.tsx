import { useState, useCallback, type FormEvent } from "react";
import { track } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";
import { getNewsletterProvider } from "@/lib/integrations/newsletter";
interface NewsletterCTAProps {
  /** Placement identifier for analytics tracking. */
  placement?: "article-footer" | "homepage" | "sidebar" | "coming-soon";
  /** Optional heading override. */
  heading?: string;
  /** Optional description override. */
  description?: string;
  /** Compact mode for sidebar placement. */
  compact?: boolean;
}
/**
 * Newsletter call-to-action component.
 *
 * Captures an email address for newsletter signup. The form is
 * intentionally simple — just an email field and a submit button —
 * to minimize friction and maximize conversion.
 *
 * Analytics:
 *   - "newsletter_cta_click" when the form is focused/interacted with
 *   - "newsletter_signup" when the form is successfully submitted
 *
 * The actual subscription endpoint is wired via the form_tracking
 * integration. The form posts to the configured endpoint and shows
 * a success state. If no endpoint is configured, it shows a graceful
 * message.
 *
 * Accessibility:
 *   - Label is visually associated with the input via htmlFor
 *   - Error messages are announced via aria-live
 *   - Submit button has a clear label
 *   - Form is keyboard-navigable
 */
const NewsletterCTA = ({
  placement = "article-footer",
  heading,
  description,
  compact = false,
}: NewsletterCTAProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!email.trim()) return;
      setStatus("loading");
      setErrorMessage("");
      track("newsletter_cta_click", { placement });
      // Check if a client-side provider is configured (VITE_ env vars).
      // If not, fall back to the server-side API route.
      const provider = getNewsletterProvider();
      try {
        let result: { success: boolean; error?: string };
        if (provider) {
          result = await provider.subscribe(email);
        } else {
          // Use the server-side API route — no API keys in the browser
          const res = await fetch("/api/newsletter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          result = (await res.json()) as { success: boolean; error?: string };
        }
        if (result.success) {
          setStatus("success");
          track("newsletter_signup", { placement, url: siteConfig.url });
          setEmail("");
        } else {
          setStatus("error");
          setErrorMessage(result.error ?? "Something went wrong. Please try again.");
        }
      } catch {
        setStatus("error");
        setErrorMessage("Something went wrong. Please try again.");
      }
    },
    [email, placement],
  );
  if (status === "success") {
    return (
      <div
        className={`rounded-lg border border-border bg-card ${compact ? "p-5" : "p-8"}`}
        role="status"
        aria-live="polite"
      >
        <p className="font-serif text-lg font-semibold text-foreground">You're subscribed</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Thanks for joining. Watch your inbox for the next issue.
        </p>
      </div>
    );
  }
  return (
    <div className={`rounded-lg border border-border bg-card ${compact ? "p-5" : "p-8"}`}>
      <p className="eyebrow mb-2">Newsletter</p>
      <h2 className={`display-heading text-foreground ${compact ? "text-xl" : "text-2xl"}`}>
        {heading ?? "Join the PianoEd community."}
      </h2>
      <p className={`mt-2 text-muted-foreground ${compact ? "text-sm" : "text-base"}`}>
        {description ??
          "Get warm, practical piano insights — tips, stories, and resources — delivered to your inbox. No spam, just love for the instrument."}
      </p>
      <form onSubmit={handleSubmit} className="mt-5 space-y-3" noValidate>
        <div>
          <label htmlFor={`newsletter-email-${placement}`} className="sr-only">
            Email address
          </label>
          <input
            id={`newsletter-email-${placement}`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={status === "loading"}
            className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            aria-describedby={`newsletter-status-${placement}`}
            autoComplete="email"
          />
        </div>
        {errorMessage ? (
          <p
            id={`newsletter-status-${placement}`}
            role="alert"
            className="text-sm text-destructive"
          >
            {errorMessage}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
      <p className="mt-3 text-xs text-muted-foreground">
        Unsubscribe anytime. We respect your privacy.
      </p>
    </div>
  );
};
export default NewsletterCTA;
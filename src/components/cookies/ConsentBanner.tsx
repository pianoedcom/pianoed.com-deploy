import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useConsent } from "@/lib/cookies/use-consent";
import { cookieConfig } from "@/lib/config/cookies";
/**
 * Consent Banner — lightweight bottom banner shown on first visit.
 *
 * Offers Accept All, Reject Non-Essential, and Customize Preferences.
 * Only renders if the user hasn't made a decision yet and the consent
 * mode is opt-in (GDPR default). In notice-only mode, scripts load
 * immediately and the banner is informational.
 */
const ConsentBanner = () => {
  const { hasDecided, acceptAll, rejectNonEssential, openPreferences } = useConsent();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  // Don't render until mounted (avoids SSR mismatch)
  if (!mounted) return null;
  // If user already decided, don't show banner
  if (hasDecided) return null;
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] border-t border-border bg-card shadow-lg"
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
    >
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground">
            We use cookies to improve your experience and analyze site traffic. By clicking "Accept
            All", you consent to our use of cookies. See our{" "}
            <Link
              to={cookieConfig.policyUrl}
              className="font-medium text-accent underline underline-offset-2 hover:text-accent/80"
            >
              Cookie Policy
            </Link>
            .
          </p>
          <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={rejectNonEssential}
              className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Reject Non-Essential
            </button>
            <button
              type="button"
              onClick={openPreferences}
              className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Customize
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ConsentBanner;
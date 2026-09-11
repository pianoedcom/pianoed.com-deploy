import { useState, useEffect } from "react";
import { setAnalyticsConsent, ANALYTICS_CONSENT_STORAGE_KEY } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";
const STORAGE_KEY = ANALYTICS_CONSENT_STORAGE_KEY;
/**
 * Consent banner for analytics tracking.
 *
 * Shows a fixed bottom banner on first visit. The user can accept or decline.
 * Choice is stored in localStorage and respected on subsequent visits.
 */
const ConsentBanner = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "granted") {
        setAnalyticsConsent(true);
        return;
      }
      if (stored === "declined") {
        return;
      }
      // No prior choice — show banner
      setVisible(true);
    } catch {
      // localStorage unavailable
    }
  }, []);
  const handleAccept = () => {
    setAnalyticsConsent(true);
    try {
      localStorage.setItem(STORAGE_KEY, "granted");
    } catch {
      // ignore
    }
    setVisible(false);
  };
  const handleDecline = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "declined");
    } catch {
      // ignore
    }
    setVisible(false);
  };
  if (!visible) return null;
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card px-4 py-4 shadow-lg"
      role="dialog"
      aria-label="Analytics consent"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-foreground">
          We use anonymous analytics to improve {siteConfig.name}. No personal data is collected.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDecline}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};
export default ConsentBanner;
import type { ReactNode } from "react";
import { useEffect, lazy, Suspense } from "react";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import MainContent from "./MainContent";
import JsonLd from "@/components/seo/JsonLd";
import { websiteSchema, organizationSchema } from "@/lib/seo";
import Analytics from "@/components/analytics/Analytics";
import ConsentBanner from "@/components/cookies/ConsentBanner";
import CookieSettingsTrigger from "@/components/cookies/CookieSettingsTrigger";
import SlideInNewsletter from "@/components/growth/SlideInNewsletter";
import { initTagLoader, listenForConsentChanges } from "@/lib/cookies/tag-loader";
import { readConsent } from "@/lib/cookies/consent";
import { setAnalyticsConsent, loadAnalyticsConfig } from "@/lib/analytics";
// Lazy-load the cookie preferences modal — only needed when user clicks "Customize"
const CookiePreferencesModal = lazy(() =>
  import("@/components/cookies/CookiePreferencesModal").then((m) => ({ default: m.default })),
);
interface SiteShellProps {
  children: ReactNode;
}
/**
 * App shell wrapping every page with the site header, main content, and footer.
 * Includes a skip link for keyboard users to bypass the header.
 *
 * Also initializes the cookie consent system: loads any consented scripts
 * on mount and listens for real-time consent changes to load/unload scripts.
 */
const SiteShell = ({ children }: SiteShellProps) => {
  useEffect(() => {
    // Initialize tag loader with any existing consent
    initTagLoader();

    const analyticsConfig = loadAnalyticsConfig();
    const isAnalyticsOptIn = analyticsConfig?.consentMode === "opt-in";

    // Sync analytics consent with cookie consent state only in opt-in mode
    if (isAnalyticsOptIn) {
      const existing = readConsent();
      if (existing) {
        setAnalyticsConsent(existing.categories.analytics ?? false);
      }
    } else {
      setAnalyticsConsent(true);
    }

    // Listen for consent changes to dynamically load/unload scripts
    const cleanup = listenForConsentChanges();
    // Also sync analytics consent on consent changes
    const syncAnalytics = (e: Event) => {
      if (!isAnalyticsOptIn) {
        setAnalyticsConsent(true);
        return;
      }
      const customEvent = e as CustomEvent;
      const state = customEvent.detail;
      setAnalyticsConsent(state?.categories?.analytics ?? false);
    };
    window.addEventListener("consent-change", syncAnalytics);
    return () => {
      cleanup();
      window.removeEventListener("consent-change", syncAnalytics);
    };
  }, []);
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <JsonLd schema={websiteSchema()} id="website" />
      <JsonLd schema={organizationSchema()} id="organization" />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <SiteHeader />
      <MainContent>{children}</MainContent>
      <SiteFooter />
      <Analytics />
      <ConsentBanner />
      <Suspense fallback={null}>
        <CookiePreferencesModal />
      </Suspense>
      <CookieSettingsTrigger variant="badge" />
      <SlideInNewsletter />
    </div>
  );
};
export default SiteShell;
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  loadAnalyticsConfig,
  createProvider,
  setAnalyticsProvider,
  setAnalyticsConsent,
  isAnalyticsConsentGranted,
  trackPageView,
  NoopAnalyticsProvider,
  ANALYTICS_CONSENT_STORAGE_KEY,
  type AnalyticsConfig,
} from "@/lib/analytics";
import { readConsent } from "@/lib/cookies/consent";

/**
 * Analytics bootstrap component.
 *
 * Implements GA4 architecture alignment with Google Consent Mode v2:
 * 1. Synchronous bootstrap on mount without requestIdleCallback race conditions.
 * 2. Strict ES5 Arguments object preservation for window.dataLayer.push(arguments).
 * 3. Standard window.gtag("config", measurementId) without { send_page_view: false }.
 * 4. Google Consent Mode v2 default set before config call.
 * 5. SPA route transition listener deduplication (skips initial mount).
 */
const Analytics = () => {
  const location = useLocation();
  const initialized = useRef(false);

  // Initialize the provider and dataLayer immediately on mount (synchronous, no requestIdleCallback race)
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const config = loadAnalyticsConfig();
    if (!config) {
      setAnalyticsProvider(new NoopAnalyticsProvider());
      return;
    }

    // Apply consent mode: check both cookie consent store and legacy storage key
    const isOptIn = config.consentMode === "opt-in";
    if (isOptIn) {
      const cookieConsent = readConsent();
      const hasPriorConsent =
        cookieConsent?.categories?.analytics ??
        (() => {
          try {
            return localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY) === "granted";
          } catch {
            return false;
          }
        })();
      setAnalyticsConsent(hasPriorConsent);
    } else {
      setAnalyticsConsent(true);
    }

    try {
      injectProviderScripts(config);
      const provider = createProvider(config);
      setAnalyticsProvider(provider);
    } catch {
      setAnalyticsProvider(new NoopAnalyticsProvider());
    }
  }, []);

  // Track page views on subsequent SPA route changes (skip initial mount to avoid duplicate beacons)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    trackPageView(location.pathname + location.search, {
      path: location.pathname,
      search: location.search,
      title: typeof document !== "undefined" ? document.title : "",
    });
  }, [location.pathname, location.search]);

  return null;
};

function injectProviderScripts(config: AnalyticsConfig): void {
  const providerType = String(config.provider).toLowerCase();
  const shouldInjectGa4 =
    (providerType === "both" ||
      providerType === "dual" ||
      providerType === "ga4" ||
      providerType === "ga") &&
    Boolean(config.gaMeasurementId && config.gaMeasurementId.trim() !== "");

  if (shouldInjectGa4) {
    const measurementId = config.gaMeasurementId!.trim();

    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      if (!window.gtag) {
        window.gtag = function () {
          // Strict Arguments object required by gtag.js parser
          // eslint-disable-next-line prefer-rest-params
          window.dataLayer!.push(arguments);
        };
      }
      window.gtag("js", new Date());

      // Set Google Consent Mode v2 default
      const isOptIn = config.consentMode === "opt-in";
      const currentConsent = isOptIn ? isAnalyticsConsentGranted() : true;
      window.gtag("consent", "default", {
        analytics_storage: currentConsent ? "granted" : "denied",
        ad_storage: currentConsent ? "granted" : "denied",
        ad_user_data: currentConsent ? "granted" : "denied",
        ad_personalization: currentConsent ? "granted" : "denied",
      });

      // Standard GA4 config (DO NOT pass send_page_view: false; automatically dispatches initial beacon)
      window.gtag("config", measurementId);
    }

    const gtagSrc = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    injectScript(gtagSrc, { async: "true" });
  }

  if (
    (providerType === "plausible" || providerType === "both" || providerType === "dual") &&
    config.plausibleDomain
  ) {
    const src = config.plausibleSrc ?? "https://plausible.io/js/script.tagged-events.js";
    injectScript(src, { "data-domain": config.plausibleDomain });
  }

  if (providerType === "fathom" && config.fathomSiteId) {
    injectScript("https://cdn.usefathom.com/script.js", { "data-site": config.fathomSiteId });
  }

  if (providerType === "posthog" && import.meta.env.VITE_POSTHOG_KEY) {
    injectScript("https://app.posthog.com/arrays.js", {
      "data-api-key": import.meta.env.VITE_POSTHOG_KEY,
    });
  }
}

/**
 * Inject a <script> tag with deferred loading semantics.
 */
function injectScript(src: string, attrs: Record<string, string> = {}): void {
  if (typeof document === "undefined") return;
  // Avoid duplicate injection
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) return;
  const script = document.createElement("script");
  script.src = src;
  for (const [key, value] of Object.entries(attrs)) {
    script.setAttribute(key, value);
  }
  document.head.appendChild(script);
}

export default Analytics;
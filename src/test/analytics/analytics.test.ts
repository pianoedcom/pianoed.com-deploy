import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  loadAnalyticsConfig,
  createProvider,
  setAnalyticsProvider,
  setAnalyticsConsent,
  isAnalyticsConsentGranted,
  track,
  trackPageView,
  NoopAnalyticsProvider,
} from "@/lib/analytics";

describe("Analytics Module & GA4 Integration", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    setAnalyticsConsent(true);
    setAnalyticsProvider(new NoopAnalyticsProvider());
    delete (window as unknown as { gtag?: unknown }).gtag;
    delete (window as unknown as { dataLayer?: unknown }).dataLayer;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("loadAnalyticsConfig", () => {
    it("auto-falls back to ga4 when VITE_GA_MEASUREMENT_ID is provided and provider is none", () => {
      vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-EE642LR6FH");
      vi.stubEnv("VITE_ANALYTICS_PROVIDER", "none");
      vi.stubEnv("VITE_PLAUSIBLE_DOMAIN", "");

      const config = loadAnalyticsConfig();
      expect(config).not.toBeNull();
      expect(config?.provider).toBe("ga4");
      expect(config?.gaMeasurementId).toBe("G-EE642LR6FH");
    });

    it("auto-falls back to ga4 when provider is stale plausible without plausible domain", () => {
      vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-EE642LR6FH");
      vi.stubEnv("VITE_ANALYTICS_PROVIDER", "plausible");
      vi.stubEnv("VITE_PLAUSIBLE_DOMAIN", "");

      const config = loadAnalyticsConfig();
      expect(config).not.toBeNull();
      expect(config?.provider).toBe("ga4");
      expect(config?.gaMeasurementId).toBe("G-EE642LR6FH");
    });

    it("returns ga4 config when explicitly set to ga4", () => {
      vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-EE642LR6FH");
      vi.stubEnv("VITE_ANALYTICS_PROVIDER", "ga4");

      const config = loadAnalyticsConfig();
      expect(config).not.toBeNull();
      expect(config?.provider).toBe("ga4");
      expect(config?.gaMeasurementId).toBe("G-EE642LR6FH");
    });

    it("returns null when provider is off", () => {
      vi.stubEnv("VITE_ANALYTICS_PROVIDER", "off");
      const config = loadAnalyticsConfig();
      expect(config).toBeNull();
    });
  });

  describe("Google Consent Mode v2", () => {
    it("updates Google Consent Mode v2 via gtag('consent', 'update') when consent changes", () => {
      const gtagMock = vi.fn();
      window.gtag = gtagMock;

      setAnalyticsConsent(false);
      expect(isAnalyticsConsentGranted()).toBe(false);
      expect(gtagMock).toHaveBeenCalledWith("consent", "update", {
        analytics_storage: "denied",
      });

      setAnalyticsConsent(true);
      expect(isAnalyticsConsentGranted()).toBe(true);
      expect(gtagMock).toHaveBeenCalledWith("consent", "update", {
        analytics_storage: "granted",
      });
    });

    it("suppresses events when consent is false", () => {
      const gtagMock = vi.fn();
      window.gtag = gtagMock;

      const provider = createProvider({
        provider: "ga4",
        gaMeasurementId: "G-EE642LR6FH",
        consentMode: "opt-in",
      });
      setAnalyticsProvider(provider);

      setAnalyticsConsent(false);
      track("article_view", { slug: "test-post" });
      trackPageView("/test");

      // gtagMock was called for consent update, but not for event / page_view
      const eventCalls = gtagMock.mock.calls.filter(
        (args) => args[0] === "event",
      );
      expect(eventCalls).toHaveLength(0);
    });
  });

  describe("createProvider with GA4", () => {
    it("creates GA4 provider and dispatches events and pageviews via gtag", () => {
      const gtagMock = vi.fn();
      window.gtag = gtagMock;

      const provider = createProvider({
        provider: "ga4",
        gaMeasurementId: "G-EE642LR6FH",
        consentMode: "off",
      });
      setAnalyticsProvider(provider);
      setAnalyticsConsent(true);

      track("newsletter_signup", { placement: "footer" });
      expect(gtagMock).toHaveBeenCalledWith("event", "newsletter_signup", {
        placement: "footer",
      });

      trackPageView("/posts/how-to-practice-piano-effectively", {
        slug: "how-to-practice-piano-effectively",
      });
      expect(gtagMock).toHaveBeenCalledWith(
        "event",
        "page_view",
        expect.objectContaining({
          page_path: "/posts/how-to-practice-piano-effectively",
          slug: "how-to-practice-piano-effectively",
        }),
      );
    });
  });
});

/**
 * Provider-agnostic analytics abstraction.
 *
 * Design goals:
 *   - Never block rendering or interactive performance.
 *   - Never place secret analytics credentials into Client Components.
 *   - Make the analytics implementation swappable (Plausible, Fathom,
 *     Google Analytics, PostHog, etc.) without touching component code.
 *   - Respect consent: if `VITE_ANALYTICS_CONSENT_MODE` is "opt-in",
 *     events are queued until consent is granted; if "off", no events
 *     are sent at all.
 *
 * The `AnalyticsProvider` interface is the single integration point.
 * A no-op provider is used by default so the app works with zero
 * configuration. A real provider is loaded lazily only when configured.
 */
/** Event names tracked across the application. */
export type AnalyticsEvent =
  | "page_view"
  | "article_view"
  | "outbound_link_click"
  | "search_query"
  | "newsletter_cta_click"
  | "newsletter_signup"
  | "share_click"
  | "copy_link"
  | "newsletter_slide_in_dismiss"
  | "newsletter_slide_in_click"
  | "newsletter_slide_in_signup"
  | "newsletter_footer_click"
  | "newsletter_footer_signup"
  | "sponsor_click";
/** Properties accepted by `track()`. */
export interface AnalyticsProperties {
  /** Page or article URL (pathname). */
  path?: string;
  /** Article slug (for article events). */
  slug?: string;
  /** Article title. */
  title?: string;
  /** Author name. */
  author?: string;
  /** Category slug. */
  category?: string;
  /** Tags array. */
  tags?: string[];
  /** Search query string. */
  query?: string;
  /** Number of search results. */
  resultCount?: number;
  /** Outbound link URL. */
  url?: string;
  /** Share target (twitter, linkedin, native, copy). */
  target?: string;
  /** Newsletter source placement. */
  placement?: string;
  /** Any custom property. */
  [key: string]: string | number | boolean | string[] | undefined;
}
/**
 * Provider interface for analytics services.
 *
 * Implementations must be non-throwing — analytics failures must never
 * break article rendering or user interaction.
 */
export interface AnalyticsProvider {
  /** Unique provider identifier (e.g. "plausible", "fathom"). */
  readonly id: string;
  /**
   * Track an event with optional properties.
   *
   * Must be fire-and-forget: the caller never awaits this, and the
   * implementation must catch all internal errors silently.
   */
  track(event: AnalyticsEvent, properties?: AnalyticsProperties): void;
  /**
   * Track a page view. Convenience wrapper around `track("page_view", ...)`.
   */
  trackPageView(path: string, properties?: AnalyticsProperties): void;
}
/**
 * No-op analytics provider.
 *
 * Used when no provider is configured. All calls are silently swallowed.
 * This ensures the app works out of the box with zero analytics setup.
 */
export class NoopAnalyticsProvider implements AnalyticsProvider {
  readonly id = "noop";
  track(): void {
    /* no-op */
  }
  trackPageView(): void {
    /* no-op */
  }
}
/**
 * Shared localStorage key for analytics consent.
 * Uses a generic key so each deployment has its own namespace.
 */
export const ANALYTICS_CONSENT_STORAGE_KEY = "site-analytics-consent";
// --- Singleton management ---------------------------------------------------
let provider: AnalyticsProvider = new NoopAnalyticsProvider();
let consentGranted = true;
/**
 * Set the active analytics provider.
 *
 * Called once at application startup (from the Analytics component)
 * after lazily loading the configured provider. If `id` is "noop",
 * all subsequent calls are silently ignored.
 */
export function setAnalyticsProvider(p: AnalyticsProvider): void {
  provider = p;
}
/** Get the active analytics provider. */
export function getAnalyticsProvider(): AnalyticsProvider {
  return provider;
}
export function isAnalyticsConsentGranted(): boolean {
  return consentGranted;
}

/**
 * Set whether the user has granted analytics consent.
 *
 * When `false`, all `track()` and `trackPageView()` calls are silently
 * dropped, regardless of the provider. Also updates Google Consent Mode v2
 * if window.gtag is available.
 */
export function setAnalyticsConsent(granted: boolean): void {
  consentGranted = granted;
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
    });
  }
}

/**
 * Track an analytics event.
 *
 * This is the primary public API. It is synchronous, non-throwing, and
 * safe to call from any component or hook. If consent has not been
 * granted or the provider is the no-op, the call is silently dropped.
 */
export function track(event: AnalyticsEvent, properties?: AnalyticsProperties): void {
  if (!consentGranted) return;
  try {
    provider.track(event, properties);
  } catch {
    // Analytics must never break the app.
  }
}

/**
 * Track a page view.
 *
 * Convenience wrapper for `track("page_view", { path, ...properties })`.
 */
export function trackPageView(path: string, properties?: AnalyticsProperties): void {
  if (!consentGranted) return;
  try {
    provider.trackPageView(path, properties);
  } catch {
    // Analytics must never break the app.
  }
}

// --- Provider factory & configuration ---------------------------------------

export type AnalyticsProviderOption =
  | "ga"
  | "ga4"
  | "plausible"
  | "fathom"
  | "posthog"
  | "both"
  | "dual"
  | "none"
  | "off";

/**
 * Analytics configuration derived from client-safe environment variables.
 *
 * Only `VITE_`-prefixed variables are read — no secrets are ever
 * exposed to the browser. Provider-specific credentials (e.g. GA
 * measurement ID, Plausible domain) are public identifiers, not secrets.
 */
export interface AnalyticsConfig {
  /** Provider type: "ga4", "ga", "plausible", "fathom", "posthog", "both", "dual", "none", or "off". */
  provider: AnalyticsProviderOption | string;
  /** Plausible domain (if provider is "plausible"). */
  plausibleDomain?: string;
  /** Plausible script src override (if self-hosting). */
  plausibleSrc?: string;
  /** Fathom site ID (if provider is "fathom"). */
  fathomSiteId?: string;
  /** Google Analytics measurement ID (if provider is "ga" or "ga4"). */
  gaMeasurementId?: string;
  /** Consent mode: "off" (track always), "opt-in" (require consent). */
  consentMode: "off" | "opt-in";
}

/**
 * Load analytics configuration from client-safe environment variables.
 *
 * Implements self-healing fallback logic: if VITE_GA_MEASUREMENT_ID is supplied,
 * automatically activates GA4 even if VITE_ANALYTICS_PROVIDER is unset, "none",
 * or a stale "plausible" entry without a configured domain.
 *
 * Returns `null` if analytics is disabled.
 */
export function loadAnalyticsConfig(): AnalyticsConfig | null {
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const rawProvider =
    import.meta.env.VITE_ANALYTICS_PROVIDER ?? (gaId ? "ga4" : "none");
  const providerType = rawProvider.trim().toLowerCase();

  // If provider is unset, "none", or stale "plausible" with no domain, auto-fallback to GA4
  const effectiveProvider =
    ((providerType === "plausible" || providerType === "none") &&
      (!import.meta.env.VITE_PLAUSIBLE_DOMAIN || import.meta.env.VITE_PLAUSIBLE_DOMAIN.trim() === "") &&
      Boolean(gaId && gaId.trim() !== ""))
      ? "ga4"
      : providerType;

  if (effectiveProvider === "none" || effectiveProvider === "off" || !effectiveProvider) {
    return null;
  }

  const consentMode = (import.meta.env.VITE_ANALYTICS_CONSENT_MODE as "off" | "opt-in") ?? "opt-in";

  return {
    provider: effectiveProvider as AnalyticsProviderOption,
    plausibleDomain: import.meta.env.VITE_PLAUSIBLE_DOMAIN,
    plausibleSrc: import.meta.env.VITE_PLAUSIBLE_SRC,
    fathomSiteId: import.meta.env.VITE_FATHOM_SITE_ID,
    gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID,
    consentMode,
  };
}

/**
 * Create an analytics provider instance from configuration.
 */
export function createProvider(config: AnalyticsConfig | null): AnalyticsProvider {
  if (!config) return new NoopAnalyticsProvider();
  const providerType = String(config.provider).toLowerCase();

  switch (providerType) {
    case "ga":
    case "ga4":
      return createGaProvider(config);
    case "plausible":
      return createPlausibleProvider(config);
    case "fathom":
      return createFathomProvider(config);
    case "posthog":
      return createPostHogProvider(config);
    case "both":
    case "dual":
      return createDualProvider(config);
    default:
      return new NoopAnalyticsProvider();
  }
}

function createGaProvider(config: AnalyticsConfig): AnalyticsProvider {
  if (!config.gaMeasurementId) return new NoopAnalyticsProvider();
  return {
    id: "ga4",
    track(event, properties) {
      try {
        if (typeof window !== "undefined" && typeof window.gtag === "function") {
          window.gtag("event", event, properties);
        }
      } catch {
        // non-throwing
      }
    },
    trackPageView(path, properties) {
      try {
        if (typeof window !== "undefined" && typeof window.gtag === "function") {
          window.gtag("event", "page_view", {
            page_path: path,
            page_location: typeof window !== "undefined" ? window.location.href : undefined,
            page_title: typeof document !== "undefined" ? document.title : undefined,
            ...properties,
          });
        }
      } catch {
        // non-throwing
      }
    },
  };
}

function createPlausibleProvider(config: AnalyticsConfig): AnalyticsProvider {
  if (!config.plausibleDomain) return new NoopAnalyticsProvider();
  return {
    id: "plausible",
    track(event, properties) {
      try {
        (window as unknown as { plausible?: (...args: unknown[]) => void }).plausible?.(event, {
          props: properties,
        });
      } catch {
        // non-throwing
      }
    },
    trackPageView(path) {
      try {
        (window as unknown as { plausible?: (...args: unknown[]) => void }).plausible?.(
          "pageview",
          { u: `${window.location.origin}${path}` },
        );
      } catch {
        // non-throwing
      }
    },
  };
}

function createFathomProvider(config: AnalyticsConfig): AnalyticsProvider {
  if (!config.fathomSiteId) return new NoopAnalyticsProvider();
  return {
    id: "fathom",
    track(event, properties) {
      try {
        (
          window as unknown as { fathom?: { trackEvent?: (...args: unknown[]) => void } }
        ).fathom?.trackEvent?.(event, properties);
      } catch {
        // non-throwing
      }
    },
    trackPageView() {
      // Fathom tracks automatically via script
    },
  };
}

function createPostHogProvider(config: AnalyticsConfig): AnalyticsProvider {
  const apiKey = import.meta.env.VITE_POSTHOG_KEY;
  if (!apiKey) return new NoopAnalyticsProvider();
  return {
    id: "posthog",
    track(event, properties) {
      try {
        (
          window as unknown as { posthog?: { capture?: (...args: unknown[]) => void } }
        ).posthog?.capture?.(event, properties);
      } catch {
        // non-throwing
      }
    },
    trackPageView(path) {
      try {
        (
          window as unknown as { posthog?: { capture?: (...args: unknown[]) => void } }
        ).posthog?.capture?.("$pageview", { $current_url: `${window.location.origin}${path}` });
      } catch {
        // non-throwing
      }
    },
  };
}

function createDualProvider(config: AnalyticsConfig): AnalyticsProvider {
  const ga = createGaProvider(config);
  const plausible = createPlausibleProvider(config);
  return {
    id: "dual",
    track(event, properties) {
      ga.track(event, properties);
      plausible.track(event, properties);
    },
    trackPageView(path, properties) {
      ga.trackPageView(path, properties);
      plausible.trackPageView(path, properties);
    },
  };
}
/**
 * Cookie Consent & Management — Central Configuration Registry
 *
 * Defines all cookie categories, individual cookies, third-party scripts,
 * and admin-level toggles. The ConsentBanner, PreferencesModal, CookiePolicy
 * page, and tag-loader all read from this single source of truth.
 *
 * To customize: edit the arrays below — no component code changes needed.
 */
/* ── Types ──────────────────────────────────────────────────────────────── */
export type CookieCategory = "necessary" | "analytics" | "functional" | "marketing";
export type ConsentMode = "opt-in" | "notice-only";
export interface CookieDefinition {
  /** Cookie or storage key name */
  name: string;
  /** Provider / vendor name */
  provider: string;
  /** Human-readable purpose */
  purpose: string;
  /** Expiration (e.g. "365 days", "Session") */
  expiration: string;
  /** First-party or third-party */
  type: "1st-party" | "3rd-party";
  /** Category this cookie belongs to */
  category: CookieCategory;
}
export interface CookieCategoryConfig {
  /** Category identifier */
  id: CookieCategory;
  /** Display name */
  label: string;
  /** Description shown in preferences modal and policy page */
  description: string;
  /** Whether this category is always enabled (cannot be disabled) */
  alwaysEnabled: boolean;
}
export interface ThirdPartyScript {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Category required for this script to load */
  category: CookieCategory;
  /** Script src URL (empty for inline/pixel) */
  src?: string;
  /** Inline script to inject (for pixels, GTM, etc.) */
  inject?: () => void;
  /** Whether this script is enabled in the current deployment */
  enabled: boolean;
}
export interface CookieConfig {
  /** Consent mode: "opt-in" (GDPR default) or "notice-only" */
  consentMode: ConsentMode;
  /** Cookie categories in display order */
  categories: CookieCategoryConfig[];
  /** All known cookies for the audit table */
  cookies: CookieDefinition[];
  /** Third-party scripts that require consent */
  scripts: ThirdPartyScript[];
  /** Policy page URL */
  policyUrl: string;
  /** Consent storage key (localStorage + cookie name) */
  storageKey: string;
  /** Consent cookie expiry in days */
  cookieExpiryDays: number;
}
/* ── Configuration ──────────────────────────────────────────────────────── */
export const cookieConfig: CookieConfig = {
  consentMode: "opt-in",
  policyUrl: "/cookie-policy",
  storageKey: "site_consent",
  cookieExpiryDays: 365,
  categories: [
    {
      id: "necessary",
      label: "Necessary",
      description:
        "Essential cookies enable core site functionality such as security, session management, and accessibility. The site cannot function properly without these.",
      alwaysEnabled: true,
    },
    {
      id: "analytics",
      label: "Analytics",
      description:
        "Analytics cookies help us understand how visitors interact with the site by collecting and reporting information anonymously. We use this data to improve the user experience.",
      alwaysEnabled: false,
    },
    {
      id: "functional",
      label: "Functional & Preferences",
      description:
        "Functional cookies enable enhanced features such as embedded media, comment systems, and personalized content. They may be set by us or by third-party providers whose services we use.",
      alwaysEnabled: false,
    },
    {
      id: "marketing",
      label: "Marketing & Advertising",
      description:
        "Marketing cookies are used to deliver relevant advertisements and track campaign performance. They may be set by us or by advertising partners to build a profile of your interests and show relevant ads on other sites.",
      alwaysEnabled: false,
    },
  ],
  cookies: [
    // ── Necessary ──
    {
      name: "site_consent",
      provider: "This site",
      purpose: "Stores your cookie consent preferences",
      expiration: "365 days",
      type: "1st-party",
      category: "necessary",
    },
    {
      name: "site_theme",
      provider: "This site",
      purpose: "Remembers your light/dark theme preference",
      expiration: "365 days",
      type: "1st-party",
      category: "necessary",
    },
    {
      name: "site_locale",
      provider: "This site",
      purpose: "Remembers your selected language",
      expiration: "365 days",
      type: "1st-party",
      category: "necessary",
    },
    {
      name: "site-search-history",
      provider: "This site",
      purpose: "Stores recent search queries for quick re-search",
      expiration: "Session",
      type: "1st-party",
      category: "necessary",
    },
    // ── Analytics ──
    {
      name: "_ga",
      provider: "Google Analytics",
      purpose: "Distinguishes unique users for analytics",
      expiration: "2 years",
      type: "3rd-party",
      category: "analytics",
    },
    {
      name: "_ga_*",
      provider: "Google Analytics",
      purpose: "Maintains session state for analytics",
      expiration: "2 years",
      type: "3rd-party",
      category: "analytics",
    },
    {
      name: "plausible_session",
      provider: "Plausible",
      purpose: "Privacy-friendly page view tracking",
      expiration: "1 day",
      type: "3rd-party",
      category: "analytics",
    },
    // ── Functional ──
    {
      name: "giscus-session",
      provider: "Giscus",
      purpose: "Enables GitHub-based comment system",
      expiration: "Session",
      type: "3rd-party",
      category: "functional",
    },
    {
      name: "embed-preferences",
      provider: "This site",
      purpose: "Remembers your media embed preferences",
      expiration: "30 days",
      type: "1st-party",
      category: "functional",
    },
    // ── Marketing ──
    {
      name: "_fbp",
      provider: "Meta Pixel",
      purpose: "Tracks conversions for Facebook ads",
      expiration: "90 days",
      type: "3rd-party",
      category: "marketing",
    },
    {
      name: "li_sugr",
      provider: "LinkedIn Insight",
      purpose: "Tracks LinkedIn ad engagement",
      expiration: "90 days",
      type: "3rd-party",
      category: "marketing",
    },
  ],
  scripts: [
    // ── Analytics scripts ──
    {
      id: "ga4",
      name: "Google Analytics 4",
      category: "analytics",
      enabled: Boolean(import.meta.env.VITE_GA_MEASUREMENT_ID),
      src: "", // Injected dynamically with measurement ID from env
    },
    {
      id: "plausible",
      name: "Plausible Analytics",
      category: "analytics",
      enabled: false,
      src: "",
    },
    // ── Functional scripts ──
    {
      id: "giscus",
      name: "Giscus Comments",
      category: "functional",
      enabled: false,
    },
    // ── Marketing scripts ──
    {
      id: "meta-pixel",
      name: "Meta Pixel",
      category: "marketing",
      enabled: false,
    },
    {
      id: "linkedin-insight",
      name: "LinkedIn Insight Tag",
      category: "marketing",
      enabled: false,
    },
  ],
};
/* ── Helpers ────────────────────────────────────────────────────────────── */
/** Get all categories that are not always-enabled (user-toggleable) */
export function getOptionalCategories(): CookieCategoryConfig[] {
  return cookieConfig.categories.filter((c) => !c.alwaysEnabled);
}
/** Get cookies for a specific category */
export function getCookiesByCategory(category: CookieCategory): CookieDefinition[] {
  return cookieConfig.cookies.filter((c) => c.category === category);
}
/** Get scripts that require consent for a specific category */
export function getScriptsByCategory(category: CookieCategory): ThirdPartyScript[] {
  return cookieConfig.scripts.filter((s) => s.category === category && s.enabled);
}
/** Check if consent mode requires explicit opt-in */
export function isOptInMode(): boolean {
  return cookieConfig.consentMode === "opt-in";
}
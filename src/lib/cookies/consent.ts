/**
 * Consent state management — stores/retrieves granular consent preferences.
 *
 * Persists to both localStorage (for instant client reads) and a strict
 * first-party cookie (SameSite=Lax, Secure, 365-day expiry) for server-side
 * reads and compliance verification.
 */
import { cookieConfig, type CookieCategory } from "@/lib/config/cookies";
export interface ConsentState {
  /** Timestamp of consent */
  timestamp: number;
  /** Per-category consent flags */
  categories: Record<CookieCategory, boolean>;
  /** Consent version (bump to force re-consent) */
  version: number;
}
export const CONSENT_VERSION = 1;
const STORAGE_KEY = cookieConfig.storageKey;
/* ── Storage utilities ──────────────────────────────────────────────────── */
/** Set a first-party cookie with security flags */
function setCookie(name: string, value: string, days: number): void {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secure}`;
  } catch {
    // ignore
  }
}
/** Read a first-party cookie by name */
export function getCookie(name: string): string | null {
  try {
    const match = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
    if (!match) return null;
    return decodeURIComponent(match.split("=").slice(1).join("="));
  } catch {
    return null;
  }
}
/** Delete a first-party cookie */
function deleteCookie(name: string): void {
  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  } catch {
    // ignore
  }
}
/* ── Default state ──────────────────────────────────────────────────────── */
export function getDefaultConsent(): ConsentState {
  const categories = {} as Record<CookieCategory, boolean>;
  for (const cat of cookieConfig.categories) {
    categories[cat.id] = cat.alwaysEnabled;
  }
  return { timestamp: 0, categories, version: CONSENT_VERSION };
}
/* ── Read / Write ──────────────────────────────────────────────────────── */
/** Read stored consent from localStorage (primary) or cookie (fallback) */
export function readConsent(): ConsentState | null {
  try {
    // Try localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ConsentState;
      if (parsed.version === CONSENT_VERSION) return parsed;
    }
    // Fall back to cookie
    const cookieVal = getCookie(STORAGE_KEY);
    if (cookieVal) {
      const parsed = JSON.parse(cookieVal) as ConsentState;
      if (parsed.version === CONSENT_VERSION) return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return null;
}
/** Check if user has made a consent decision */
export function hasConsented(): boolean {
  return readConsent() !== null;
}
/** Save consent to both localStorage and cookie */
export function writeConsent(state: ConsentState): void {
  const json = JSON.stringify(state);
  try {
    localStorage.setItem(STORAGE_KEY, json);
  } catch {
    // ignore
  }
  setCookie(STORAGE_KEY, json, cookieConfig.cookieExpiryDays);
  // Dispatch a custom event so listeners (tag-loader, ConsentGate) react
  window.dispatchEvent(new CustomEvent("consent-change", { detail: state }));
}
/** Accept all categories */
export function acceptAllConsent(): ConsentState {
  const categories = {} as Record<CookieCategory, boolean>;
  for (const cat of cookieConfig.categories) {
    categories[cat.id] = true;
  }
  const state: ConsentState = {
    timestamp: Date.now(),
    categories,
    version: CONSENT_VERSION,
  };
  writeConsent(state);
  return state;
}
/** Reject all non-essential categories */
export function rejectNonEssentialConsent(): ConsentState {
  const categories = {} as Record<CookieCategory, boolean>;
  for (const cat of cookieConfig.categories) {
    categories[cat.id] = cat.alwaysEnabled;
  }
  const state: ConsentState = {
    timestamp: Date.now(),
    categories,
    version: CONSENT_VERSION,
  };
  writeConsent(state);
  return state;
}
/** Save custom preferences */
export function saveCustomConsent(prefs: Record<CookieCategory, boolean>): ConsentState {
  // Force necessary to always be true
  const categories = { ...prefs };
  for (const cat of cookieConfig.categories) {
    if (cat.alwaysEnabled) categories[cat.id] = true;
  }
  const state: ConsentState = {
    timestamp: Date.now(),
    categories,
    version: CONSENT_VERSION,
  };
  writeConsent(state);
  return state;
}
/** Revoke consent entirely — wipes state and fires change event */
export function revokeConsent(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  deleteCookie(STORAGE_KEY);
  // Wipe category-specific cookies
  wipeNonEssentialCookies();
  // Dispatch event with default (all necessary only)
  window.dispatchEvent(new CustomEvent("consent-change", { detail: getDefaultConsent() }));
}
/** Check if a specific category has consent */
export function hasCategoryConsent(category: CookieCategory): boolean {
  const state = readConsent();
  if (!state) return false;
  return state.categories[category] ?? false;
}
/* ── Cookie wiping ───────────────────────────────────────────────────────── */
/** Remove all known non-essential cookies when consent is revoked */
export function wipeNonEssentialCookies(): void {
  for (const cookie of cookieConfig.cookies) {
    if (cookie.category === "necessary") continue;
    // Handle wildcard patterns like _ga_*
    if (cookie.name.endsWith("*")) {
      const prefix = cookie.name.slice(0, -1);
      const all = document.cookie.split("; ");
      for (const row of all) {
        const cookieName = row.split("=")[0];
        if (cookieName.startsWith(prefix)) {
          deleteCookie(cookieName);
        }
      }
    } else {
      deleteCookie(cookie.name);
    }
  }
  // Also clear known analytics localStorage keys
  const analyticsKeys = ["_ga", "plausible_session"];
  for (const key of analyticsKeys) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}
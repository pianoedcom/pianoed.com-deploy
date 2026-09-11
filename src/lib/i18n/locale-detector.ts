/**
 * Locale detection utility.
 *
 * Detects the user's preferred locale from:
 *   1. URL prefix (e.g. /hi/blog/...)
 *   2. localStorage preference
 *   3. navigator.language
 *   4. Default locale fallback
 */
import { DEFAULT_LOCALE, isLocaleSupported, getLocale } from "./config";
const STORAGE_KEY = "site-locale";
/**
 * Detect the user's preferred locale.
 */
export function detectLocale(pathname?: string): string {
  // 1. Check URL prefix
  if (pathname) {
    const match = pathname.match(/^\/([a-z]{2})(\/|$)/);
    if (match && isLocaleSupported(match[1])) {
      return match[1];
    }
  }
  // 2. Check localStorage
  if (typeof localStorage !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isLocaleSupported(stored)) {
        return stored;
      }
    } catch {
      // localStorage unavailable
    }
  }
  // 3. Check navigator.language
  if (typeof navigator !== "undefined") {
    const browserLang = navigator.language.split("-")[0];
    if (browserLang && isLocaleSupported(browserLang)) {
      return browserLang;
    }
  }
  // 4. Default fallback
  return DEFAULT_LOCALE;
}
/**
 * Save the user's locale preference.
 */
export function saveLocalePreference(locale: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // ignore
  }
}
/**
 * Get the text direction for a locale.
 */
export function getLocaleDirection(locale: string): "ltr" | "rtl" {
  return getLocale(locale)?.dir ?? "ltr";
}
/**
 * Strip the locale prefix from a pathname.
 * e.g. /hi/blog/post → /blog/post
 */
export function stripLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/[a-z]{2}(\/|$)/);
  if (match) {
    return pathname.slice(match[0].length - 1) || "/";
  }
  return pathname;
}
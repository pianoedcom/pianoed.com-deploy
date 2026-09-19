/**
 * i18n React context — provides the current locale, a setter, and the
 * translation function (`t`) to all components.
 *
 * The provider:
 *   1. Detects the locale on mount (URL → localStorage → navigator.language)
 *   2. Loads the UI dictionary for that locale (falls back to default)
 *   3. Persists user selections to localStorage + cookie
 *   4. Updates `<html lang>` and `<html dir>` attributes
 */
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, getLocale, type LocaleConfig } from "./config";
import { detectLocale, saveLocalePreference } from "./locale-detector";
import { loadDictionary, getDictionary, getDefaultDictionary, type Dictionary } from "./dictionaries";
const COOKIE_KEY = "site-locale";
export interface I18nContextValue {
  /** Current active locale code (e.g. "en", "hi", "es"). */
  locale: string;
  /** Locale config object for the current locale. */
  localeConfig: LocaleConfig;
  /** List of all supported locales for the selector. */
  supportedLocales: LocaleConfig[];
  /** Change the active locale and persist the preference. */
  setLocale: (locale: string) => void;
  /** Translate a UI string key. Falls back to the key itself if not found. */
  t: (key: string, params?: Record<string, string | number>) => string;
  /** Whether the current locale is the default (no URL prefix needed). */
  isDefault: boolean;
}
const defaultLocaleConfig = getLocale(DEFAULT_LOCALE)!;
const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  localeConfig: defaultLocaleConfig,
  supportedLocales: SUPPORTED_LOCALES,
  setLocale: () => {},
  t: (key) => key,
  isDefault: true,
});
/** Hook to access the i18n context. */
export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
/** Set a cookie value. */
function setCookie(name: string, value: string, days: number = 365): void {
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value};expires=${expires};path=/;SameSite=Lax`;
  } catch {
    // ignore
  }
}
/** Translate a key using the dictionary, with optional parameter interpolation. */
function translate(
  dict: Dictionary,
  key: string,
  params?: Record<string, string | number>,
): string {
  let value: string = key;
  // Try exact key in active dictionary
  if (key in dict) {
    value = dict[key];
  } else {
    // Fallback to default dictionary if available
    const fallbackDict = getDefaultDictionary();
    if (key in fallbackDict) {
      value = fallbackDict[key];
    }
  }
  // Interpolate params: {name} → value
  if (params) {
    for (const [param, val] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${param}\\}`, "g"), String(val));
    }
  }
  return value;
}
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<string>(() => {
    // Detect on first render — safe for SSR (returns default if no window)
    if (typeof window === "undefined") return DEFAULT_LOCALE;
    return detectLocale(window.location.pathname);
  });
  // Synchronously initialize dictionary to avoid raw key flash on initial render
  const [dictionary, setDictionary] = useState<Dictionary>(() => getDictionary(locale));
  // Update dictionary when locale changes
  useEffect(() => {
    setDictionary(getDictionary(locale));
  }, [locale]);
  // Update <html> lang and dir attributes
  useEffect(() => {
    const config = getLocale(locale);
    if (config) {
      document.documentElement.lang = config.code;
      document.documentElement.dir = config.dir;
    }
  }, [locale]);
  const setLocale = useCallback((newLocale: string) => {
    if (!getLocale(newLocale)) return;
    setLocaleState(newLocale);
    saveLocalePreference(newLocale);
    setCookie(COOKIE_KEY, newLocale);
  }, []);
  const localeConfig = getLocale(locale) ?? defaultLocaleConfig;
  const value: I18nContextValue = {
    locale,
    localeConfig,
    supportedLocales: SUPPORTED_LOCALES,
    setLocale,
    t: (key: string, params?: Record<string, string | number>) =>
      translate(dictionary, key, params),
    isDefault: locale === DEFAULT_LOCALE,
  };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
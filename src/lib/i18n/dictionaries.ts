/**
 * UI string dictionaries.
 *
 * Each locale has a JSON file at `content/locales/{locale}.json` containing
 * key-value pairs for interface strings. The default locale (en) is always
 * loaded as a fallback — missing keys in a translation fall back to English.
 */
import { DEFAULT_LOCALE } from "./config";
export type Dictionary = Record<string, string>;
// Eagerly load all locale dictionaries via Vite's glob import.
// Uses absolute path from project root (same convention as content/posts glob).
const localeModules = import.meta.glob<Dictionary>("/content/locales/*.json", {
  import: "default",
  eager: true,
});
/** Cache of loaded dictionaries. */
const dictCache = new Map<string, Dictionary>();
/** Get the raw loaded module for a locale. */
function getRawDictionary(locale: string): Dictionary | null {
  // Try exact match: content/locales/{locale}.json
  const key = Object.keys(localeModules).find((k) => k.endsWith(`/${locale}.json`));
  if (key) return localeModules[key];
  return null;
}
/** The default dictionary — loaded synchronously from the glob. */
let defaultDict: Dictionary | null = null;
export function getDefaultDictionary(): Dictionary {
  if (defaultDict) return defaultDict;
  defaultDict = getRawDictionary(DEFAULT_LOCALE) ?? {};
  return defaultDict;
}
/**
 * Synchronously get a dictionary for a locale.
 * Falls back to the default locale's dictionary for missing keys.
 */
export function getDictionary(locale: string = DEFAULT_LOCALE): Dictionary {
  const targetLocale = locale || DEFAULT_LOCALE;
  if (dictCache.has(targetLocale)) {
    return dictCache.get(targetLocale)!;
  }
  // Start with the default dictionary as the base
  const dict: Dictionary = { ...getDefaultDictionary() };
  if (targetLocale !== DEFAULT_LOCALE) {
    const localeDict = getRawDictionary(targetLocale);
    if (localeDict) {
      // Merge — locale-specific keys override defaults
      Object.assign(dict, localeDict);
    }
  }
  dictCache.set(targetLocale, dict);
  return dict;
}
/**
 * Load a dictionary for a locale.
 * Falls back to the default locale's dictionary for missing keys.
 */
export async function loadDictionary(locale: string): Promise<Dictionary> {
  return getDictionary(locale);
}
/**
 * Get a list of all available locale codes (those with dictionary files).
 */
export function getAvailableLocales(): string[] {
  const locales = new Set<string>([DEFAULT_LOCALE]);
  for (const key of Object.keys(localeModules)) {
    const match = key.match(/\/([^/]+)\.json$/);
    if (match) locales.add(match[1]);
  }
  return Array.from(locales);
}
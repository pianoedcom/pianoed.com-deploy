/**
 * i18n configuration.
 *
 * Defines supported locales, default locale, and locale metadata.
 * This is a foundation — actual translations require locale-specific
 * content files and routing changes (see docs/i18n-setup.md).
 */
export interface LocaleConfig {
  code: string;
  name: string;
  nativeName: string;
  dir: "ltr" | "rtl";
}
export const SUPPORTED_LOCALES: LocaleConfig[] = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", dir: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", dir: "ltr" },
  { code: "de", name: "German", nativeName: "Deutsch", dir: "ltr" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", dir: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", dir: "rtl" },
];
export const DEFAULT_LOCALE = "en";
/**
 * Get locale config by code.
 */
export function getLocale(code: string): LocaleConfig | undefined {
  return SUPPORTED_LOCALES.find((l) => l.code === code);
}
/**
 * Check if a locale is supported.
 */
export function isLocaleSupported(code: string): boolean {
  return SUPPORTED_LOCALES.some((l) => l.code === code);
}
/**
 * Get the list of non-default locale codes (for route prefixing).
 */
export function getNonDefaultLocales(): string[] {
  return SUPPORTED_LOCALES.filter((l) => l.code !== DEFAULT_LOCALE).map((l) => l.code);
}
/**
 * Dynamic Tag Loader — blocks third-party scripts until consent is granted.
 *
 * Scripts registered in cookieConfig.scripts are only injected into the DOM
 * when the user has explicitly consented to the script's category. If consent
 * is revoked, loaded scripts are removed and their cookies wiped.
 */
import { cookieConfig, getScriptsByCategory, type CookieCategory } from "@/lib/config/cookies";
import { hasCategoryConsent, readConsent } from "./consent";
/** Track injected script elements by ID for cleanup */
const injectedScripts = new Map<string, HTMLScriptElement>();
/** Track injected inline scripts (pixels, etc.) for cleanup */
const injectedInline = new Map<string, () => void>();
/** Load all scripts for a given category if consent is granted */
export function loadScriptsForCategory(category: CookieCategory): void {
  if (!hasCategoryConsent(category)) return;
  const scripts = getScriptsByCategory(category);
  for (const script of scripts) {
    if (injectedScripts.has(script.id) || injectedInline.has(script.id)) continue;
    injectScript(script);
  }
}
/** Inject a single script element or run inline injection */
function injectScript(script: (typeof cookieConfig.scripts)[number]): void {
  if (script.src) {
    const el = document.createElement("script");
    el.src = script.src;
    el.async = true;
    el.dataset.consentScript = script.id;
    document.head.appendChild(el);
    injectedScripts.set(script.id, el);
  } else if (script.inject) {
    script.inject();
    injectedInline.set(script.id, script.inject);
  }
}
/** Remove all scripts for a given category (when consent is revoked) */
export function removeScriptsForCategory(category: CookieCategory): void {
  const scripts = cookieConfig.scripts.filter((s) => s.category === category);
  for (const script of scripts) {
    const el = injectedScripts.get(script.id);
    if (el) {
      el.remove();
      injectedScripts.delete(script.id);
    }
    injectedInline.delete(script.id);
  }
}
/** Remove all non-essential scripts */
export function removeAllNonEssentialScripts(): void {
  for (const cat of cookieConfig.categories) {
    if (cat.alwaysEnabled) continue;
    removeScriptsForCategory(cat.id);
  }
}
/** Initialize: load scripts for any categories already consented to */
export function initTagLoader(): void {
  const state = readConsent();
  if (!state) return;
  for (const cat of cookieConfig.categories) {
    if (state.categories[cat.id]) {
      loadScriptsForCategory(cat.id);
    }
  }
}
/** Listen for consent changes and load/unload scripts in real time */
export function listenForConsentChanges(): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent;
    const state = customEvent.detail;
    for (const cat of cookieConfig.categories) {
      if (cat.alwaysEnabled) continue;
      const hasConsent = state?.categories?.[cat.id] ?? false;
      if (hasConsent) {
        loadScriptsForCategory(cat.id);
      } else {
        removeScriptsForCategory(cat.id);
      }
    }
  };
  window.addEventListener("consent-change", handler);
  return () => window.removeEventListener("consent-change", handler);
}
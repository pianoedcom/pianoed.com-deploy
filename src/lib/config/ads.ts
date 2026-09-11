/**
 * Ad / sponsorship slot configuration.
 *
 * Centralizes ad placement zones so they can be enabled/disabled globally
 * without touching component code. When a slot is disabled or has no content
 * configured, the AdSlot component renders nothing — no layout shift.
 *
 * To configure: set the slot's `enabled` to true and provide either an
 * `htmlContent` string (for ad network snippets) or a `sponsor` object
 * (for direct sponsorship deals with a logo and link).
 */
export type AdPlacement =
  "header" | "sidebar" | "in-article" | "sticky-footer" | "between-articles";
export interface SponsorAd {
  name: string;
  logo?: string;
  url: string;
  label?: string;
}
export interface AdSlotConfig {
  enabled: boolean;
  /** Raw HTML content for ad network snippets (AdSense, Ezoic, etc.). */
  htmlContent?: string;
  /** Direct sponsor deal with logo and link. */
  sponsor?: SponsorAd;
}
export const adSlotsConfig: Record<AdPlacement, AdSlotConfig> = {
  header: {
    enabled: false,
  },
  sidebar: {
    enabled: false,
  },
  "in-article": {
    enabled: false,
  },
  "sticky-footer": {
    enabled: false,
  },
  "between-articles": {
    enabled: false,
  },
};
/** Check if a given ad placement is enabled. */
export function isAdEnabled(placement: AdPlacement): boolean {
  return adSlotsConfig[placement]?.enabled ?? false;
}
import { adSlotsConfig, isAdEnabled, type AdPlacement, type SponsorAd } from "@/lib/config/ads";
import { track } from "@/lib/analytics";
/**
 * AdSlot — flexible ad/sponsorship placement component.
 *
 * Renders an advertisement or sponsor placement in a designated zone.
 * Gracefully collapses (renders nothing) when the slot is disabled or
 * has no content configured — no layout shift.
 *
 * Usage in TSX:
 *   <AdSlot placement="in-article" />
 *   <AdSlot placement="sidebar" />
 *   <AdSlot placement="sticky-footer" />
 *
 * Usage in MDX (if registered):
 *   <AdSlot placement="between-articles" />
 */
interface AdSlotProps {
  placement: AdPlacement;
  /** Optional override to force-enable a slot regardless of config. */
  forceEnabled?: boolean;
  /** Optional className for custom styling. */
  className?: string;
}
export const AdSlot = ({ placement, forceEnabled = false, className = "" }: AdSlotProps) => {
  const enabled = forceEnabled || isAdEnabled(placement);
  const config = adSlotsConfig[placement];
  if (!enabled || !config || (!config.htmlContent && !config.sponsor)) {
    return null;
  }
  const handleSponsorClick = (sponsor: SponsorAd) => {
    track("sponsor_click", { placement, sponsor: sponsor.name });
  };
  if (config.sponsor) {
    return (
      <div
        className={`my-6 rounded-lg border border-border bg-muted/30 p-4 ${className}`}
        role="complementary"
        aria-label="Sponsored content"
      >
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {config.sponsor.label ?? "Sponsored"}
        </p>
        <a
          href={config.sponsor.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => handleSponsorClick(config.sponsor!)}
          className="flex items-center gap-3"
        >
          {config.sponsor.logo && (
            <img
              src={config.sponsor.logo}
              alt={config.sponsor.name}
              className="h-8 w-auto"
              loading="lazy"
            />
          )}
          <span className="text-sm font-medium text-foreground">{config.sponsor.name}</span>
        </a>
      </div>
    );
  }
  // Render raw HTML for ad network snippets
  return (
    <div
      className={`my-6 ${className}`}
      role="complementary"
      aria-label="Advertisement"
      dangerouslySetInnerHTML={{ __html: config.htmlContent ?? "" }}
    />
  );
};
export default AdSlot;
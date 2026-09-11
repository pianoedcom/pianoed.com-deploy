import type { ReactNode } from "react";
/**
 * SponsoredBadge — disclosure badge for sponsored or affiliate content.
 *
 * Provides clear, accessible labeling for monetized content per FTC
 * guidelines and SEO best practices.
 *
 * Usage in MDX:
 *   <SponsoredBadge type="sponsored" />
 *   <SponsoredBadge type="affiliate" />
 *   <SponsoredBadge type="partner" />
 */
interface SponsoredBadgeProps {
  type?: "sponsored" | "affiliate" | "partner";
  children?: ReactNode;
}
const LABELS: Record<string, string> = {
  sponsored: "Sponsored",
  affiliate: "Affiliate Link",
  partner: "Partner Content",
};
export const SponsoredBadge = ({ type = "sponsored", children }: SponsoredBadgeProps) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
    {children ?? LABELS[type]}
  </span>
);
export default SponsoredBadge;
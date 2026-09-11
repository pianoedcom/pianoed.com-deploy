import type { ReactNode } from "react";
import { track } from "@/lib/analytics";
/**
 * ExternalLink — anchor for off-site links.
 *
 * Adds `rel="noopener noreferrer"`, `target="_blank"`, and a visually-hidden
 * "(opens in new tab)" announcement for screen readers, plus an external-link
 * icon so sighted users can distinguish external from internal links.
 *
 * Supports optional `sponsored` and `nofollow` flags for affiliate/marketing
 * links, automatically adding the appropriate `rel` attributes for SEO compliance.
 */
interface ExternalLinkProps {
  href: string;
  children: ReactNode;
  title?: string;
  /** Mark this as a sponsored/affiliate link (adds rel="sponsored"). */
  sponsored?: boolean;
  /** Mark this link as nofollow (adds rel="nofollow"). */
  nofollow?: boolean;
}
export const ExternalLink = ({
  href,
  children,
  title,
  sponsored = false,
  nofollow = false,
}: ExternalLinkProps) => {
  const relParts = ["noopener", "noreferrer"];
  if (sponsored) relParts.push("sponsored");
  if (nofollow) relParts.push("nofollow");
  return (
    <a
      href={href}
      target="_blank"
      rel={relParts.join(" ")}
      title={title}
      onClick={() => track("outbound_link_click", { url: href, sponsored, nofollow })}
      className="text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:decoration-primary"
    >
      {children}
      {sponsored && (
        <span className="ml-1 inline-block rounded bg-muted px-1.5 py-0.5 text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground">
          Sponsored
        </span>
      )}
      <span className="sr-only"> (opens in a new tab)</span>
      <svg
        aria-hidden="true"
        className="ml-0.5 inline-block h-3.5 w-3.5 align-baseline"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  );
};
export default ExternalLink;
import { useState, useCallback } from "react";
import { Link as LinkIcon, Check } from "lucide-react";
import { track } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";
interface CopyLinkButtonProps {
  /** Article slug. */
  slug: string;
  /** Article title (for analytics). */
  title: string;
  /** Visual variant. */
  variant?: "full" | "icon";
}
/**
 * Copy article link to clipboard.
 *
 * Uses the Clipboard API with a fallback to a hidden input + execCommand
 * for older browsers. Shows visual feedback (checkmark) for 2 seconds.
 *
 * Analytics: fires "copy_link" event on successful copy.
 *
 * Client component only because it uses clipboard state.
 */
const CopyLinkButton = ({ slug, title, variant = "full" }: CopyLinkButtonProps) => {
  const [copied, setCopied] = useState(false);
  const articleUrl = `${siteConfig.url}/blog/${slug}`;
  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
    } catch {
      // Fallback for browsers without Clipboard API
      const input = document.createElement("input");
      input.value = articleUrl;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    track("copy_link", { slug, title, url: articleUrl });
    setTimeout(() => setCopied(false), 2000);
  }, [articleUrl, slug, title]);
  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={copied ? "Link copied" : "Copy article link"}
        aria-pressed={copied}
      >
        {copied ? (
          <Check className="h-4 w-4" aria-hidden />
        ) : (
          <LinkIcon className="h-4 w-4" aria-hidden />
        )}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={copyLink}
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      aria-label={copied ? "Link copied" : "Copy article link"}
      aria-pressed={copied}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-foreground" aria-hidden />
          Copied
        </>
      ) : (
        <>
          <LinkIcon className="h-4 w-4" aria-hidden />
          Copy link
        </>
      )}
    </button>
  );
};
export default CopyLinkButton;
import { Twitter, Linkedin, Share2, Mail, MessageSquare } from "lucide-react";
import { track } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";
interface ShareButtonsProps {
  /** Article slug. */
  slug: string;
  /** Article title. */
  title: string;
  /** Optional description for share text. */
  description?: string;
  /** Visual variant. */
  variant?: "full" | "icon";
}
/**
 * Lightweight social sharing buttons.
 *
 * Avoids loading five separate social SDKs. Instead uses simple
 * intent URLs for Twitter/X and LinkedIn, plus the native Web Share API
 * where supported (mobile, some desktop browsers).
 *
 * Analytics: fires "share_click" for each share action with the target.
 *
 * Accessibility:
 *   - Each button has a descriptive aria-label
 *   - External links have rel="noopener noreferrer"
 *   - Web Share button is a <button> (not a link) since it triggers JS
 *
 * Client component because it uses the navigator.share API.
 */
const ShareButtons = ({ slug, title, description, variant = "full" }: ShareButtonsProps) => {
  const articleUrl = `${siteConfig.url}/blog/${slug}`;
  const shareText = description ?? title;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(articleUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`;
  const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(articleUrl)}&title=${encodeURIComponent(title)}`;
  const hackerNewsUrl = `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(articleUrl)}&t=${encodeURIComponent(title)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(articleUrl)}`;
  const handleWebShare = async () => {
    if (typeof navigator === "undefined" || !navigator.share) return;
    try {
      await navigator.share({
        title,
        text: shareText,
        url: articleUrl,
      });
      track("share_click", { slug, title, target: "native" });
    } catch {
      // User cancelled or share failed — non-throwing
    }
  };
  const handleTwitterShare = () => {
    track("share_click", { slug, title, target: "twitter" });
  };
  const handleLinkedInShare = () => {
    track("share_click", { slug, title, target: "linkedin" });
  };
  const webShareSupported =
    typeof navigator !== "undefined" && typeof navigator.share === "function";
  if (variant === "icon") {
    return (
      <div className="flex items-center gap-2">
        {webShareSupported ? (
          <button
            type="button"
            onClick={handleWebShare}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label={`Share ${title} via device sharing`}
          >
            <Share2 className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleTwitterShare}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label={`Share ${title} on Twitter`}
        >
          <Twitter className="h-4 w-4" aria-hidden />
        </a>
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLinkedInShare}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label={`Share ${title} on LinkedIn`}
        >
          <Linkedin className="h-4 w-4" aria-hidden />
        </a>
        <a
          href={redditUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("share_click", { slug, title, target: "reddit" })}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label={`Share ${title} on Reddit`}
        >
          <MessageSquare className="h-4 w-4" aria-hidden />
        </a>
        <a
          href={emailUrl}
          onClick={() => track("share_click", { slug, title, target: "email" })}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label={`Share ${title} via email`}
        >
          <Mail className="h-4 w-4" aria-hidden />
        </a>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Share
      </span>
      {webShareSupported ? (
        <button
          type="button"
          onClick={handleWebShare}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label={`Share ${title} via device sharing`}
        >
          <Share2 className="h-4 w-4" aria-hidden />
          Share
        </button>
      ) : null}
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleTwitterShare}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={`Share ${title} on Twitter`}
      >
        <Twitter className="h-4 w-4" aria-hidden />
        Twitter
      </a>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleLinkedInShare}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={`Share ${title} on LinkedIn`}
      >
        <Linkedin className="h-4 w-4" aria-hidden />
        LinkedIn
      </a>
      <a
        href={redditUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("share_click", { slug, title, target: "reddit" })}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={`Share ${title} on Reddit`}
      >
        <MessageSquare className="h-4 w-4" aria-hidden />
        Reddit
      </a>
      <a
        href={hackerNewsUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("share_click", { slug, title, target: "hackernews" })}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={`Share ${title} on Hacker News`}
      >
        <Share2 className="h-4 w-4" aria-hidden />
        Hacker News
      </a>
      <a
        href={emailUrl}
        onClick={() => track("share_click", { slug, title, target: "email" })}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={`Share ${title} via email`}
      >
        <Mail className="h-4 w-4" aria-hidden />
        Email
      </a>
    </div>
  );
};
export default ShareButtons;
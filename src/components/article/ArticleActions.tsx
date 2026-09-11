import { useEffect } from "react";
import ShareButtons from "@/components/growth/ShareButtons";
import CopyLinkButton from "@/components/growth/CopyLinkButton";
import { track } from "@/lib/analytics";
interface ArticleActionsProps {
  slug: string;
  title: string;
  description?: string;
}
/**
 * Article share/copy-link controls.
 *
 * Delegates to the growth components (ShareButtons, CopyLinkButton)
 * for the actual share/copy functionality and analytics tracking.
 *
 * Also fires an "article_view" analytics event when the component
 * mounts (i.e. when the article page renders).
 *
 * Client component because ShareButtons and CopyLinkButton use
 * browser APIs (clipboard, navigator.share).
 */
const ArticleActions = ({ slug, title, description }: ArticleActionsProps) => {
  // Track article view on mount
  useEffect(() => {
    track("article_view", { slug, title });
  }, [slug, title]);
  return (
    <div className="flex flex-wrap items-center gap-4">
      <ShareButtons slug={slug} title={title} description={description} />
      <CopyLinkButton slug={slug} title={title} />
    </div>
  );
};
export default ArticleActions;
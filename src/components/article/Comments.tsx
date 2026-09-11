import { useEffect, useRef } from "react";
/**
 * Giscus comment system integration.
 *
 * Lazy-loads the Giscus script only when the component mounts.
 * Configuration is read from env vars:
 *   - VITE_GISCUS_REPO (e.g. "owner/repo")
 *   - VITE_GISCUS_REPO_ID
 *   - VITE_GISCUS_CATEGORY
 *   - VITE_GISCUS_CATEGORY_ID
 *
 * If not configured, the component renders nothing.
 */
interface CommentsProps {
  repo?: string;
  repoId?: string;
  category?: string;
  categoryId?: string;
}
const Comments = ({ repo, repoId, category, categoryId }: CommentsProps) => {
  const ref = useRef<HTMLDivElement>(null);
  // Read from props or env vars
  const giscusRepo = repo ?? import.meta.env.VITE_GISCUS_REPO;
  const giscusRepoId = repoId ?? import.meta.env.VITE_GISCUS_REPO_ID;
  const giscusCategory = category ?? import.meta.env.VITE_GISCUS_CATEGORY ?? "Announcements";
  const giscusCategoryId = categoryId ?? import.meta.env.VITE_GISCUS_CATEGORY_ID;
  useEffect(() => {
    if (!giscusRepo || !giscusRepoId || !giscusCategoryId) return;
    if (!ref.current) return;
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", giscusRepo);
    script.setAttribute("data-repo-id", giscusRepoId);
    script.setAttribute("data-category", giscusCategory);
    script.setAttribute("data-category-id", giscusCategoryId);
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("data-lang", "en");
    script.setAttribute("data-loading", "lazy");
    script.crossOrigin = "anonymous";
    script.async = true;
    ref.current.appendChild(script);
  }, [giscusRepo, giscusRepoId, giscusCategory, giscusCategoryId]);
  if (!giscusRepo || !giscusRepoId || !giscusCategoryId) {
    return null;
  }
  return (
    <section className="mt-16" aria-label="Comments">
      <h2 className="mb-6 font-serif text-2xl font-semibold text-foreground">Comments</h2>
      <div ref={ref} className="giscus" />
    </section>
  );
};
export default Comments;
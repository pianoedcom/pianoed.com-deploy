/**
 * /atom.xml route — Atom 1.0 feed.
 *
 * Generates a valid Atom 1.0 feed from all published posts,
 * complementing the existing RSS 2.0 and JSON Feed formats.
 */
import { useEffect, useState } from "react";
import { listPostsCached, getAllAuthorsCached } from "@/lib/content";
import { buildFeedItems } from "@/lib/seo/feed";
import { atomFeedToXml } from "@/lib/seo/atom-feed";
const AtomFeedPage = () => {
  const [xml, setXml] = useState<string>("");
  useEffect(() => {
    (async () => {
      const [posts, authors] = await Promise.all([listPostsCached(), getAllAuthorsCached()]);
      const authorMap = new Map(authors.map((a) => [a.slug, a]));
      const items = buildFeedItems(posts, authorMap);
      setXml(atomFeedToXml(items));
    })();
  }, []);
  useEffect(() => {
    if (!xml) return;
    const blob = new Blob([xml], { type: "application/atom+xml; charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.location.href = url;
  }, [xml]);
  return null;
};
export default AtomFeedPage;
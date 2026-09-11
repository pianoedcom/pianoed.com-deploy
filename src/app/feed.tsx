/**
 * Feed route — generates /feed.xml (RSS 2.0) on demand from the content source.
 *
 * The feed provides post descriptions (excerpts) rather than full MDX
 * bodies, since the body requires client-side rendering. Each item
 * links to the canonical article URL.
 */
import { useEffect, useState } from "react";
import Seo from "@/components/layout/Seo";
import Container from "@/components/layout/Container";
import { listPostsCached, getAllAuthorsCached } from "@/lib/content";
import { buildFeedItems, feedToXml } from "@/lib/seo/feed";
const FeedPage = () => {
  const [xml, setXml] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const [posts, authors] = await Promise.all([listPostsCached(), getAllAuthorsCached()]);
      const authorMap = new Map(authors.map((a) => [a.slug, a]));
      const items = buildFeedItems(posts, authorMap);
      setXml(feedToXml(items));
    })();
  }, []);
  return (
    <>
      <Seo title="RSS Feed" description="RSS 2.0 feed for Inkwell." path="/feed.xml" noindex />
      <Container className="py-12" width="default">
        <h1 className="mb-6 font-serif text-2xl font-semibold">RSS Feed</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          This feed provides excerpts (post descriptions) rather than full article bodies. Each item
          links to the canonical article URL.
        </p>
        {xml === null ? (
          <p className="text-muted-foreground">Generating feed…</p>
        ) : (
          <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-xs text-muted-foreground">
            {xml}
          </pre>
        )}
      </Container>
    </>
  );
};
export default FeedPage;
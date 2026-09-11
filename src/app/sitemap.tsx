/**
 * Sitemap route — generates /sitemap.xml on demand from the content source.
 *
 * In a Vite SPA there is no server, so this component fetches all content
 * and renders the sitemap XML in a <pre> element, or triggers a download.
 * For production deployments, the sitemap can be pre-built at build time
 * or served by a CDN edge function.
 */
import { useEffect, useState } from "react";
import Seo from "@/components/layout/Seo";
import Container from "@/components/layout/Container";
import {
  listPostsCached,
  getAllCategoriesCached,
  getAllTagsCached,
  getAllAuthorsCached,
} from "@/lib/content";
import { buildSitemapEntries, sitemapToXml } from "@/lib/seo/sitemap";
const SitemapPage = () => {
  const [xml, setXml] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const [posts, categories, tags, authors] = await Promise.all([
        listPostsCached(),
        getAllCategoriesCached(),
        getAllTagsCached(),
        getAllAuthorsCached(),
      ]);
      const entries = buildSitemapEntries({ posts, categories, tags, authors });
      setXml(sitemapToXml(entries));
    })();
  }, []);
  return (
    <>
      <Seo title="Sitemap" description="XML sitemap for Inkwell." path="/sitemap.xml" noindex />
      <Container className="py-12" width="default">
        <h1 className="mb-6 font-serif text-2xl font-semibold">Sitemap</h1>
        {xml === null ? (
          <p className="text-muted-foreground">Generating sitemap…</p>
        ) : (
          <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-xs text-muted-foreground">
            {xml}
          </pre>
        )}
      </Container>
    </>
  );
};
export default SitemapPage;
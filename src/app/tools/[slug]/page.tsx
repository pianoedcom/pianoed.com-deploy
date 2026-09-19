import { Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import Container from "@/components/layout/Container";
import Seo from "@/components/layout/Seo";
import { getTool } from "@/lib/config/tools-registry";
import NotFound from "@/app/not-found";
const ToolDetailPage = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const tool = getTool(slug);
  if (!tool) return <NotFound />;
  const ToolComponent = tool.component;
  return (
    <>
      <Seo
        title={`${tool.title} — Piano Practice Tool`}
        description={tool.description}
        path={`/tools/${tool.slug}`}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: tool.title,
            description: tool.description,
            applicationCategory: "MusicApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <Container className="py-12" width="default">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link to="/tools" className="hover:text-foreground">
            ← All Tools
          </Link>
        </nav>
        <header className="mb-8">
          <p className="eyebrow mb-2">{tool.type}</p>
          <h1 className="display-heading mb-3 text-4xl text-foreground">{tool.title}</h1>
          <p className="text-lg text-muted-foreground">{tool.description}</p>
        </header>
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <Suspense
            fallback={<div className="py-8 text-center text-muted-foreground">Loading…</div>}
          >
            <ToolComponent />
          </Suspense>
        </div>
      </Container>
    </>
  );
};
export default ToolDetailPage;
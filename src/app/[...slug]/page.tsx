import { useMemo } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Container from "@/components/layout/Container";
import Seo from "@/components/layout/Seo";
import MdxRenderer from "@/components/mdx/MdxRenderer";
import { splitFrontmatter } from "@/lib/content/frontmatter";
const pageModules = import.meta.glob("/content/pages/**/*.mdx", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;
interface PageFrontmatter {
  title: string;
  description: string;
  date?: string;
  author?: string;
}
function parsePage(raw: string): { frontmatter: PageFrontmatter; content: string } {
  const { frontmatter, body } = splitFrontmatter(raw);
  return {
    frontmatter: {
      title: (frontmatter.title as string) ?? "Untitled",
      description: (frontmatter.description as string) ?? "",
      date: frontmatter.date as string | undefined,
      author: frontmatter.author as string | undefined,
    },
    content: body,
  };
}
function buildBreadcrumbs(segments: string[]) {
  return segments.map((seg, idx) => {
    const path = "/" + segments.slice(0, idx + 1).join("/");
    const label = seg
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return { label, path };
  });
}
const MdxSubPage = () => {
  const params = useParams();
  const location = useLocation();
  const fullPath = location.pathname.replace(/^\//, "");
  const slug = fullPath || (params["*"] ?? "");
  const pageData = useMemo(() => {
    const key = `/content/pages/${slug}.mdx`;
    if (pageModules[key]) {
      return parsePage(pageModules[key]);
    }
    return null;
  }, [slug]);
  if (!pageData) {
    return (
      <Container className="py-20 text-center">
        <h1 className="display-heading text-3xl">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          The page you're looking for doesn't exist or hasn't been created yet.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
        >
          Back to home
        </Link>
      </Container>
    );
  }
  const segments = slug.split("/").filter(Boolean);
  const breadcrumbs = buildBreadcrumbs(segments);
  return (
    <>
      <Seo
        title={pageData.frontmatter.title}
        description={pageData.frontmatter.description}
        path={`/${slug}`}
      />
      <Container className="py-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            {breadcrumbs.map((crumb, idx) => (
              <li key={crumb.path} className="flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                {idx === breadcrumbs.length - 1 ? (
                  <span className="text-foreground">{crumb.label}</span>
                ) : (
                  <Link to={crumb.path} className="hover:text-foreground">
                    {crumb.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <header className="mb-8">
          <h1 className="display-heading text-4xl">{pageData.frontmatter.title}</h1>
          {pageData.frontmatter.description && (
            <p className="mt-3 text-lg text-muted-foreground">{pageData.frontmatter.description}</p>
          )}
        </header>
        <div className="reading-width">
          <MdxRenderer body={pageData.content} />
        </div>
      </Container>
    </>
  );
};
export default MdxSubPage;
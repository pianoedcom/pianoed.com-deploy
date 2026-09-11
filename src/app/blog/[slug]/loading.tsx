import Container from "@/components/layout/Container";
/**
 * Loading skeleton for the article page — mirrors the article layout
 * with placeholder blocks for header, hero, and body.
 */
const ArticleLoading = () => {
  return (
    <Container className="py-24" width="article">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-10 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="mt-8 space-y-3">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-5/6 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-4/5 rounded bg-muted" />
        </div>
      </div>
    </Container>
  );
};
export default ArticleLoading;
import { lazy, Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SiteShell from "@/components/layout/SiteShell";
import RouteError from "@/app/error";
import Seo from "@/components/layout/Seo";
import { I18nProvider } from "@/lib/i18n/context";
import { siteConfig } from "@/lib/site-config";
import ScrollToTop from "@/components/layout/ScrollToTop";
const Toaster = lazy(() => import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })));
import Home from "@/app/page";
const AboutPage = lazy(() => import("@/app/about/page"));
const NotFound = lazy(() => import("@/app/not-found"));
const ArticlesPage = lazy(() => import("@/app/articles/page"));
const ArticlePage = lazy(() => import("@/app/blog/[slug]/page"));
const BlogPage = lazy(() => import("@/app/blog/page"));
const CategoryPage = lazy(() => import("@/app/category/[slug]/page"));
const TagPage = lazy(() => import("@/app/tag/[slug]/page"));
const AuthorPage = lazy(() => import("@/app/author/[slug]/page"));
const ArchiveYearPage = lazy(() => import("@/app/archive/[year]/page"));
const ArchiveYearMonthPage = lazy(() => import("@/app/archive/[year]/[month]/page"));
const SearchPage = lazy(() => import("@/app/search/page"));
const ToolsPage = lazy(() => import("@/app/tools/page"));
const ToolDetailPage = lazy(() => import("@/app/tools/[slug]/page"));
const ResourcesPage = lazy(() => import("@/app/resources/page"));
const PianoGlossaryPage = lazy(() => import("@/app/resources/piano-glossary/page"));
const PracticeExercisesPage = lazy(() => import("@/app/resources/practice-exercises/page"));
const PracticeExerciseDetailPage = lazy(() => import("@/app/resources/practice-exercises/[slug]/page"));
const SheetMusicLibraryPage = lazy(() => import("@/app/resources/sheet-music-library/page"));
const SheetMusicDetailPage = lazy(() => import("@/app/resources/sheet-music-library/[slug]/page"));
const FAQPage = lazy(() => import("@/app/faq/page"));
const ContactPage = lazy(() => import("@/app/contact/page"));
const CookiePolicyPage = lazy(() => import("@/app/cookie-policy/page"));
const MdxSubPage = lazy(() => import("@/app/[...slug]/page"));
const SitemapPage = lazy(() => import("@/app/sitemap"));
const FeedPage = lazy(() => import("@/app/feed"));
const JsonFeedPage = lazy(() => import("@/app/json-feed"));
const AtomFeedPage = lazy(() => import("@/app/atom-feed"));
const LlmsTxtPage = lazy(() => import("@/app/llms-txt"));
const LlmsFullTxtPage = lazy(() => import("@/app/llms-full-txt"));
const queryClient = new QueryClient();
const RouteFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div
      className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground"
      role="status"
      aria-label="Loading page"
    />
  </div>
);
const App = () => (
  <ErrorBoundary
    fallbackRender={({ error, resetErrorBoundary }) => (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
        <p className="eyebrow mb-3">Fatal Error</p>
        <h1 className="display-heading mb-3 text-4xl">Application error</h1>
        <p className="mb-8 max-w-md text-muted-foreground">
          {error instanceof Error ? error.message : String(error)}
        </p>
        <button
          type="button"
          onClick={() => resetErrorBoundary()}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Reload
        </button>
      </div>
    )}
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <I18nProvider>
          <Suspense fallback={null}>
            <Toaster />
          </Suspense>
          <BrowserRouter>
            <ScrollToTop />
            <Seo title={siteConfig.name} description={siteConfig.description} path="/" />
            <Routes>
              <Route
                path="/"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <Home />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/articles"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <ArticlesPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/articles/:slug"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <ArticlePage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/blog/:slug"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <ArticlePage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/blog"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <BlogPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/category/:slug"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <CategoryPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/tag/:slug"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <TagPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/author/:slug"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <AuthorPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/archive/:year"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <ArchiveYearPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/archive/:year/:month"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <ArchiveYearMonthPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/search"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <SearchPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/tools"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <ToolsPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/tools/:slug"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <ToolDetailPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/resources"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <ResourcesPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/resources/piano-glossary"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <PianoGlossaryPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/resources/practice-exercises"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <PracticeExercisesPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/resources/practice-exercises/:slug"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <PracticeExerciseDetailPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/resources/sheet-music-library"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <SheetMusicLibraryPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/resources/sheet-music-library/:slug"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <SheetMusicDetailPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/resources/*"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <MdxSubPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/faq"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <FAQPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/contact"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <ContactPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/cookie-policy"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <CookiePolicyPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/about"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <AboutPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/pages/*"
                element={
                  <ErrorBoundary FallbackComponent={RouteError}>
                    <SiteShell>
                      <Suspense fallback={<RouteFallback />}>
                        <MdxSubPage />
                      </Suspense>
                    </SiteShell>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/sitemap.xml"
                element={
                  <SiteShell>
                    <Suspense fallback={<RouteFallback />}>
                      <SitemapPage />
                    </Suspense>
                  </SiteShell>
                }
              />
              <Route
                path="/feed.xml"
                element={
                  <SiteShell>
                    <Suspense fallback={<RouteFallback />}>
                      <FeedPage />
                    </Suspense>
                  </SiteShell>
                }
              />
              <Route
                path="/feed.json"
                element={
                  <SiteShell>
                    <Suspense fallback={<RouteFallback />}>
                      <JsonFeedPage />
                    </Suspense>
                  </SiteShell>
                }
              />
              <Route
                path="/atom.xml"
                element={
                  <SiteShell>
                    <Suspense fallback={<RouteFallback />}>
                      <AtomFeedPage />
                    </Suspense>
                  </SiteShell>
                }
              />
              <Route
                path="/llms.txt"
                element={
                  <SiteShell>
                    <Suspense fallback={<RouteFallback />}>
                      <LlmsTxtPage />
                    </Suspense>
                  </SiteShell>
                }
              />
              <Route
                path="/llms-full.txt"
                element={
                  <SiteShell>
                    <Suspense fallback={<RouteFallback />}>
                      <LlmsFullTxtPage />
                    </Suspense>
                  </SiteShell>
                }
              />
              <Route
                path="*"
                element={
                  <SiteShell>
                    <Suspense fallback={<RouteFallback />}>
                      <NotFound />
                    </Suspense>
                  </SiteShell>
                }
              />
            </Routes>
          </BrowserRouter>
        </I18nProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
export default App;
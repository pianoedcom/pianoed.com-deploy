import { Link } from "react-router-dom";
import { Music, Piano, Guitar, Clock, ArrowRight } from "lucide-react";
import Container from "@/components/layout/Container";
import Seo from "@/components/layout/Seo";
import { enabledTools } from "@/lib/config/tools-registry";
import { useI18n } from "@/lib/i18n/context";
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  metronome: Music,
  "piano-note-finder": Piano,
  "scale-chord-reference": Guitar,
  "practice-timer": Clock,
};
const ToolsPage = () => {
  const { t, locale } = useI18n();
  return (
    <>
      <Seo
        title={t("page.tools.seoTitle")}
        description={t("page.tools.seoDescription")}
        path="/tools"
        locale={locale}
      />
      <Container className="py-12">
        <div className="mb-10">
          <p className="eyebrow mb-2">{t("page.tools.eyebrow")}</p>
          <h1 className="display-heading text-4xl">{t("page.tools.title")}</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{t("page.tools.subtitle")}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enabledTools.map((tool) => {
            const Icon = ICONS[tool.slug] ?? Music;
            return (
              <Link
                key={tool.slug}
                to={`/tools/${tool.slug}`}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-accent/50 hover:bg-accent/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h2 className="mb-2 text-lg font-semibold text-foreground">{tool.title}</h2>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                  {t("page.tools.launch")}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </Container>
    </>
  );
};
export default ToolsPage;
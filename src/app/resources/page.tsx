import { Link } from "react-router-dom";
import { BookOpen, FileText, Music, Library, ArrowRight } from "lucide-react";
import Container from "@/components/layout/Container";
import Seo from "@/components/layout/Seo";
import { enabledResources } from "@/lib/config/resources-registry";
import { useI18n } from "@/lib/i18n/context";
const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  directory: Library,
  glossary: BookOpen,
  guide: FileText,
  downloadable: Music,
};
const ResourcesPage = () => {
  const { t, locale } = useI18n();
  const TYPE_LABELS: Record<string, string> = {
    directory: t("page.resources.typeDirectory"),
    glossary: t("page.resources.typeGlossary"),
    guide: t("page.resources.typeGuide"),
    downloadable: t("page.resources.typeDownloadable"),
  };
  return (
    <>
      <Seo
        title={t("page.resources.seoTitle")}
        description={t("page.resources.seoDescription")}
        path="/resources"
        locale={locale}
      />
      <Container className="py-12">
        <div className="mb-10">
          <p className="eyebrow mb-2">{t("page.resources.eyebrow")}</p>
          <h1 className="display-heading text-4xl">{t("page.resources.title")}</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {t("page.resources.subtitle")}
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enabledResources.map((resource) => {
            const Icon = TYPE_ICONS[resource.type] ?? BookOpen;
            return (
              <Link
                key={resource.slug}
                to={`/resources/${resource.slug}`}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-accent/50 hover:bg-accent/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <span className="mb-2 inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {TYPE_LABELS[resource.type] ?? resource.type}
                </span>
                <h3 className="mb-1.5 text-base font-semibold text-foreground">{resource.title}</h3>
                <p className="text-sm text-muted-foreground">{resource.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                  {t("page.resources.explore")}
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
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
export default ResourcesPage;
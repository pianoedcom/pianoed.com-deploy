import Seo from "@/components/layout/Seo";
import Container from "@/components/layout/Container";
import { siteConfig } from "@/lib/site-config";
import { useI18n } from "@/lib/i18n/context";
/**
 * About page — describes the site's mission and positioning.
 */
const AboutPage = () => {
  const { t, locale } = useI18n();
  return (
    <>
      <Seo
        title={t("page.about.seoTitle")}
        description={t("page.about.seoDescription")}
        path="/about"
        locale={locale}
      />
      <Container className="py-12 sm:py-16" width="default">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow mb-3">{t("page.about.eyebrow")}</p>
          <h1 className="display-heading mb-6 text-4xl text-foreground sm:text-5xl">
            {t("page.about.title", { siteName: siteConfig.name })}
          </h1>
          <div className="prose-body space-y-5 text-muted-foreground">
            <p>{t("page.about.body1", { siteName: siteConfig.name })}</p>
            <p>{t("page.about.body2", { siteName: siteConfig.name })}</p>
            <p>{t("page.about.body3", { siteName: siteConfig.name })}</p>
          </div>
        </div>
      </Container>
    </>
  );
};
export default AboutPage;
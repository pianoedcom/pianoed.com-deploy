import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Seo from "@/components/layout/Seo";
import Container from "@/components/layout/Container";
import { siteConfig } from "@/lib/site-config";
import { useI18n } from "@/lib/i18n/context";

/**
 * About page — richly detailed mission, vision, and values for PianoEd.
 *
 * Fully localized across all supported languages (en, es, fr, de, hi, ar)
 * using the site's i18n translation system and dictionary tokens.
 *
 * Sections:
 *   1. Hero banner — headline + sub-headline
 *   2. Mission statement — the "why"
 *   3. Vision — the long-term north star
 *   4. Five content pillars — what the site covers
 *   5. What We Believe — guiding principles / values
 *   6. The Community — who we're for
 *   7. CTA — invitation to explore
 */
const AboutPage = () => {
  const { t, locale, setLocale } = useI18n();
  const { locale: routeLocale } = useParams<{ locale?: string }>();

  // Synchronize active locale if visiting via a prefixed route (e.g. /es/about)
  useEffect(() => {
    if (routeLocale && routeLocale !== locale) {
      setLocale(routeLocale);
    }
  }, [routeLocale, locale, setLocale]);

  const pillars = [
    {
      icon: "♩",
      title: t("page.about.pillars.p1.title"),
      description: t("page.about.pillars.p1.desc"),
    },
    {
      icon: "🎹",
      title: t("page.about.pillars.p2.title"),
      description: t("page.about.pillars.p2.desc"),
    },
    {
      icon: "📰",
      title: t("page.about.pillars.p3.title"),
      description: t("page.about.pillars.p3.desc"),
    },
    {
      icon: "🎼",
      title: t("page.about.pillars.p4.title"),
      description: t("page.about.pillars.p4.desc"),
    },
    {
      icon: "🔧",
      title: t("page.about.pillars.p5.title"),
      description: t("page.about.pillars.p5.desc"),
    },
  ];

  const beliefs = [
    {
      heading: t("page.about.values.v1.title"),
      body: t("page.about.values.v1.body"),
    },
    {
      heading: t("page.about.values.v2.title"),
      body: t("page.about.values.v2.body"),
    },
    {
      heading: t("page.about.values.v3.title"),
      body: t("page.about.values.v3.body"),
    },
    {
      heading: t("page.about.values.v4.title"),
      body: t("page.about.values.v4.body", { siteName: siteConfig.name }),
    },
    {
      heading: t("page.about.values.v5.title"),
      body: t("page.about.values.v5.body"),
    },
  ];

  const exploreHref = locale === "en" ? "/blog" : `/${locale}/blog`;
  const practiceHref =
    locale === "en"
      ? "/resources/practice-exercises"
      : `/${locale}/resources/practice-exercises`;

  return (
    <>
      <Seo
        title={t("page.about.seoTitle")}
        description={t("page.about.seoDescription")}
        path={locale === "en" ? "/about" : `/${locale}/about`}
        locale={locale}
      />

      {/* ── 1. HERO BANNER ─────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-[#0c0406] text-white">
        {/* Cinematic Grand Piano Library Background (Mirrors Landing Page Hero) */}
        <div className="relative min-h-[500px] sm:min-h-[560px] lg:min-h-[620px] w-full flex flex-col justify-center">
          {/* Background Image Layer */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/hero/library-grand-piano.jpg"
              alt="Steinway & Sons Concert Grand Piano in Classical Salon Library"
              className="h-full w-full object-cover object-center lg:object-[center_35%]"
              loading="eager"
            />
            {/* Horizontal gradient darkening left for text while keeping piano brightly visible on right */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c0406]/95 via-[#0c0406]/85 sm:via-[#0c0406]/75 lg:via-[#0c0406]/50 to-transparent" />
            {/* Top and bottom subtle vignettes */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0c0406]/60 via-transparent to-[#0c0406]" />
          </div>

          {/* Decorative piano-key accent strip at the top */}
          <div className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-80" />

          {/* Left-Aligned Hero Content Matching Landing Hero */}
          <div className="relative z-10 my-auto py-16 sm:py-20 lg:py-24">
            <Container width="default">
              <div className="max-w-2xl text-left">
                {/* Eyebrow */}
                <div className="mb-4 inline-flex items-center gap-2">
                  <span className="h-px w-6 bg-[#d4af37]" />
                  <span
                    className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-[#d4af37] uppercase"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {t("page.about.hero.eyebrow")}
                  </span>
                </div>

                {/* Display Title */}
                <h1
                  className="font-serif text-4xl sm:text-5xl lg:text-[3.75rem] font-medium leading-[1.12] text-[#fcf9f2] mb-5 tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {t("page.about.hero.title")}
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg lg:text-xl text-[#d4c3b3] leading-relaxed max-w-xl font-light opacity-95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                  {t("page.about.hero.subtitle", { siteName: siteConfig.name })}
                </p>
              </div>
            </Container>
          </div>

          {/* Bottom hairline transition into body */}
          <div className="absolute inset-x-0 bottom-0 z-10 h-[3px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-40" />
        </div>
      </section>

      {/* ── 2. MISSION ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border/60 bg-background">
        <Container className="py-16 sm:py-20" width="default">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-4 mb-8">
              <div
                className="h-px flex-1 opacity-30"
                style={{
                  background: "linear-gradient(90deg, transparent, #d4af37)",
                }}
              />
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8b6914] dark:text-[#d4af37]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {t("page.about.mission.eyebrow")}
              </p>
              <div
                className="h-px flex-1 opacity-30"
                style={{
                  background: "linear-gradient(270deg, transparent, #d4af37)",
                }}
              />
            </div>

            <blockquote
              className="text-center font-serif text-2xl sm:text-3xl font-semibold leading-snug text-[#1f1517] dark:text-stone-100"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {t("page.about.mission.quote")}
            </blockquote>

            <div className="mt-10 space-y-5 text-base sm:text-lg leading-relaxed text-[#241a1c] dark:text-stone-200">
              <p className="text-justify leading-relaxed">
                {t("page.about.mission.body1", { siteName: siteConfig.name })}
              </p>
              <p className="text-justify leading-relaxed">
                {t("page.about.mission.body2", { siteName: siteConfig.name })}
              </p>
              <p className="text-justify leading-relaxed">
                {t("page.about.mission.body3", { siteName: siteConfig.name })}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 3. VISION ──────────────────────────────────────────────────────── */}
      <section className="border-b border-border/60 bg-gradient-to-b from-[#fdfbf6] to-[#f9f4e8] dark:from-[#190e11] dark:to-[#130a0d]">
        <Container className="py-16 sm:py-20" width="default">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-4 mb-8">
              <div
                className="h-px flex-1 opacity-20"
                style={{
                  background: "linear-gradient(90deg, transparent, #8b6914)",
                }}
              />
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8b6914]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {t("page.about.vision.eyebrow")}
              </p>
              <div
                className="h-px flex-1 opacity-20"
                style={{
                  background: "linear-gradient(270deg, transparent, #8b6914)",
                }}
              />
            </div>

            <h2
              className="mb-8 text-center font-serif text-2xl sm:text-3xl font-bold text-[#1f1517] dark:text-stone-100"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {t("page.about.vision.title")}
            </h2>

            <div className="space-y-5 text-base sm:text-lg leading-relaxed text-[#241a1c] dark:text-stone-200">
              <p className="text-justify leading-relaxed">
                {t("page.about.vision.body1", { siteName: siteConfig.name })}
              </p>
              <p className="text-justify leading-relaxed">
                {t("page.about.vision.body2", { siteName: siteConfig.name })}
              </p>
              <p className="text-justify leading-relaxed">
                {t("page.about.vision.body3", { siteName: siteConfig.name })}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 4. FIVE PILLARS ────────────────────────────────────────────────── */}
      <section className="border-b border-border/60 bg-background">
        <Container className="py-16 sm:py-20" width="default">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <p
                className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8b6914] dark:text-[#d4af37]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {t("page.about.pillars.eyebrow")}
              </p>
              <h2
                className="font-serif text-2xl sm:text-3xl font-bold text-[#1f1517] dark:text-stone-100"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {t("page.about.pillars.title")}
              </h2>
              <p className="mt-4 text-base text-[#241a1c]/80 dark:text-stone-300 max-w-xl mx-auto text-center">
                {t("page.about.pillars.subtitle")}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-[#d4af37]/40 hover:shadow-[0_4px_24px_rgba(212,175,55,0.08)]"
                >
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))",
                      border: "1px solid rgba(212,175,55,0.25)",
                    }}
                  >
                    {pillar.icon}
                  </div>
                  <h3
                    className="mb-2 font-serif text-lg font-semibold text-[#1f1517] dark:text-stone-100"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {pillar.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#2e2023] dark:text-stone-300 text-justify">
                    {pillar.description}
                  </p>
                  {/* Subtle gold bottom accent on hover */}
                  <div
                    className="absolute inset-x-6 bottom-0 h-[1px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, #d4af37, transparent)",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── 5. WHAT WE BELIEVE ─────────────────────────────────────────────── */}
      <section className="border-b border-border/60 bg-gradient-to-b from-[#fdfbf6] to-[#f9f4e8] dark:from-[#190e11] dark:to-[#130a0d]">
        <Container className="py-16 sm:py-20" width="default">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <p
                className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8b6914] dark:text-[#d4af37]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {t("page.about.values.eyebrow")}
              </p>
              <h2
                className="font-serif text-2xl sm:text-3xl font-bold text-[#1f1517] dark:text-stone-100"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {t("page.about.values.title")}
              </h2>
            </div>

            <div className="space-y-8">
              {beliefs.map((belief, idx) => (
                <div key={idx} className="flex gap-5">
                  <div className="mt-1 shrink-0">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-[#8b6914] dark:text-[#d4af37] bg-[rgba(139,105,20,0.12)] dark:bg-[rgba(212,175,55,0.15)] border border-[rgba(139,105,20,0.25)] dark:border-[rgba(212,175,55,0.3)]"
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      {idx + 1}
                    </div>
                  </div>
                  <div>
                    <h3
                      className="mb-1.5 font-serif text-lg font-semibold text-[#1f1517] dark:text-stone-100"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {belief.heading}
                    </h3>
                    <p className="text-base leading-relaxed text-[#241a1c] dark:text-stone-200 text-justify">
                      {belief.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── 6. THE COMMUNITY ───────────────────────────────────────────────── */}
      <section className="border-b border-border/60 bg-background">
        <Container className="py-16 sm:py-20" width="default">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-4 mb-8">
              <div
                className="h-px flex-1 opacity-30"
                style={{ background: "linear-gradient(90deg, transparent, #d4af37)" }}
              />
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8b6914] dark:text-[#d4af37]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {t("page.about.community.eyebrow")}
              </p>
              <div
                className="h-px flex-1 opacity-30"
                style={{ background: "linear-gradient(270deg, transparent, #d4af37)" }}
              />
            </div>

            <h2
              className="mb-8 text-center font-serif text-2xl sm:text-3xl font-bold text-[#1f1517] dark:text-stone-100"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {t("page.about.community.title")}
            </h2>

            <div className="space-y-5 text-base sm:text-lg leading-relaxed text-[#241a1c] dark:text-stone-200">
              <p className="text-justify leading-relaxed">
                {t("page.about.community.body1")}
              </p>
              <p className="text-justify leading-relaxed">
                {t("page.about.community.body2")}
              </p>
              <p className="text-justify leading-relaxed">
                {t("page.about.community.body3", { siteName: siteConfig.name })}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 7. CLOSING CTA ─────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0d0405 0%, #1a0b0e 40%, #0f0a00 75%, #0d0405 100%)",
        }}
      >
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-40" />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4af37' fill-opacity='1'%3E%3Cpath d='M30 0 L35 10 L30 20 L25 10 Z' /%3E%3Cpath d='M0 30 L10 25 L20 30 L10 35 Z' /%3E%3Cpath d='M60 30 L50 25 L40 30 L50 35 Z' /%3E%3Cpath d='M30 60 L35 50 L30 40 L25 50 Z' /%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />

        <Container className="relative py-20 sm:py-28 text-center" width="default">
          <p
            className="mb-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#d4af37] opacity-90"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {t("page.about.cta.eyebrow")}
          </p>
          <h2
            className="mx-auto max-w-2xl font-serif font-bold leading-tight tracking-tight text-transparent bg-clip-text"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontFamily: "'Playfair Display', Georgia, serif",
              backgroundImage:
                "linear-gradient(180deg, #fff2db 0%, #f7dfb0 40%, #c99d42 100%)",
            }}
          >
            {t("page.about.cta.title")}
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[#f5ecd7] opacity-95 text-justify sm:text-center">
            {t("page.about.cta.subtitle")}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to={exploreHref}
              className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-[#0d0405] transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-100"
              style={{
                background: "linear-gradient(135deg, #d4af37, #f0cf6e, #c99d42)",
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              {t("page.about.cta.explore")}
            </Link>
            <Link
              to={practiceHref}
              className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 px-8 py-3 text-sm font-semibold text-[#d4af37] transition-all duration-300 hover:border-[#d4af37]/70 hover:bg-[#d4af37]/10"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {t("page.about.cta.practice")}
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
};

export default AboutPage;
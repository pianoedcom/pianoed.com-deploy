import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, BookOpen, Sparkles, FilterX } from "lucide-react";
import Container from "@/components/layout/Container";
import Seo from "@/components/layout/Seo";
import { useI18n } from "@/lib/i18n/context";
import {
  GLOSSARY_TERMS,
  getTermsByLetter,
  type GlossaryCategory,
  type GlossaryTerm,
} from "@/lib/content/glossary-data";
import {
  GlossaryItem,
  GlossaryAlphabetNav,
  GlossarySearch,
  GlossaryCategoryFilter,
} from "@/components/glossary";

export const PianoGlossaryPage = () => {
  const { t, locale } = useI18n();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | "All">("All");

  // Filtered terms based on search and category
  const filteredTerms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return GLOSSARY_TERMS.filter((term) => {
      // Category filter
      if (selectedCategory !== "All" && term.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (!query) return true;

      const localized = term.translations?.[locale];
      const matchTerm = term.term.toLowerCase().includes(query);
      const matchId = term.id.toLowerCase().includes(query);
      const matchAliases = term.aliases?.some((a) => a.toLowerCase().includes(query));
      const matchCategory = term.category.toLowerCase().includes(query);
      const matchDef = term.definition.toLowerCase().includes(query);
      const matchAnalogy = term.analogy.toLowerCase().includes(query);

      const matchLocName = localized?.localizedName?.toLowerCase().includes(query);
      const matchLocDef = localized?.definition?.toLowerCase().includes(query);
      const matchLocAnalogy = localized?.analogy?.toLowerCase().includes(query);

      return (
        matchTerm ||
        matchId ||
        matchAliases ||
        matchCategory ||
        matchDef ||
        matchAnalogy ||
        matchLocName ||
        matchLocDef ||
        matchLocAnalogy
      );
    });
  }, [searchQuery, selectedCategory, locale]);

  // Group terms by letter
  const termsByLetter = useMemo(() => {
    return getTermsByLetter(filteredTerms);
  }, [filteredTerms]);

  // Set of letters that currently have terms
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    for (const [letter, terms] of Object.entries(termsByLetter)) {
      if (terms.length > 0) {
        letters.add(letter);
      }
    }
    return letters;
  }, [termsByLetter]);

  // Category counts based on active search
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: GLOSSARY_TERMS.length };
    for (const term of GLOSSARY_TERMS) {
      counts[term.category] = (counts[term.category] || 0) + 1;
    }
    return counts;
  }, []);

  // Handle direct hash navigation (#accelerando, #letter-a, etc.)
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace("#", "");
      const elem = document.getElementById(targetId);
      if (elem) {
        setTimeout(() => {
          const navOffset = 120;
          const elementPosition = elem.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }, 100);
      }
    }
  }, [location.hash]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  return (
    <>
      <Seo
        title={t("page.glossary.seoTitle", { defaultValue: "Piano Terminology Glossary — PianoEd" })}
        description={t("page.glossary.seoDescription", {
          defaultValue:
            "A beginner-friendly A–Z glossary of piano terms, from dynamics and tempo markings to theory, notation, pedals, and piano anatomy.",
        })}
        path="/resources/piano-glossary"
        locale={locale}
      />

      <Container className="py-8 sm:py-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-foreground transition-colors">
                {t("nav.home", { defaultValue: "Home" })}
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              <Link to="/resources" className="hover:text-foreground transition-colors">
                {t("page.resources.eyebrow", { defaultValue: "Resources" })}
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="text-foreground font-medium" aria-current="page">
                {t("page.glossary.title", { defaultValue: "Piano Glossary" })}
              </span>
            </li>
          </ol>
        </nav>

        {/* Hero Header */}
        <header className="mb-10 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-0.5 text-xs font-semibold text-accent">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{t("page.glossary.badge", { defaultValue: "Reference & Learning" })}</span>
          </div>

          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t("page.glossary.title", { defaultValue: "Piano Glossary" })}
          </h1>

          <p className="mt-4 text-lg sm:text-xl text-muted-foreground leading-relaxed">
            {t("page.glossary.intro", {
              defaultValue:
                "Welcome! Whether you're sitting down at the keys for the very first time or brushing up on the basics, this glossary explains piano terms in plain language, with a mental picture or practice tip for each one.",
            })}
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/40 rounded-lg p-3 border border-border/70">
            <Sparkles className="h-4 w-4 text-accent shrink-0" />
            <span>
              {locale !== "en"
                ? t("page.glossary.i18nNote", {
                    defaultValue:
                      "Musical terms remain in English for universal sheet music reading, with localized definitions and analogies provided below.",
                  })
                : "Looking for a quick definition? Use the A–Z index below to jump straight to any letter, or filter by category."}
            </span>
          </div>
        </header>

        {/* Search & Category Filter */}
        <section aria-label="Glossary search and filters" className="mb-4">
          <GlossarySearch
            query={searchQuery}
            onChange={setSearchQuery}
            totalTerms={GLOSSARY_TERMS.length}
            filteredCount={filteredTerms.length}
            placeholder={t("page.glossary.searchPlaceholder", {
              defaultValue: "Search terms, Italian markings, pedals, or theory…",
            })}
          />

          <GlossaryCategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryCounts={categoryCounts}
            allLabel={t("page.glossary.allCategories", { defaultValue: "All Categories" })}
          />
        </section>

        {/* Top A-Z Alphabet Jump Navigation */}
        <GlossaryAlphabetNav
          availableLetters={availableLetters}
        />

        {/* Terms Content List */}
        {filteredTerms.length === 0 ? (
          <div className="my-16 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <FilterX className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
            <h3 className="text-xl font-bold text-foreground">
              {t("page.glossary.noResultsTitle", { defaultValue: "No terms match your search" })}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {t("page.glossary.noResultsDesc", {
                defaultValue: "Try searching for a different keyword or clear active filters.",
              })}
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("page.glossary.clearFilters", { defaultValue: "Clear filters" })}
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(termsByLetter).map(([letter, terms]) => {
              if (terms.length === 0) return null;

              return (
                <section
                  key={letter}
                  id={`letter-${letter.toLowerCase()}`}
                  aria-labelledby={`heading-letter-${letter.toLowerCase()}`}
                  className="scroll-mt-36"
                >
                  <div className="mb-6 flex items-center gap-3 border-b-2 border-primary/20 pb-2">
                    <span
                      id={`heading-letter-${letter.toLowerCase()}`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-serif text-2xl font-bold text-primary-foreground shadow-sm"
                    >
                      {letter}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {terms.length} {terms.length === 1 ? "term" : "terms"}
                    </span>
                  </div>

                  <div className="grid gap-6 sm:gap-7">
                    {terms.map((term: GlossaryTerm) => {
                      const loc = term.translations?.[locale];

                      return (
                        <GlossaryItem
                          key={term.id}
                          id={term.id}
                          term={term.term}
                          category={term.category}
                          categoryLabel={loc?.categoryLabel}
                          aliases={term.aliases}
                          definition={loc?.definition || term.definition}
                          analogy={loc?.analogy || term.analogy}
                          localizedName={loc?.localizedName}
                        />
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </Container>
    </>
  );
};

export default PianoGlossaryPage;

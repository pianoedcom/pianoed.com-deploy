import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import Container from "@/components/layout/Container";
import Seo from "@/components/layout/Seo";
import { useI18n } from "@/lib/i18n/context";
interface FAQItem {
  question: string;
  answer: string;
  category: string;
}
const FAQPage = () => {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(t("page.faq.categoryAll"));
  const faqData: FAQItem[] = [
    {
      category: t("page.faq.categoryGeneral"),
      question: t("page.faq.q1.question"),
      answer: t("page.faq.q1.answer"),
    },
    {
      category: t("page.faq.categoryGeneral"),
      question: t("page.faq.q2.question"),
      answer: t("page.faq.q2.answer"),
    },
    {
      category: t("page.faq.categoryContent"),
      question: t("page.faq.q3.question"),
      answer: t("page.faq.q3.answer"),
    },
    {
      category: t("page.faq.categoryContent"),
      question: t("page.faq.q4.question"),
      answer: t("page.faq.q4.answer"),
    },
    {
      category: t("page.faq.categoryTools"),
      question: t("page.faq.q5.question"),
      answer: t("page.faq.q5.answer"),
    },
    {
      category: t("page.faq.categoryTechnical"),
      question: t("page.faq.q6.question"),
      answer: t("page.faq.q6.answer"),
    },
  ];
  const categories = [
    t("page.faq.categoryAll"),
    ...Array.from(new Set(faqData.map((f) => f.category))),
  ];
  const filtered = useMemo(() => {
    return faqData.filter((item) => {
      const matchesQuery =
        !query ||
        item.question.toLowerCase().includes(query.toLowerCase()) ||
        item.answer.toLowerCase().includes(query.toLowerCase());
      const matchesCategory =
        activeCategory === t("page.faq.categoryAll") || item.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeCategory, locale]);
  return (
    <>
      <Seo
        title={t("page.faq.seoTitle")}
        description={t("page.faq.seoDescription")}
        path="/faq"
        locale={locale}
      />
      <Container className="py-12">
        <div className="mb-8">
          <p className="eyebrow mb-2">{t("page.faq.eyebrow")}</p>
          <h1 className="display-heading text-4xl">{t("page.faq.title")}</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            {t("page.faq.subtitle")}{" "}
            <a href="/contact" className="text-accent hover:underline">
              {t("page.faq.contactUs")}
            </a>
            .
          </p>
        </div>
        {/* Search + filter */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              placeholder={t("page.faq.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        {/* FAQ items */}
        <div className="space-y-4">
          {filtered.map((item, idx) => (
            <details
              key={idx}
              className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-accent/30"
            >
              <summary className="flex cursor-pointer items-center justify-between text-base font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                {item.question}
                <span className="ml-2 text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
            </details>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">{t("page.faq.noResults")}</p>
          )}
        </div>
      </Container>
    </>
  );
};
export default FAQPage;
/**
 * Translation banner — shows available translations for an article.
 *
 * Displayed prominently at the top of an article when foreign language
 * versions are available. Users can switch between language versions
 * for that specific article without changing the global UI site locale.
 */
import { Link } from "react-router-dom";
import { Globe } from "lucide-react";
import type { ArticleTranslation } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

interface TranslationBannerProps {
  translations: ArticleTranslation[];
  className?: string;
}

export function TranslationBanner({ translations, className }: TranslationBannerProps) {
  if (!translations || translations.length <= 1) return null;

  return (
    <nav
      aria-label="Article translations"
      className={cn(
        "mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-border/70 bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground transition-colors",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 font-medium text-foreground pr-1">
        <Globe className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        <span>Read this article in:</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {translations.map((tr) => {
          const path = `/blog/${tr.slug}`;
          const isCurrent = tr.isCurrent;

          if (isCurrent) {
            return (
              <span
                key={tr.locale}
                aria-current="page"
                className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary border border-primary/30"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                {tr.nativeName}
              </span>
            );
          }

          return (
            <Link
              key={tr.locale}
              to={path}
              className="inline-flex items-center rounded-md border border-border/80 bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-primary/50 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              title={`Read in ${tr.localeName} (${tr.nativeName})`}
            >
              {tr.nativeName}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default TranslationBanner;
import { useState, type ReactNode } from "react";
import { Link2, Check } from "lucide-react";
import { Definition } from "./Definition";
import { Analogy } from "./Analogy";

export interface GlossaryItemProps {
  id: string;
  term: string; // The English term name
  category?: string;
  categoryLabel?: string;
  aliases?: string | string[];
  definition?: string;
  analogy?: string;
  localizedName?: string;
  children?: ReactNode;
}

const CATEGORY_PILL_STYLES: Record<string, string> = {
  "Piano Anatomy": "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20",
  Dynamics: "bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/20",
  Notation: "bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/20",
  "Music Theory": "bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-500/20",
  Technique: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20",
  Tempo: "bg-orange-500/10 text-orange-800 dark:text-orange-300 border-orange-500/20",
};

export const GlossaryItem = ({
  id,
  term,
  category,
  categoryLabel,
  aliases,
  definition,
  analogy,
  localizedName,
  children,
}: GlossaryItemProps) => {
  const [copied, setCopied] = useState(false);

  const aliasList = Array.isArray(aliases)
    ? aliases
    : aliases
    ? aliases.split(",").map((a) => a.trim())
    : [];

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const pillClass = category
    ? CATEGORY_PILL_STYLES[category] ?? "bg-muted text-muted-foreground border-border"
    : "bg-muted text-muted-foreground border-border";

  return (
    <article
      id={id}
      data-category={category}
      className="group relative scroll-mt-28 rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm transition-all hover:border-accent/40 target:border-accent target:ring-2 target:ring-accent/40"
    >
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2 border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              <a
                href={`#${id}`}
                className="hover:text-accent transition-colors"
                title={`Permalink to ${term}`}
              >
                {term}
              </a>
            </h3>

            <button
              type="button"
              onClick={handleCopyLink}
              aria-label={`Copy link to ${term}`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground opacity-70 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-accent"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Link2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {localizedName && localizedName !== term && (
            <p className="mt-0.5 text-sm font-medium text-accent">
              {localizedName}
            </p>
          )}

          {aliasList.length > 0 && (
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-medium">Also known as:</span>
              {aliasList.map((alias) => (
                <span
                  key={alias}
                  className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground"
                >
                  {alias}
                </span>
              ))}
            </div>
          )}
        </div>

        {category && (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${pillClass}`}
          >
            {categoryLabel || category}
          </span>
        )}
      </header>

      <div className="prose prose-stone dark:prose-invert max-w-none">
        {definition && <Definition>{definition}</Definition>}
        {analogy && <Analogy>{analogy}</Analogy>}
        {children}
      </div>
    </article>
  );
};

export default GlossaryItem;

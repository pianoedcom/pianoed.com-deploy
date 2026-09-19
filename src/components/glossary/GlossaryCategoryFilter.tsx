import { GLOSSARY_CATEGORIES, type GlossaryCategory } from "@/lib/content/glossary-data";

interface GlossaryCategoryFilterProps {
  selectedCategory: GlossaryCategory | "All";
  onSelectCategory: (category: GlossaryCategory | "All") => void;
  categoryCounts: Record<string, number>;
  allLabel?: string;
}

const CATEGORY_COLORS: Record<GlossaryCategory, string> = {
  "Piano Anatomy": "border-emerald-600/30 text-emerald-800 dark:text-emerald-300 bg-emerald-500/10",
  Dynamics: "border-rose-600/30 text-rose-800 dark:text-rose-300 bg-rose-500/10",
  Notation: "border-sky-600/30 text-sky-800 dark:text-sky-300 bg-sky-500/10",
  "Music Theory": "border-indigo-600/30 text-indigo-800 dark:text-indigo-300 bg-indigo-500/10",
  Technique: "border-amber-600/30 text-amber-800 dark:text-amber-300 bg-amber-500/10",
  Tempo: "border-orange-600/30 text-orange-800 dark:text-orange-300 bg-orange-500/10",
};

export const GlossaryCategoryFilter = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  allLabel = "All Categories",
}: GlossaryCategoryFilterProps) => {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-1.5 sm:gap-2">
      <button
        type="button"
        onClick={() => onSelectCategory("All")}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
          selectedCategory === "All"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "border border-border bg-card text-foreground hover:bg-accent/10"
        }`}
      >
        <span>{allLabel}</span>
        <span
          className={`rounded-full px-1.5 py-0.2 text-[10px] ${
            selectedCategory === "All"
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {categoryCounts["All"] ?? 0}
        </span>
      </button>

      {GLOSSARY_CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category;
        const count = categoryCounts[category] ?? 0;
        const colorClasses = CATEGORY_COLORS[category];

        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelectCategory(category)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
              isSelected
                ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                : `border ${colorClasses} hover:opacity-80`
            }`}
          >
            <span>{category}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                isSelected
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted/80 text-foreground"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default GlossaryCategoryFilter;

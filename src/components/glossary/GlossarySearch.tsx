import { Search, X } from "lucide-react";

interface GlossarySearchProps {
  query: string;
  onChange: (query: string) => void;
  totalTerms: number;
  filteredCount: number;
  placeholder?: string;
}

export const GlossarySearch = ({
  query,
  onChange,
  totalTerms,
  filteredCount,
  placeholder = "Search terms, aliases, or concepts…",
}: GlossarySearchProps) => {
  return (
    <div className="relative mb-6">
      <div className="relative flex items-center">
        <Search
          className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-10 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          aria-label="Search glossary terms"
        />
        {query && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Clear search query"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing <strong className="text-foreground">{filteredCount}</strong> of {totalTerms} terms
        </span>
        {query && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-accent underline underline-offset-2 hover:opacity-80"
          >
            Clear filter
          </button>
        )}
      </div>
    </div>
  );
};

export default GlossarySearch;

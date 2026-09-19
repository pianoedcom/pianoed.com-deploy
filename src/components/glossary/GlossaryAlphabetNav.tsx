import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

interface GlossaryAlphabetNavProps {
  availableLetters: Set<string>;
  activeLetter?: string;
  onSelectLetter?: (letter: string) => void;
}

const ALL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const GlossaryAlphabetNav = ({
  availableLetters,
  activeLetter,
  onSelectLetter,
}: GlossaryAlphabetNavProps) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 280);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLetterClick = (e: React.MouseEvent, letter: string) => {
    e.preventDefault();
    if (onSelectLetter) {
      onSelectLetter(letter);
    }
    const target = document.getElementById(`letter-${letter.toLowerCase()}`);
    if (target) {
      const navOffset = 130;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      // update hash without jumping
      history.replaceState(null, "", `#letter-${letter.toLowerCase()}`);
    }
  };

  return (
    <nav
      aria-label="Glossary alphabet jump navigation"
      className={`sticky top-16 z-30 mb-8 rounded-xl border border-border bg-card/95 p-2 backdrop-blur-md transition-all sm:p-3 ${
        isSticky ? "shadow-md shadow-primary/5" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 flex-wrap items-center justify-center gap-1 sm:gap-1.5">
          {ALL_LETTERS.map((letter) => {
            const hasTerms = availableLetters.has(letter);
            const isActive = activeLetter === letter;

            if (!hasTerms) {
              return (
                <span
                  key={letter}
                  aria-disabled="true"
                  className="flex h-7 w-7 select-none items-center justify-center rounded text-xs font-medium text-muted-foreground/30 sm:h-8 sm:w-8 sm:text-sm"
                >
                  {letter}
                </span>
              );
            }

            return (
              <a
                key={letter}
                href={`#letter-${letter.toLowerCase()}`}
                onClick={(e) => handleLetterClick(e, letter)}
                aria-current={isActive ? "true" : undefined}
                className={`flex h-7 w-7 items-center justify-center rounded text-xs font-bold transition-all sm:h-8 sm:w-8 sm:text-sm ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm scale-110"
                    : "text-foreground hover:bg-accent/15 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                }`}
              >
                {letter}
              </a>
            );
          })}
        </div>

        {isSticky && (
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll back to top"
            className="hidden sm:inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-secondary/60 px-2.5 text-xs font-medium text-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-accent"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            <span>Top</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default GlossaryAlphabetNav;

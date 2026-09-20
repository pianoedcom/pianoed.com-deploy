import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronRight, Sparkles, Filter, Music, BookOpen, Download, FileText } from "lucide-react";
import Container from "@/components/layout/Container";
import Seo from "@/components/layout/Seo";
import { useI18n } from "@/lib/i18n/context";
import { getAllSheetMusic, getEras, getGenres, type MusicalEra } from "@/lib/content/sheet-music-loader";
import SheetMusicCard from "@/components/sheet-music/SheetMusicCard";

const SheetMusicLibraryPage: React.FC = () => {
  const { t, locale } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEra, setSelectedEra] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  const allPieces = useMemo(() => getAllSheetMusic(), []);
  const eras = useMemo(() => getEras(), []);
  const genres = useMemo(() => getGenres(), []);

  const filteredPieces = useMemo(() => {
    return allPieces.filter((piece) => {
      // Era filter
      if (selectedEra !== "all" && piece.era.toLowerCase() !== selectedEra.toLowerCase()) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== "all" && piece.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) {
        return false;
      }

      // Genre filter
      if (selectedGenre !== "all" && piece.genre.toLowerCase() !== selectedGenre.toLowerCase()) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = piece.title.toLowerCase().includes(q);
        const inComposer = piece.composer.toLowerCase().includes(q);
        const inEra = piece.era.toLowerCase().includes(q);
        const inGenre = piece.genre.toLowerCase().includes(q);
        const inKey = piece.keySignature?.toLowerCase().includes(q) ?? false;
        const inTags = piece.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;
        const inSkills = piece.skills?.some((s) => s.toLowerCase().includes(q)) ?? false;

        return inTitle || inComposer || inEra || inGenre || inKey || inTags || inSkills;
      }

      return true;
    });
  }, [allPieces, selectedEra, selectedDifficulty, selectedGenre, searchQuery]);

  return (
    <>
      <Seo
        title={t("page.sheetMusic.seoTitle") || "Sheet Music Library — PianoEd"}
        description={
          t("page.sheetMusic.seoDescription") ||
          "Curated, annotated sheet music library with downloadable public domain PDFs, keyboard diagrams, and study guides for piano learners."
        }
        path="/resources/sheet-music-library"
        locale={locale}
      />

      <Container className="py-10" width="default">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <Link to="/resources" className="hover:text-foreground">
                Resources
              </Link>
            </li>
            <li className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <span className="text-foreground">Sheet Music Library</span>
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="mb-10 max-w-3xl">
          <p className="eyebrow mb-2">Repertoire & Study Guides</p>
          <h1 className="display-heading text-4xl sm:text-5xl mb-3">
            {t("page.sheetMusic.title") || "Piano Sheet Music Library"}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t("page.sheetMusic.subtitle") ||
              "Curated classical masterworks and popular repertoire. Every piece includes historical context, voicing secrets, interactive keyboard charts, and direct PDF downloads."}
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="mb-8 space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                t("page.sheetMusic.searchPlaceholder") ||
                "Search pieces by composer (e.g. Chopin, Bach), title, era, or key..."
              }
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            {/* Era Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground mr-1 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Era:
              </span>
              <button
                type="button"
                onClick={() => setSelectedEra("all")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  selectedEra === "all"
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                All Eras ({allPieces.length})
              </button>
              {eras.map((era) => {
                const count = allPieces.filter(
                  (p) => p.era.toLowerCase() === era.toLowerCase()
                ).length;
                return (
                  <button
                    key={era}
                    type="button"
                    onClick={() => setSelectedEra(era)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      selectedEra.toLowerCase() === era.toLowerCase()
                        ? "bg-accent text-accent-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {era} ({count})
                  </button>
                );
              })}
            </div>

            {/* Selectors: Difficulty & Genre */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Difficulty:</span>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:border-accent focus:outline-none"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {genres.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Genre:</span>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:border-accent focus:outline-none"
                  >
                    <option value="all">All Genres</option>
                    {genres.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pieces Grid */}
        {filteredPieces.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPieces.map((piece) => (
              <SheetMusicCard key={piece.slug} piece={piece} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <Music className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-semibold text-foreground">No sheet music found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search terms or filter selection.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedEra("all");
                setSelectedDifficulty("all");
                setSelectedGenre("all");
              }}
              className="mt-4 inline-flex items-center rounded-lg bg-accent px-4 py-2 text-xs font-medium text-accent-foreground hover:opacity-90"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Feature Highlights Section */}
        <div className="mt-16 grid gap-6 sm:grid-cols-3 border-t border-border pt-10">
          <div className="rounded-xl border border-border/80 bg-card/60 p-5">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Download className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-foreground mb-1 text-base">Direct PDF Downloads</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Fast, high-resolution PDF sheet music hosted on Cloudflare R2. Formatted for standard Letter / A4 printing and tablet score readers.
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card/60 p-5">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <BookOpen className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-foreground mb-1 text-base">In-Depth Study Guides</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every score is paired with measure-by-measure practice steps, pedaling guides, and historical context to deepen your artistic understanding.
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card/60 p-5">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Sparkles className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-foreground mb-1 text-base">Keyboard Visualizations</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Interactive piano keyboard charts illustrate the exact hand shapes, octave positions, and harmonic structures used throughout the piece.
            </p>
          </div>
        </div>
      </Container>
    </>
  );
};

export default SheetMusicLibraryPage;

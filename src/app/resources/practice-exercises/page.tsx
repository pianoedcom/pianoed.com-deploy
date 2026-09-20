import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronRight, Sparkles, Filter, Music2, BookOpen, Layers } from "lucide-react";
import Container from "@/components/layout/Container";
import Seo from "@/components/layout/Seo";
import { useI18n } from "@/lib/i18n/context";
import { getAllExercises, getExerciseCategories } from "@/lib/content/exercises-loader";
import ExerciseCard from "@/components/exercises/ExerciseCard";

const PracticeExercisesPage: React.FC = () => {
  const { t, locale } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const allExercises = useMemo(() => getAllExercises(), []);
  const categories = useMemo(() => getExerciseCategories(), []);

  const filteredExercises = useMemo(() => {
    return allExercises.filter((exercise) => {
      // Category filter
      if (selectedCategory !== "all" && exercise.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== "all" && exercise.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = exercise.title.toLowerCase().includes(q);
        const inDesc = exercise.description.toLowerCase().includes(q);
        const inSeries = exercise.series?.toLowerCase().includes(q) ?? false;
        const inTags = exercise.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;
        const inSkills = exercise.skillFocus?.some((s) => s.toLowerCase().includes(q)) ?? false;

        return inTitle || inDesc || inSeries || inTags || inSkills;
      }

      return true;
    });
  }, [allExercises, selectedCategory, selectedDifficulty, searchQuery]);

  return (
    <>
      <Seo
        title={t("page.exercises.seoTitle") || "Piano Practice Exercise Database — PianoEd"}
        description={
          t("page.exercises.seoDescription") ||
          "Interactive piano practice routines, Hanon warm-ups, scale fingerings, and BPM progression trackers for piano learners."
        }
        path="/resources/practice-exercises"
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
              <span className="text-foreground">Practice Exercises</span>
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="mb-10 max-w-3xl">
          <p className="eyebrow mb-2">Interactive Learning & Technique</p>
          <h1 className="display-heading text-4xl sm:text-5xl mb-3">
            {t("page.exercises.title") || "Piano Practice Exercise Database"}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t("page.exercises.subtitle") ||
              "Structured routines, finger independence drills, and foundational scale exercises with built-in metronomes and interactive BPM progression trackers."}
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
                t("page.exercises.searchPlaceholder") ||
                "Search exercises by title, technique (e.g., Hanon, scales, thumb-under)..."
              }
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground mr-1 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Category:
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  selectedCategory === "all"
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({allExercises.length})
              </button>
              {categories.map((cat) => {
                const count = allExercises.filter(
                  (ex) => ex.category.toLowerCase() === cat.toLowerCase()
                ).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      selectedCategory.toLowerCase() === cat.toLowerCase()
                        ? "bg-accent text-accent-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Difficulty Selector */}
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
          </div>
        </div>

        {/* Exercise Grid */}
        {filteredExercises.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {filteredExercises.map((exercise) => (
              <ExerciseCard key={exercise.slug} exercise={exercise} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <Music2 className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-semibold text-foreground">No exercises found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search terms or filter selection.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedDifficulty("all");
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
              <Layers className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-foreground mb-1 text-base">BPM Progression Ladder</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every exercise features an interactive tempo ladder with localStorage tracking. Mark your tempo milestones as your speed and clarity develop.
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card/60 p-5">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Music2 className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-foreground mb-1 text-base">Integrated Metronome</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Synthesized real-time click track tuned directly on the page, with preset buttons for both starting and goal tempo.
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card/60 p-5">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <BookOpen className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-foreground mb-1 text-base">Interactive Keyboard Diagrams</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Visual keyboard diagrams illustrate exact hand shapes, thumb passing positions, and note sequences for both hands.
            </p>
          </div>
        </div>
      </Container>
    </>
  );
};

export default PracticeExercisesPage;

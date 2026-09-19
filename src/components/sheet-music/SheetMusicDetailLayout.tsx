import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ArrowLeft, Clock, Music, KeyRound, HandMetal, Award, User, Sparkles } from "lucide-react";
import Container from "@/components/layout/Container";
import type { SheetMusicDetail, MusicalEra } from "@/lib/content/sheet-music-loader";
import SheetMusicDifficultyBadge from "./SheetMusicDifficultyBadge";
import SheetMusicExternalLinks from "./SheetMusicExternalLinks";

interface SheetMusicDetailLayoutProps {
  piece: SheetMusicDetail;
  children: React.ReactNode;
}

const eraStyles: Record<MusicalEra, { badge: string; heroAccent: string }> = {
  Baroque: {
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    heroAccent: "text-amber-600 dark:text-amber-400",
  },
  Classical: {
    badge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
    heroAccent: "text-indigo-600 dark:text-indigo-400",
  },
  Romantic: {
    badge: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30",
    heroAccent: "text-purple-600 dark:text-purple-400",
  },
  "20th Century": {
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
    heroAccent: "text-sky-600 dark:text-sky-400",
  },
  Contemporary: {
    badge: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/30",
    heroAccent: "text-teal-600 dark:text-teal-400",
  },
  Jazz: {
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    heroAccent: "text-emerald-600 dark:text-emerald-400",
  },
};

export const SheetMusicDetailLayout: React.FC<SheetMusicDetailLayoutProps> = ({ piece, children }) => {
  const eraConf = eraStyles[piece.era] || eraStyles.Classical;

  return (
    <Container className="py-8" width="wide">
      {/* Breadcrumb Navigation */}
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
            <Link to="/resources/sheet-music-library" className="hover:text-foreground">
              Sheet Music Library
            </Link>
          </li>
          <li className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
              {piece.title}
            </span>
          </li>
        </ol>
      </nav>

      {/* Back Link */}
      <div className="mb-6">
        <Link
          to="/resources/sheet-music-library"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sheet Music Library
        </Link>
      </div>

      {/* Hero Header */}
      <header className="mb-8 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className={`rounded-md border px-2.5 py-0.5 text-xs font-semibold ${eraConf.badge}`}>
            {piece.era}
          </span>
          <span className="rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {piece.genre}
          </span>
          <SheetMusicDifficultyBadge difficulty={piece.difficulty} />
        </div>

        <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
          <User className="h-4 w-4 text-accent" />
          <span>{piece.composer}</span>
          {piece.composerBorn && piece.composerDied && (
            <span className="opacity-75">
              ({piece.composerBorn}–{piece.composerDied})
            </span>
          )}
        </div>

        <h1 className="display-heading text-3xl sm:text-4xl text-foreground mb-3 font-serif">
          {piece.title}
        </h1>

        {piece.description && (
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            {piece.description}
          </p>
        )}
      </header>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: MDX Content */}
        <div className="lg:col-span-8 min-w-0">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {children}
          </div>
        </div>

        {/* Right Column: Sticky Sidebar with Score Downloads & Quick Specs */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-20 space-y-6">
            {/* Direct Score Download / External Score Links */}
            <SheetMusicExternalLinks
              pdfUrl={piece.pdfUrl}
              imslpUrl={piece.imslpUrl}
              title={piece.title}
              composer={piece.composer}
            />

            {/* Quick Specs Card */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="font-serif text-base font-semibold text-foreground border-b border-border pb-3 mb-4">
                Piece Blueprint
              </h3>

              <div className="space-y-3 text-sm">
                {piece.keySignature && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <KeyRound className="h-4 w-4 text-accent" />
                      Key Signature
                    </span>
                    <span className="font-medium text-foreground">{piece.keySignature}</span>
                  </div>
                )}

                {piece.timeSignature && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Music className="h-4 w-4 text-accent" />
                      Time Signature
                    </span>
                    <span className="font-mono font-medium text-foreground">{piece.timeSignature}</span>
                  </div>
                )}

                {piece.handFocus && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <HandMetal className="h-4 w-4 text-accent" />
                      Hand Focus
                    </span>
                    <span className="font-medium text-foreground text-right max-w-[170px] truncate" title={piece.handFocus}>
                      {piece.handFocus}
                    </span>
                  </div>
                )}

                {piece.estimatedLearningWeeks && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-accent" />
                      Est. Study Time
                    </span>
                    <span className="font-medium text-foreground">
                      {piece.estimatedLearningWeeks} {piece.estimatedLearningWeeks === 1 ? "week" : "weeks"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Core Skills Developed */}
            {piece.skills && piece.skills.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h3 className="font-serif text-base font-semibold text-foreground border-b border-border pb-3 mb-3 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Key Skills Developed
                </h3>
                <ul className="space-y-2">
                  {piece.skills.map((skill, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                      <span className="text-foreground font-medium">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended For */}
            {piece.recommendedFor && piece.recommendedFor.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h3 className="font-serif text-base font-semibold text-foreground border-b border-border pb-3 mb-3 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-accent" />
                  Recommended For
                </h3>
                <ul className="space-y-2">
                  {piece.recommendedFor.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>
    </Container>
  );
};

export default SheetMusicDetailLayout;

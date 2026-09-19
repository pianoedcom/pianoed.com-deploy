import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Music, Sparkles, Download, Calendar, Clock } from "lucide-react";
import type { SheetMusicSummary, MusicalEra } from "@/lib/content/sheet-music-loader";
import SheetMusicDifficultyBadge from "./SheetMusicDifficultyBadge";

interface SheetMusicCardProps {
  piece: SheetMusicSummary;
}

const eraStyles: Record<MusicalEra, { badge: string; border: string }> = {
  Baroque: {
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    border: "group-hover:border-amber-500/50",
  },
  Classical: {
    badge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
    border: "group-hover:border-indigo-500/50",
  },
  Romantic: {
    badge: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30",
    border: "group-hover:border-purple-500/50",
  },
  "20th Century": {
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
    border: "group-hover:border-sky-500/50",
  },
  Contemporary: {
    badge: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/30",
    border: "group-hover:border-teal-500/50",
  },
  Jazz: {
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    border: "group-hover:border-emerald-500/50",
  },
};

export const SheetMusicCard: React.FC<SheetMusicCardProps> = ({ piece }) => {
  const eraConf = eraStyles[piece.era] || eraStyles.Classical;

  return (
    <Link
      to={`/resources/sheet-music-library/${piece.slug}`}
      className={`group flex flex-col justify-between rounded-xl border border-border bg-card p-6 transition-all hover:bg-accent/5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${eraConf.border}`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${eraConf.badge}`}>
              {piece.era}
            </span>
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {piece.genre}
            </span>
            {piece.featuredPiece && (
              <span className="rounded-md bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Featured
              </span>
            )}
          </div>
          <SheetMusicDifficultyBadge difficulty={piece.difficulty} />
        </div>

        {/* Composer Info */}
        <p className="text-xs font-medium text-muted-foreground mb-1">
          {piece.composer}
          {piece.composerBorn && piece.composerDied && (
            <span className="ml-1 opacity-75">
              ({piece.composerBorn}–{piece.composerDied})
            </span>
          )}
        </p>

        {/* Title */}
        <h3 className="mb-2 text-xl font-semibold text-foreground group-hover:text-accent transition-colors font-serif">
          {piece.title}
        </h3>

        {/* Description or Difficulty notes */}
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
          {piece.description || piece.difficultyNotes || `Explore study notes, keyboard fingering diagrams, and score analysis for ${piece.title}.`}
        </p>

        {/* Skills or Key Attributes */}
        {piece.skills && piece.skills.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {piece.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded bg-background/80 border border-border/80 px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                <Music className="h-2.5 w-2.5 text-accent" />
                {skill}
              </span>
            ))}
            {piece.skills.length > 3 && (
              <span className="text-[11px] text-muted-foreground self-center">
                +{piece.skills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-border/60 pt-4 mt-2">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {piece.keySignature && (
              <span className="font-medium text-foreground bg-muted/60 px-2 py-0.5 rounded text-[11px]">
                {piece.keySignature}
              </span>
            )}
            {piece.timeSignature && (
              <span className="font-mono text-muted-foreground">
                {piece.timeSignature}
              </span>
            )}
            {piece.pdfUrl && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <Download className="h-3.5 w-3.5" />
                PDF
              </span>
            )}
          </div>

          <span className="inline-flex items-center gap-1 font-medium text-accent group-hover:translate-x-0.5 transition-transform">
            Study Piece
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default SheetMusicCard;

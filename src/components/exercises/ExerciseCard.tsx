import React from "react";
import { Link } from "react-router-dom";
import { Clock, ArrowRight, Gauge, HandMetal, Sparkles } from "lucide-react";
import type { ExerciseSummary } from "@/lib/content/exercises-loader";
import ExerciseDifficultyBadge from "./ExerciseDifficultyBadge";

interface ExerciseCardProps {
  exercise: ExerciseSummary;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  return (
    <Link
      to={`/resources/practice-exercises/${exercise.slug}`}
      className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 transition-all hover:border-accent/60 hover:bg-accent/5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {exercise.category}
            </span>
            {exercise.series && (
              <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                {exercise.series} {exercise.seriesNumber ? `#${exercise.seriesNumber}` : ""}
              </span>
            )}
          </div>
          <ExerciseDifficultyBadge difficulty={exercise.difficulty} />
        </div>

        <h3 className="mb-2 text-xl font-semibold text-foreground group-hover:text-accent transition-colors">
          {exercise.title}
        </h3>

        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
          {exercise.description}
        </p>

        {/* Skill focus tags */}
        {exercise.skillFocus && exercise.skillFocus.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {exercise.skillFocus.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded bg-background/80 border border-border/80 px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                <Sparkles className="h-3 w-3 text-accent" />
                {skill}
              </span>
            ))}
            {exercise.skillFocus.length > 3 && (
              <span className="text-[11px] text-muted-foreground self-center">
                +{exercise.skillFocus.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border/60 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {exercise.startingTempo && (
              <span className="flex items-center gap-1 font-mono">
                <Gauge className="h-3.5 w-3.5 text-accent" />
                ♩={exercise.startingTempo}–{exercise.targetTempo || exercise.startingTempo}
              </span>
            )}
            {exercise.estimatedMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {exercise.estimatedMinutes} min
              </span>
            )}
          </div>

          <span className="inline-flex items-center gap-1 font-medium text-accent group-hover:translate-x-0.5 transition-transform">
            Start Exercise
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ExerciseCard;

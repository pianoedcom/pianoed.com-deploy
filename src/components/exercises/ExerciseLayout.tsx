import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ArrowLeft, Clock, HandMetal, Music, Gauge, Layers } from "lucide-react";
import Container from "@/components/layout/Container";
import type { ExerciseDetail } from "@/lib/content/exercises-loader";
import ExerciseDifficultyBadge from "./ExerciseDifficultyBadge";
import ExerciseMetronomeWidget from "./ExerciseMetronomeWidget";
import ExerciseProgressTracker from "./ExerciseProgressTracker";

interface ExerciseLayoutProps {
  exercise: ExerciseDetail;
  children: React.ReactNode;
}

export const ExerciseLayout: React.FC<ExerciseLayoutProps> = ({ exercise, children }) => {
  const [selectedBpm, setSelectedBpm] = useState<number | undefined>(exercise.startingTempo);

  return (
    <Container className="py-8" width="default">
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
            <Link to="/resources/practice-exercises" className="hover:text-foreground">
              Practice Exercises
            </Link>
          </li>
          <li className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
              {exercise.title}
            </span>
          </li>
        </ol>
      </nav>

      {/* Back Link */}
      <div className="mb-6">
        <Link
          to="/resources/practice-exercises"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all exercises
        </Link>
      </div>

      {/* Hero Header */}
      <header className="mb-8 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <ExerciseDifficultyBadge difficulty={exercise.difficulty} />
          <span className="rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {exercise.category}
          </span>
          {exercise.series && (
            <span className="rounded-md bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
              {exercise.series} {exercise.seriesNumber ? `#${exercise.seriesNumber}` : ""}
            </span>
          )}
        </div>

        <h1 className="display-heading text-3xl sm:text-4xl text-foreground mb-3">
          {exercise.title}
        </h1>

        <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
          {exercise.description}
        </p>
      </header>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: MDX Content */}
        <div className="lg:col-span-8 min-w-0">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {children}
          </div>
        </div>

        {/* Right Column: Sticky Sidebar with Tools & Progress Tracker */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-20 space-y-6">
            {/* Quick Specs Card */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="font-serif text-base font-semibold text-foreground border-b border-border pb-3 mb-4">
                Exercise Parameters
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Gauge className="h-4 w-4 text-accent" />
                    Tempo Range
                  </span>
                  <span className="font-mono font-medium text-foreground">
                    ♩={exercise.startingTempo || 60} – {exercise.targetTempo || 120} BPM
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Music className="h-4 w-4 text-accent" />
                    Time Signature
                  </span>
                  <span className="font-medium text-foreground">{exercise.timeSignature || "4/4"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <HandMetal className="h-4 w-4 text-accent" />
                    Hand Focus
                  </span>
                  <span className="font-medium text-foreground">{exercise.handFocus || "Both Hands"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-accent" />
                    Est. Daily Practice
                  </span>
                  <span className="font-medium text-foreground">{exercise.estimatedMinutes || 10} min</span>
                </div>
              </div>
            </div>

            {/* Interactive Metronome Widget */}
            <ExerciseMetronomeWidget
              startingTempo={exercise.startingTempo || 60}
              targetTempo={exercise.targetTempo || 120}
              timeSignature={exercise.timeSignature || "4/4"}
              externalBpm={selectedBpm}
              onBpmChange={(bpm) => setSelectedBpm(bpm)}
            />

            {/* BPM Progression Tracker */}
            <ExerciseProgressTracker
              slug={exercise.slug}
              startingTempo={exercise.startingTempo || 60}
              targetTempo={exercise.targetTempo || 120}
              onTempoSelect={(bpm) => setSelectedBpm(bpm)}
            />
          </div>
        </aside>
      </div>
    </Container>
  );
};

export default ExerciseLayout;

import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, Trophy, RotateCcw } from "lucide-react";

interface ExerciseProgressTrackerProps {
  slug: string;
  startingTempo?: number;
  targetTempo?: number;
  onTempoSelect?: (bpm: number) => void;
  className?: string;
}

export const ExerciseProgressTracker: React.FC<ExerciseProgressTrackerProps> = ({
  slug,
  startingTempo = 60,
  targetTempo = 108,
  onTempoSelect,
  className = "",
}) => {
  // Generate sensible ladder milestones between starting and target tempo
  const milestones = React.useMemo(() => {
    const min = Math.min(startingTempo, targetTempo);
    const max = Math.max(startingTempo, targetTempo);
    const range = max - min;
    
    // Choose step size: around 6 to 12 BPM
    let step = 8;
    if (range > 60) step = 12;
    else if (range <= 30) step = 6;

    const list: number[] = [];
    for (let bpm = min; bpm < max; bpm += step) {
      list.push(bpm);
    }
    if (!list.includes(max)) {
      list.push(max);
    }
    return list;
  }, [startingTempo, targetTempo]);

  const storageKey = `pianoed_exercise_bpm_${slug}`;

  const [achievedBpms, setAchievedBpms] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(achievedBpms));
    } catch {
      // Ignore storage errors
    }
  }, [achievedBpms, storageKey]);

  const toggleBpm = (bpm: number) => {
    setAchievedBpms((prev) =>
      prev.includes(bpm) ? prev.filter((b) => b !== bpm) : [...prev, bpm]
    );
  };

  const resetProgress = () => {
    if (window.confirm("Reset your BPM milestone progress for this exercise?")) {
      setAchievedBpms([]);
    }
  };

  const completedCount = milestones.filter((b) => achievedBpms.includes(b)).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);
  const isMastered = completedCount === milestones.length && milestones.length > 0;

  return (
    <div className={`rounded-xl border border-border bg-card p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Trophy className={`h-5 w-5 ${isMastered ? "text-amber-500" : "text-accent"}`} />
          <h3 className="font-serif text-base font-semibold text-foreground">
            BPM Progression Ladder
          </h3>
        </div>
        {achievedBpms.length > 0 && (
          <button
            onClick={resetProgress}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            title="Reset progress"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-1.5">
          <span>Mastery Progress</span>
          <span className="font-semibold text-foreground">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isMastered ? "bg-amber-500" : "bg-accent"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs text-muted-foreground">
          Click a milestone to mark it achieved, or tap the tempo to load it into the metronome:
        </p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {milestones.map((bpm) => {
            const isAchieved = achievedBpms.includes(bpm);
            const isTarget = bpm === targetTempo;

            return (
              <div
                key={bpm}
                className={`flex items-center justify-between rounded-lg border p-2 text-xs transition-all ${
                  isAchieved
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 font-medium"
                    : "border-border bg-background/60 text-muted-foreground hover:border-accent/40"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onTempoSelect?.(bpm)}
                  className="hover:underline flex items-center gap-1 font-mono text-xs"
                  title={`Set metronome to ${bpm} BPM`}
                >
                  <span>♩={bpm}</span>
                  {isTarget && (
                    <span className="rounded bg-accent/20 px-1 py-0.2 text-[9px] font-bold text-accent">
                      GOAL
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleBpm(bpm)}
                  className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={isAchieved ? `Mark ${bpm} BPM incomplete` : `Mark ${bpm} BPM completed`}
                >
                  {isAchieved ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/40 hover:text-muted-foreground" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {isMastered && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-500/10 p-2.5 text-xs font-medium text-amber-800 dark:text-amber-300 border border-amber-500/30">
          <Trophy className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span>Congratulations! You reached the target tempo for this exercise!</span>
        </div>
      )}
    </div>
  );
};

export default ExerciseProgressTracker;

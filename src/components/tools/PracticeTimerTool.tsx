import { useState, useMemo, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Bell, Volume2 } from "lucide-react";
import { playChime } from "@/lib/audio/sound";
interface Phase {
  label: string;
  percentage: number;
  description: string;
}
const DEFAULT_PHASES: Phase[] = [
  { label: "Warm-up", percentage: 15, description: "Scales, arpeggios, finger exercises" },
  { label: "Technique", percentage: 25, description: "Hanon, Czerny, targeted exercises" },
  { label: "Repertoire", percentage: 50, description: "Working on your current pieces" },
  { label: "Cool-down", percentage: 10, description: "Review, sight-reading, free play" },
];
const PracticeTimerTool = () => {
  const [totalMinutes, setTotalMinutes] = useState(30);
  const [phases, setPhases] = useState(DEFAULT_PHASES);
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30 * 60);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const allocations = useMemo(
    () =>
      phases.map((p) => ({
        ...p,
        minutes: Math.round((totalMinutes * p.percentage) / 100),
        seconds: Math.round((totalMinutes * 60 * p.percentage) / 100),
      })),
    [phases, totalMinutes],
  );
  // Calculate cumulative phase thresholds from the end
  const phaseThresholds = useMemo(() => {
    let runningTotal = 0;
    return allocations.map((p) => {
      runningTotal += p.seconds;
      return runningTotal;
    });
  }, [allocations]);
  // Reset seconds left if totalMinutes changes while stopped
  useEffect(() => {
    if (!isRunning) {
      setSecondsLeft(totalMinutes * 60);
    }
  }, [totalMinutes, isRunning]);
  // Active countdown timer effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playChime("complete");
            return 0;
          }
          // Determine if we crossed a phase threshold
          const elapsed = totalMinutes * 60 - (prev - 1);
          const nextIndex = phaseThresholds.findIndex((thresh) => elapsed < thresh);
          if (nextIndex !== -1 && nextIndex !== currentPhaseIndex) {
            setCurrentPhaseIndex(nextIndex);
            playChime("phase");
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, totalMinutes, phaseThresholds, currentPhaseIndex]);
  const totalPercentage = phases.reduce((sum, p) => sum + p.percentage, 0);
  const updatePhase = (index: number, percentage: number) => {
    setPhases((prev) => prev.map((p, i) => (i === index ? { ...p, percentage } : p)));
  };
  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(totalMinutes * 60);
    setCurrentPhaseIndex(0);
  };
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${String(remainder).padStart(2, "0")}`;
  };
  return (
    <div className="space-y-6">
      {/* Active Timer Display */}
      <div className="rounded-xl border border-border bg-gradient-to-b from-card to-card/50 p-6 text-center shadow-sm">
        <div className="mb-2 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
          <Bell className="h-3.5 w-3.5" />
          <span>
            {isRunning
              ? `Current Phase: ${allocations[currentPhaseIndex]?.label ?? "Practice"}`
              : "Practice Session Timer"}
          </span>
        </div>
        <div className="text-5xl font-mono font-bold tracking-tight text-foreground sm:text-6xl" aria-live="polite">
          {formatTime(secondsLeft)}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {isRunning ? allocations[currentPhaseIndex]?.description : "Press Start to begin your timed practice session with chime alerts"}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              if (secondsLeft === 0) setSecondsLeft(totalMinutes * 60);
              setIsRunning(!isRunning);
            }}
            className="flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4" /> Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" /> Start Practice
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button
            onClick={() => playChime("complete")}
            className="flex items-center gap-1.5 rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Preview practice chime sound"
          >
            <Volume2 className="h-4 w-4 text-accent" /> Test Chime
          </button>
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Total Practice Time: {totalMinutes} minutes
        </label>
        <input
          type="range"
          min={10}
          max={120}
          step={5}
          disabled={isRunning}
          value={totalMinutes}
          onChange={(e) => setTotalMinutes(Number(e.target.value))}
          className="w-full accent-primary disabled:opacity-50"
          aria-label="Total practice time in minutes"
        />
      </div>
      <div className="space-y-3">
        {allocations.map((phase, i) => (
          <div
            key={phase.label}
            className={`rounded-lg border p-4 transition-colors ${
              isRunning && currentPhaseIndex === i
                ? "border-accent/50 bg-accent/10"
                : "border-border bg-card"
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <div>
                <span className="font-semibold text-foreground">{phase.label}</span>
                <span className="ml-2 text-sm text-muted-foreground">{phase.description}</span>
              </div>
              <span className="text-sm font-medium text-primary">{phase.minutes} min</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              disabled={isRunning}
              value={phase.percentage}
              onChange={(e) => updatePhase(i, Number(e.target.value))}
              className="w-full accent-primary disabled:opacity-50"
              aria-label={`${phase.label} percentage`}
            />
            <div className="mt-1 text-xs text-muted-foreground">{phase.percentage}%</div>
          </div>
        ))}
      </div>
      <div
        className={`rounded-md p-3 text-sm ${
          totalPercentage === 100
            ? "bg-accent/20 text-accent-foreground"
            : "bg-destructive/10 text-destructive"
        }`}
        aria-live="polite"
      >
        {totalPercentage === 100
          ? "✓ Percentages add up to 100%"
          : `⚠ Percentages total ${totalPercentage}% — adjust to reach 100%`}
      </div>
      <div className="rounded-lg bg-muted/30 p-4">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Practice Summary</h3>
        <div className="space-y-1 text-sm text-foreground">
          {allocations.map((phase) => (
            <div key={phase.label} className="flex justify-between">
              <span>{phase.label}</span>
              <span className="font-mono">
                {Math.floor(phase.seconds / 60)}:{String(phase.seconds % 60).padStart(2, "0")}
              </span>
            </div>
          ))}
          <div className="flex justify-between border-t border-border pt-2 font-semibold">
            <span>Total</span>
            <span className="font-mono">{totalMinutes}:00</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PracticeTimerTool;
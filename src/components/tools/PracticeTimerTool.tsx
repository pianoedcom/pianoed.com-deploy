import { useState, useMemo } from "react";
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
  const allocations = useMemo(
    () =>
      phases.map((p) => ({
        ...p,
        minutes: Math.round((totalMinutes * p.percentage) / 100),
        seconds: Math.round((totalMinutes * 60 * p.percentage) / 100),
      })),
    [phases, totalMinutes],
  );
  const totalPercentage = phases.reduce((sum, p) => sum + p.percentage, 0);
  const updatePhase = (index: number, percentage: number) => {
    setPhases((prev) => prev.map((p, i) => (i === index ? { ...p, percentage } : p)));
  };
  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Total Practice Time: {totalMinutes} minutes
        </label>
        <input
          type="range"
          min={10}
          max={120}
          step={5}
          value={totalMinutes}
          onChange={(e) => setTotalMinutes(Number(e.target.value))}
          className="w-full accent-primary"
          aria-label="Total practice time in minutes"
        />
      </div>
      <div className="space-y-3">
        {allocations.map((phase, i) => (
          <div key={phase.label} className="rounded-lg border border-border bg-card p-4">
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
              value={phase.percentage}
              onChange={(e) => updatePhase(i, Number(e.target.value))}
              className="w-full accent-primary"
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
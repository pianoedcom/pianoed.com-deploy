interface PracticeExerciseProps {
  title: string;
  /** Tempo in BPM */
  tempo?: number;
  /** Number of repetitions */
  repetitions?: number;
  /** Time signature */
  timeSignature?: string;
  /** Difficulty level */
  difficulty?: "beginner" | "intermediate" | "advanced";
  /** Step-by-step instructions */
  steps?: string[];
  /** Tips for effective practice */
  tips?: string[];
  children?: React.ReactNode;
}
const difficultyStyles: Record<string, string> = {
  beginner: "bg-accent/20 text-accent-foreground",
  intermediate: "bg-primary/20 text-primary",
  advanced: "bg-destructive/15 text-destructive",
};
/**
 * PracticeExercise — a structured card for displaying piano exercise routines
 * (Hanon, Czerny, scales) with tempo, repetition guidance, and practice tips.
 */
const PracticeExercise = ({
  title,
  tempo,
  repetitions,
  timeSignature = "4/4",
  difficulty = "intermediate",
  steps,
  tips,
  children,
}: PracticeExerciseProps) => {
  return (
    <div className="my-6 rounded-lg border border-border bg-card overflow-hidden">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-serif text-lg font-semibold text-foreground">{title}</h4>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${difficultyStyles[difficulty]}`}
          >
            {difficulty}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 border-b border-border bg-muted/20 px-4 py-3 text-sm">
        {tempo && (
          <div>
            <span className="font-semibold text-foreground">♩ = {tempo}</span>
            <span className="ml-1 text-muted-foreground">BPM</span>
          </div>
        )}
        {repetitions && (
          <div>
            <span className="font-semibold text-foreground">×{repetitions}</span>
            <span className="ml-1 text-muted-foreground">repetitions</span>
          </div>
        )}
        <div>
          <span className="font-semibold text-foreground">{timeSignature}</span>
          <span className="ml-1 text-muted-foreground">time</span>
        </div>
      </div>
      {children && <div className="px-4 py-3 text-sm text-foreground">{children}</div>}
      {steps && steps.length > 0 && (
        <div className="border-t border-border px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Steps
          </p>
          <ol className="space-y-1.5">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
      {tips && tips.length > 0 && (
        <div className="border-t border-border bg-accent/5 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
            Practice Tips
          </p>
          <ul className="space-y-1">
            {tips.map((tip, i) => (
              <li key={i} className="text-sm text-foreground">
                <span className="mr-1.5 text-accent">♪</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
export default PracticeExercise;
interface SheetMusicExcerptProps {
  title: string;
  composer?: string;
  /** Description of what the excerpt demonstrates */
  description?: string;
  /** Practice notes or tips */
  practiceNotes?: string[];
  /** Difficulty level */
  difficulty?: "beginner" | "intermediate" | "advanced";
  children?: React.ReactNode;
}
const difficultyStyles: Record<string, string> = {
  beginner: "bg-accent/20 text-accent-foreground",
  intermediate: "bg-primary/20 text-primary",
  advanced: "bg-destructive/15 text-destructive",
};
/**
 * SheetMusicExcerpt — displays an annotated sheet music snippet with practice notes.
 * Designed for PianoEd articles about technique, repertoire, and exercises.
 */
const SheetMusicExcerpt = ({
  title,
  composer,
  description,
  practiceNotes,
  difficulty = "intermediate",
  children,
}: SheetMusicExcerptProps) => {
  return (
    <figure className="my-6 rounded-lg border border-border bg-card overflow-hidden">
      <figcaption className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="font-serif text-lg font-semibold text-foreground">{title}</h4>
            {composer && <span className="text-sm text-muted-foreground">by {composer}</span>}
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${difficultyStyles[difficulty]}`}
          >
            {difficulty}
          </span>
        </div>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      </figcaption>
      <div className="px-4 py-4">
        {children ?? (
          <div className="flex h-24 items-center justify-center rounded-md bg-muted/30 text-sm text-muted-foreground">
            Sheet music notation appears here
          </div>
        )}
      </div>
      {practiceNotes && practiceNotes.length > 0 && (
        <div className="border-t border-border bg-muted/20 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Practice Notes
          </p>
          <ul className="space-y-1">
            {practiceNotes.map((note, i) => (
              <li key={i} className="text-sm text-foreground">
                <span className="mr-1.5 text-accent">♪</span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </figure>
  );
};
export default SheetMusicExcerpt;
interface PianoKeyboardProps {
  /** Notes to highlight on the keyboard (e.g., ["C", "E", "G"]) */
  highlightNotes?: string[];
  /** Label for the highlighted notes (e.g., "C Major Chord") */
  label?: string;
  /** Number of octaves to display */
  octaves?: number;
}
const WHITE_NOTES = ["C", "D", "E", "F", "G", "A", "B"];
const BLACK_NOTES: Record<string, string> = {
  "C#": "C",
  "D#": "D",
  "F#": "F",
  "G#": "G",
  "A#": "A",
};
/**
 * PianoKeyboard — an interactive keyboard diagram for visualizing chords,
 * scales, and note positions within MDX articles.
 */
const PianoKeyboard = ({ highlightNotes = [], label, octaves = 1 }: PianoKeyboardProps) => {
  const keys: React.ReactNode[] = [];
  for (let oct = 0; oct < octaves; oct++) {
    const octaveNote = oct * 12;
    WHITE_NOTES.forEach((note, i) => {
      const fullNote = `${note}${oct + 4}`;
      const isHighlighted = highlightNotes.some((h) => h.toUpperCase() === note.toUpperCase());
      keys.push(
        <div
          key={`w-${fullNote}`}
          className={`relative flex flex-1 items-end justify-center rounded-b border border-border pb-1 text-[10px] font-medium ${
            isHighlighted ? "bg-accent/40 text-accent-foreground" : "bg-background"
          }`}
          style={{ height: "60px" }}
        >
          {note}
        </div>,
      );
      // Add black key after this white key (except E and B)
      if (note !== "E" && note !== "B") {
        const blackNote = Object.entries(BLACK_NOTES).find(([, white]) => white === note)?.[0];
        const blackHighlighted = blackNote
          ? highlightNotes.some(
              (h) => h.toUpperCase().replace("♯", "#") === blackNote.toUpperCase(),
            )
          : false;
        keys.push(
          <div
            key={`b-${octaveNote}-${note}`}
            className={`absolute z-10 flex items-end justify-center rounded-b text-[8px] text-white ${
              blackHighlighted ? "bg-accent" : "bg-foreground"
            }`}
            style={{
              height: "36px",
              width: "24px",
              left: `${(i + 1) * (100 / (WHITE_NOTES.length * octaves)) - 2}%`,
            }}
          >
            {blackNote?.replace("#", "♯")}
          </div>,
        );
      }
    });
  }
  return (
    <figure className="my-4">
      {label && (
        <figcaption className="mb-2 text-sm font-medium text-muted-foreground">{label}</figcaption>
      )}
      <div className="relative flex overflow-x-auto rounded-lg border border-border bg-card p-2">
        <div className="relative flex w-full" style={{ minHeight: "60px" }}>
          {keys}
        </div>
      </div>
    </figure>
  );
};
export default PianoKeyboard;
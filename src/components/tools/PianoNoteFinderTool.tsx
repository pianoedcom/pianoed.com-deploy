import { useState } from "react";
const WHITE_KEYS = ["C", "D", "E", "F", "G", "A", "B"];
const BLACK_KEYS: { note: string; after: string }[] = [
  { note: "C♯", after: "C" },
  { note: "D♯", after: "D" },
  { note: "F♯", after: "F" },
  { note: "G♯", after: "G" },
  { note: "A♯", after: "A" },
];
const SCALES: Record<string, number[]> = {
  Major: [0, 2, 4, 5, 7, 9, 11],
  Minor: [0, 2, 3, 5, 7, 8, 10],
};
const NOTE_NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const PianoNoteFinderTool = () => {
  const [selectedNote, setSelectedNote] = useState("C");
  const [selectedScale, setSelectedScale] = useState("Major");
  const rootIndex = NOTE_NAMES.indexOf(selectedNote);
  const scaleIntervals = SCALES[selectedScale];
  const scaleNotes = scaleIntervals.map((i) => NOTE_NAMES[(rootIndex + i) % 12]);
  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Root Note</label>
        <div className="flex flex-wrap gap-2">
          {NOTE_NAMES.map((note) => (
            <button
              key={note}
              onClick={() => setSelectedNote(note)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedNote === note
                  ? "bg-primary text-primary-foreground"
                  : "border border-border hover:bg-muted"
              }`}
            >
              {note}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Scale</label>
        <div className="flex gap-2">
          {Object.keys(SCALES).map((scale) => (
            <button
              key={scale}
              onClick={() => setSelectedScale(scale)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedScale === scale
                  ? "bg-primary text-primary-foreground"
                  : "border border-border hover:bg-muted"
              }`}
            >
              {scale}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">
          {selectedNote} {selectedScale} Scale
        </h3>
        <div className="flex flex-wrap gap-2" aria-live="polite">
          {scaleNotes.map((note, i) => (
            <span
              key={i}
              className="rounded-md bg-accent/20 px-3 py-1.5 text-sm font-semibold text-accent-foreground"
            >
              {note}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Keyboard Diagram</h3>
        <div className="relative flex" style={{ height: "80px" }}>
          {WHITE_KEYS.map((key, i) => {
            const noteInScale = scaleNotes.includes(key) || scaleNotes.includes(key + "♯");
            return (
              <div
                key={key}
                onClick={() => setSelectedNote(key)}
                className={`flex flex-1 cursor-pointer items-end justify-center rounded-b border border-border pb-1 text-xs font-medium ${
                  noteInScale ? "bg-accent/30" : "bg-background"
                } ${selectedNote === key ? "ring-2 ring-primary" : ""}`}
              >
                {key}
              </div>
            );
          })}
          {BLACK_KEYS.map(({ note, after }) => {
            const idx = WHITE_KEYS.indexOf(after);
            const noteInScale = scaleNotes.includes(note);
            return (
              <div
                key={note}
                onClick={() => setSelectedNote(note)}
                className={`absolute top-0 z-10 flex h-12 w-8 cursor-pointer items-end justify-center rounded-b text-xs text-white ${
                  noteInScale ? "bg-accent" : "bg-foreground"
                } ${selectedNote === note ? "ring-2 ring-primary" : ""}`}
                style={{ left: `${(idx + 1) * (100 / 7) - 4}%` }}
              >
                {note.replace("♯", "♯")}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default PianoNoteFinderTool;
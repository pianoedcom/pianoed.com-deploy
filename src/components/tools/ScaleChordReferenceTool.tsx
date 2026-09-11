import { useState } from "react";
const NOTE_NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const SCALES: Record<string, number[]> = {
  Major: [0, 2, 4, 5, 7, 9, 11],
  "Natural Minor": [0, 2, 3, 5, 7, 8, 10],
  "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11],
  Pentatonic: [0, 2, 4, 7, 9],
  Blues: [0, 3, 5, 6, 7, 10],
};
const CHORDS: Record<string, number[]> = {
  Major: [0, 4, 7],
  Minor: [0, 3, 7],
  "Dominant 7": [0, 4, 7, 10],
  "Major 7": [0, 4, 7, 11],
  "Minor 7": [0, 3, 7, 10],
  Diminished: [0, 3, 6],
  Augmented: [0, 4, 8],
  Sus4: [0, 5, 7],
};
const ScaleChordReferenceTool = () => {
  const [mode, setMode] = useState<"scale" | "chord">("scale");
  const [root, setRoot] = useState("C");
  const [selected, setSelected] = useState("Major");
  const intervals = mode === "scale" ? SCALES[selected] : CHORDS[selected];
  const rootIndex = NOTE_NAMES.indexOf(root);
  const notes = intervals.map((i) => NOTE_NAMES[(rootIndex + i) % 12]);
  const options = mode === "scale" ? SCALES : CHORDS;
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => {
            setMode("scale");
            setSelected("Major");
          }}
          className={`rounded-md px-4 py-1.5 text-sm font-medium ${
            mode === "scale"
              ? "bg-primary text-primary-foreground"
              : "border border-border hover:bg-muted"
          }`}
        >
          Scales
        </button>
        <button
          onClick={() => {
            setMode("chord");
            setSelected("Major");
          }}
          className={`rounded-md px-4 py-1.5 text-sm font-medium ${
            mode === "chord"
              ? "bg-primary text-primary-foreground"
              : "border border-border hover:bg-muted"
          }`}
        >
          Chords
        </button>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Root</label>
        <div className="flex flex-wrap gap-1.5">
          {NOTE_NAMES.map((n) => (
            <button
              key={n}
              onClick={() => setRoot(n)}
              className={`rounded-md px-2.5 py-1 text-sm font-medium ${
                root === n
                  ? "bg-primary text-primary-foreground"
                  : "border border-border hover:bg-muted"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          {mode === "scale" ? "Scale Type" : "Chord Type"}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(options).map((name) => (
            <button
              key={name}
              onClick={() => setSelected(name)}
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                selected === name
                  ? "bg-primary text-primary-foreground"
                  : "border border-border hover:bg-muted"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          {root} {selected} {mode === "scale" ? "Scale" : "Chord"}
        </h3>
        <div className="flex flex-wrap gap-2" aria-live="polite">
          {notes.map((note, i) => (
            <span
              key={i}
              className="rounded-md bg-accent/20 px-3 py-1.5 text-sm font-semibold text-accent-foreground"
            >
              {note}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ScaleChordReferenceTool;
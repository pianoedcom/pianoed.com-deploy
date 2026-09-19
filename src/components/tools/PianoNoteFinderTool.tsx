import { useState, useRef, useEffect } from "react";
import { Play, Square, Volume2 } from "lucide-react";
import { playPianoNote, playNoteSequence } from "@/lib/audio/sound";
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
  const [isPlayingScale, setIsPlayingScale] = useState(false);
  const cancelSequenceRef = useRef<(() => void) | null>(null);
  const rootIndex = NOTE_NAMES.indexOf(selectedNote);
  const scaleIntervals = SCALES[selectedScale];
  const scaleNotes = scaleIntervals.map((i) => NOTE_NAMES[(rootIndex + i) % 12]);
  // Stop sequence on unmount
  useEffect(() => {
    return () => {
      if (cancelSequenceRef.current) cancelSequenceRef.current();
    };
  }, []);
  const handleNoteClick = (note: string) => {
    if (cancelSequenceRef.current) {
      cancelSequenceRef.current();
      setIsPlayingScale(false);
    }
    setSelectedNote(note);
    playPianoNote(note);
  };
  const handlePlayScale = () => {
    if (isPlayingScale && cancelSequenceRef.current) {
      cancelSequenceRef.current();
      setIsPlayingScale(false);
      return;
    }
    setIsPlayingScale(true);
    // Include octave root note at end for complete scale resolution (e.g. C -> C)
    const fullScale = [...scaleNotes, selectedNote];
    cancelSequenceRef.current = playNoteSequence(fullScale, 300);
    setTimeout(() => {
      setIsPlayingScale(false);
    }, (fullScale.length + 1) * 300);
  };
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium text-foreground">Root Note</label>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Volume2 className="h-3.5 w-3.5 text-accent" /> Click any note or key to hear sound
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {NOTE_NAMES.map((note) => (
            <button
              key={note}
              onClick={() => handleNoteClick(note)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedNote === note
                  ? "bg-primary text-primary-foreground shadow-sm"
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
              onClick={() => {
                setSelectedScale(scale);
                if (cancelSequenceRef.current) {
                  cancelSequenceRef.current();
                  setIsPlayingScale(false);
                }
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedScale === scale
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border hover:bg-muted"
              }`}
            >
              {scale}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            {selectedNote} {selectedScale} Scale
          </h3>
          <button
            onClick={handlePlayScale}
            className="flex items-center gap-1.5 rounded-md bg-accent/20 px-3 py-1 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent/30"
            aria-label={isPlayingScale ? "Stop scale playback" : "Play scale sound"}
          >
            {isPlayingScale ? (
              <>
                <Square className="h-3 w-3 fill-current" /> Stop
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-current" /> Play Scale
              </>
            )}
          </button>
        </div>
        <div className="flex flex-wrap gap-2" aria-live="polite">
          {scaleNotes.map((note, i) => (
            <button
              key={i}
              onClick={() => handleNoteClick(note)}
              className="rounded-md bg-accent/20 px-3 py-1.5 text-sm font-semibold text-accent-foreground transition-transform hover:scale-105 hover:bg-accent/30 active:scale-95"
              title={`Play ${note}`}
            >
              {note}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Keyboard Diagram (Click keys to play)
        </h3>
        <div className="relative flex" style={{ height: "90px" }}>
          {WHITE_KEYS.map((key) => {
            const noteInScale = scaleNotes.includes(key) || scaleNotes.includes(key + "♯");
            return (
              <div
                key={key}
                onClick={() => handleNoteClick(key)}
                className={`flex flex-1 cursor-pointer items-end justify-center rounded-b border border-border pb-2 text-xs font-medium transition-colors select-none active:bg-accent/50 ${
                  noteInScale ? "bg-accent/30 font-bold" : "bg-background"
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleNoteClick(note);
                }}
                className={`absolute top-0 z-10 flex h-14 w-8 cursor-pointer items-end justify-center rounded-b text-xs text-white transition-colors select-none active:bg-accent-foreground ${
                  noteInScale ? "bg-accent font-bold" : "bg-foreground"
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
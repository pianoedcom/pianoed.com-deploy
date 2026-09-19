import { useState, useRef, useEffect } from "react";
import { Play, Square, Volume2 } from "lucide-react";
import { playPianoNote, playNoteSequence, playChord } from "@/lib/audio/sound";
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
  const [isPlaying, setIsPlaying] = useState(false);
  const cancelAudioRef = useRef<(() => void) | null>(null);
  const intervals = mode === "scale" ? SCALES[selected] : CHORDS[selected];
  const rootIndex = NOTE_NAMES.indexOf(root);
  const notes = intervals.map((i) => NOTE_NAMES[(rootIndex + i) % 12]);
  const options = mode === "scale" ? SCALES : CHORDS;
  useEffect(() => {
    return () => {
      if (cancelAudioRef.current) cancelAudioRef.current();
    };
  }, []);
  const handleNoteClick = (n: string) => {
    if (cancelAudioRef.current) {
      cancelAudioRef.current();
      setIsPlaying(false);
    }
    playPianoNote(n);
  };
  const handleRootClick = (n: string) => {
    if (cancelAudioRef.current) {
      cancelAudioRef.current();
      setIsPlaying(false);
    }
    setRoot(n);
    playPianoNote(n);
  };
  const handlePlayAudio = () => {
    if (isPlaying && cancelAudioRef.current) {
      cancelAudioRef.current();
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    if (mode === "scale") {
      const fullNotes = [...notes, root];
      cancelAudioRef.current = playNoteSequence(fullNotes, 280);
      setTimeout(() => {
        setIsPlaying(false);
      }, (fullNotes.length + 1) * 280);
    } else {
      cancelAudioRef.current = playChord(notes, true);
      setTimeout(() => {
        setIsPlaying(false);
      }, 1500);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setMode("scale");
              setSelected("Major");
              if (cancelAudioRef.current) {
                cancelAudioRef.current();
                setIsPlaying(false);
              }
            }}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === "scale"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border hover:bg-muted"
            }`}
          >
            Scales
          </button>
          <button
            onClick={() => {
              setMode("chord");
              setSelected("Major");
              if (cancelAudioRef.current) {
                cancelAudioRef.current();
                setIsPlaying(false);
              }
            }}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === "chord"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border hover:bg-muted"
            }`}
          >
            Chords
          </button>
        </div>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Volume2 className="h-3.5 w-3.5 text-accent" /> Click any note or button to hear sound
        </span>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Root</label>
        <div className="flex flex-wrap gap-1.5">
          {NOTE_NAMES.map((n) => (
            <button
              key={n}
              onClick={() => handleRootClick(n)}
              className={`rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
                root === n
                  ? "bg-primary text-primary-foreground shadow-sm"
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
              onClick={() => {
                setSelected(name);
                if (cancelAudioRef.current) {
                  cancelAudioRef.current();
                  setIsPlaying(false);
                }
              }}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                selected === name
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border hover:bg-muted"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            {root} {selected} {mode === "scale" ? "Scale" : "Chord"}
          </h3>
          <button
            onClick={handlePlayAudio}
            className="flex items-center gap-1.5 rounded-md bg-accent/20 px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent/30"
            aria-label={
              isPlaying
                ? `Stop ${mode} sound`
                : `Play ${root} ${selected} ${mode === "scale" ? "scale" : "chord"} sound`
            }
          >
            {isPlaying ? (
              <>
                <Square className="h-3.5 w-3.5 fill-current" /> Stop
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" /> Play{" "}
                {mode === "scale" ? "Scale" : "Chord"}
              </>
            )}
          </button>
        </div>
        <div className="flex flex-wrap gap-2" aria-live="polite">
          {notes.map((note, i) => (
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
    </div>
  );
};
export default ScaleChordReferenceTool;
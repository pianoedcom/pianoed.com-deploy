import { useState, useEffect, useRef, useCallback } from "react";
const TEMPO_MARKINGS: { bpm: number; name: string }[] = [
  { bpm: 40, name: "Grave" },
  { bpm: 60, name: "Largo" },
  { bpm: 66, name: "Larghetto" },
  { bpm: 76, name: "Adagio" },
  { bpm: 108, name: "Andante" },
  { bpm: 120, name: "Moderato" },
  { bpm: 156, name: "Allegro" },
  { bpm: 176, name: "Vivace" },
  { bpm: 200, name: "Presto" },
  { bpm: 240, name: "Prestissimo" },
];
const TIME_SIGNATURES = ["2/4", "3/4", "4/4", "6/8"];
function getTempoName(bpm: number): string {
  for (let i = TEMPO_MARKINGS.length - 1; i >= 0; i--) {
    if (bpm >= TEMPO_MARKINGS[i].bpm) return TEMPO_MARKINGS[i].name;
  }
  return TEMPO_MARKINGS[0].name;
}
const MetronomeTool = () => {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSignature, setTimeSignature] = useState("4/4");
  const [beat, setBeat] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beatRef = useRef(0);
  const tapTimesRef = useRef<number[]>([]);
  const beatsPerMeasure = parseInt(timeSignature.split("/")[0]);
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setBeat(0);
    beatRef.current = 0;
  }, []);
  useEffect(() => {
    if (isPlaying) {
      const interval = 60000 / bpm;
      intervalRef.current = setInterval(() => {
        beatRef.current = (beatRef.current + 1) % beatsPerMeasure;
        setBeat(beatRef.current);
      }, interval);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, bpm, beatsPerMeasure]);
  const handleTap = useCallback(() => {
    const now = Date.now();
    const recent = tapTimesRef.current.filter((t) => now - t < 3000);
    recent.push(now);
    tapTimesRef.current = recent;
    if (recent.length >= 2) {
      const intervals = recent.slice(1).map((t, i) => t - recent[i]);
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const newBpm = Math.round(60000 / avg);
      if (newBpm >= 20 && newBpm <= 300) setBpm(newBpm);
    }
  }, []);
  const toggle = () => (isPlaying ? stop() : setIsPlaying(true));
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <div className="text-6xl font-serif font-bold text-primary" aria-live="polite">
          {bpm}
        </div>
        <div className="text-lg text-muted-foreground">{getTempoName(bpm)}</div>
      </div>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setBpm((b) => Math.max(20, b - 1))}
          className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
          aria-label="Decrease tempo"
        >
          −
        </button>
        <input
          type="range"
          min={20}
          max={300}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-48 accent-primary"
          aria-label="Tempo in BPM"
        />
        <button
          onClick={() => setBpm((b) => Math.min(300, b + 1))}
          className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
          aria-label="Increase tempo"
        >
          +
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {TIME_SIGNATURES.map((ts) => (
          <button
            key={ts}
            onClick={() => setTimeSignature(ts)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              timeSignature === ts
                ? "bg-primary text-primary-foreground"
                : "border border-border hover:bg-muted"
            }`}
          >
            {ts}
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-2" aria-hidden>
        {Array.from({ length: beatsPerMeasure }).map((_, i) => (
          <div
            key={i}
            className={`h-4 w-4 rounded-full transition-colors ${
              isPlaying && beat === i ? (i === 0 ? "bg-accent" : "bg-primary") : "bg-muted"
            }`}
          />
        ))}
      </div>
      <div className="flex justify-center gap-3">
        <button
          onClick={toggle}
          className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {isPlaying ? "Stop" : "Start"}
        </button>
        <button
          onClick={handleTap}
          className="rounded-md border border-border px-6 py-2.5 text-sm font-semibold hover:bg-muted"
        >
          Tap Tempo
        </button>
      </div>
    </div>
  );
};
export default MetronomeTool;
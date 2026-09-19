import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Square, Plus, Minus, Volume2, VolumeX, Music } from "lucide-react";
import { playMetronomeTick } from "@/lib/audio/sound";

interface ExerciseMetronomeWidgetProps {
  initialBpm?: number;
  startingTempo?: number;
  targetTempo?: number;
  timeSignature?: string;
  externalBpm?: number;
  onBpmChange?: (bpm: number) => void;
  className?: string;
}

export const ExerciseMetronomeWidget: React.FC<ExerciseMetronomeWidgetProps> = ({
  initialBpm,
  startingTempo = 60,
  targetTempo = 108,
  timeSignature = "4/4",
  externalBpm,
  onBpmChange,
  className = "",
}) => {
  const [bpm, setBpm] = useState<number>(initialBpm ?? startingTempo);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(0);

  const beatsPerMeasure = parseInt(timeSignature.split("/")[0]) || 4;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beatRef = useRef<number>(0);
  const isMutedRef = useRef<boolean>(isMuted);
  isMutedRef.current = isMuted;

  // React to external BPM changes (e.g. from the progress tracker ladder)
  useEffect(() => {
    if (externalBpm && externalBpm !== bpm) {
      setBpm(externalBpm);
    }
  }, [externalBpm]);

  const updateBpm = (newBpm: number) => {
    const clamped = Math.max(30, Math.min(260, newBpm));
    setBpm(clamped);
    onBpmChange?.(clamped);
  };

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(0);
    beatRef.current = 0;
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 60000 / bpm;
      intervalRef.current = setInterval(() => {
        const nextBeat = (beatRef.current + 1) % beatsPerMeasure;
        beatRef.current = nextBeat;
        setCurrentBeat(nextBeat);
        if (!isMutedRef.current) {
          playMetronomeTick(nextBeat === 0);
        }
      }, intervalMs);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, bpm, beatsPerMeasure]);

  return (
    <div className={`rounded-xl border border-border bg-card p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-accent" />
          <h3 className="font-serif text-base font-semibold text-foreground">
            Practice Metronome
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          className="rounded p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          title={isMuted ? "Unmute metronome" : "Mute metronome"}
          aria-label={isMuted ? "Unmute metronome" : "Mute metronome"}
        >
          {isMuted ? <VolumeX className="h-4 w-4 text-destructive" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-4 flex flex-col items-center justify-center">
        {/* BPM Counter */}
        <div className="flex items-baseline gap-1 text-center">
          <span className="font-mono text-4xl font-bold tracking-tight text-foreground">{bpm}</span>
          <span className="text-xs font-semibold uppercase text-muted-foreground">BPM</span>
        </div>

        {/* Visual Beat Indicator */}
        <div className="mt-3 flex items-center justify-center gap-2">
          {Array.from({ length: beatsPerMeasure }).map((_, i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-100 ${
                isPlaying && currentBeat === i
                  ? i === 0
                    ? "scale-125 bg-accent ring-4 ring-accent/30"
                    : "scale-110 bg-primary ring-2 ring-primary/30"
                  : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* BPM Controls */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => updateBpm(bpm - 5)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-sm font-semibold hover:bg-muted active:scale-95 transition"
            title="Decrease 5 BPM"
          >
            -5
          </button>
          <button
            type="button"
            onClick={() => updateBpm(bpm - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background hover:bg-muted active:scale-95 transition"
            title="Decrease 1 BPM"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md transition-all active:scale-95 ${
              isPlaying
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-accent hover:bg-accent/90"
            }`}
            aria-label={isPlaying ? "Stop metronome" : "Start metronome"}
          >
            {isPlaying ? <Square className="h-4 w-4 fill-current" /> : <Play className="h-5 w-5 fill-current translate-x-0.5" />}
          </button>
          <button
            type="button"
            onClick={() => updateBpm(bpm + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background hover:bg-muted active:scale-95 transition"
            title="Increase 1 BPM"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => updateBpm(bpm + 5)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-sm font-semibold hover:bg-muted active:scale-95 transition"
            title="Increase 5 BPM"
          >
            +5
          </button>
        </div>

        {/* Quick Tempo Presets */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => updateBpm(startingTempo)}
            className={`rounded border px-2.5 py-1 transition ${
              bpm === startingTempo
                ? "border-accent bg-accent/15 text-accent font-semibold"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            Start ({startingTempo} BPM)
          </button>
          <button
            type="button"
            onClick={() => updateBpm(targetTempo)}
            className={`rounded border px-2.5 py-1 transition ${
              bpm === targetTempo
                ? "border-accent bg-accent/15 text-accent font-semibold"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            Goal ({targetTempo} BPM)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseMetronomeWidget;

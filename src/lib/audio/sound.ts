/**
 * Web Audio API synthesizer for PianoEd interactive tools.
 *
 * Provides pure synthesis for:
 * 1. Metronome clicks (crisp woodblock/mechanical clicks with accent on beat 1)
 * 2. Acoustic piano note synthesis (multi-harmonic decay with natural string resonance)
 * 3. Scale & Chord playback (sequential arpeggios or simultaneous chords)
 * 4. Practice timer chimes (clear resonant bell tone for phase and timer completion)
 *
 * Runs 100% clientside using the standard Web Audio API with zero external audio asset dependencies.
 */

// Note semitone offsets relative to C (C = 0)
const SEMITONES: Record<string, number> = {
  C: 0,
  "C♯": 1,
  "C#": 1,
  Db: 1,
  D: 2,
  "D♯": 3,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F♯": 6,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G♯": 8,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A♯": 10,
  "A#": 10,
  Bb: 10,
  B: 11,
};

let audioCtx: AudioContext | null = null;

/**
 * Get or initialize the AudioContext.
 * Automatically handles browser user gesture unlock policies.
 */
export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }

  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

/**
 * Converts a note name (e.g., "C", "F♯", "A") and octave into frequency (Hz).
 * A4 = 440 Hz, C4 = 261.63 Hz.
 */
export function getNoteFrequency(noteName: string, octave: number = 4): number {
  const cleanNote = noteName.trim();
  const semitone = SEMITONES[cleanNote] ?? 0;
  // MIDI note: C4 is 60. A4 is 69.
  const midi = 12 * (octave + 1) + semitone;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Play a metronome tick.
 * @param isAccent Whether this is beat 1 of the measure (higher pitched woodblock click).
 * @param volume Master volume between 0 and 1.
 */
export function playMetronomeTick(isAccent: boolean = false, volume: number = 0.8): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // High crisp frequency for accent, lower solid click for other beats
  const freq = isAccent ? 1200 : 800;
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, now);
  // Sharp downward frequency ramp gives a classic mechanical woodblock click sound
  osc.frequency.exponentialRampToValueAtTime(freq * 0.1, now + 0.035);

  gain.gain.setValueAtTime(volume * (isAccent ? 1.0 : 0.65), now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.04);
}

/**
 * Play an acoustic piano tone with realistic multi-harmonic decay.
 * @param noteName Name of the note (e.g. "C", "D♯", "A")
 * @param octave Octave number (default 4)
 * @param duration Sustain duration in seconds (default 1.2s)
 * @param volume Note volume (0 to 1)
 */
export function playPianoNote(
  noteName: string,
  octave: number = 4,
  duration: number = 1.2,
  volume: number = 0.4,
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const baseFreq = getNoteFrequency(noteName, octave);

  // Master note gain node
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);

  // Natural piano envelope: fast attack (5ms), gradual logarithmic decay
  masterGain.gain.setValueAtTime(0.0001, now);
  masterGain.gain.linearRampToValueAtTime(volume, now + 0.005);
  masterGain.gain.exponentialRampToValueAtTime(volume * 0.4, now + 0.25);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  // Harmonics (Fundamental, 2nd, 3rd, and 4th harmonic for warm acoustic piano timbre)
  const harmonics = [
    { multiplier: 1.0, gainFactor: 0.65, type: "triangle" as OscillatorType },
    { multiplier: 2.0, gainFactor: 0.25, type: "sine" as OscillatorType },
    { multiplier: 3.0, gainFactor: 0.08, type: "sine" as OscillatorType },
    { multiplier: 4.0, gainFactor: 0.03, type: "sine" as OscillatorType },
  ];

  harmonics.forEach(({ multiplier, gainFactor, type }) => {
    const osc = ctx.createOscillator();
    const hGain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(baseFreq * multiplier, now);

    // Subtle detune on higher harmonics for acoustic string presence
    if (multiplier > 1) {
      osc.detune.setValueAtTime(multiplier * 2.5, now);
    }

    hGain.gain.setValueAtTime(gainFactor, now);
    osc.connect(hGain);
    hGain.connect(masterGain);

    osc.start(now);
    osc.stop(now + duration);
  });
}

/**
 * Play a sequence of notes with a fixed delay between them (arpeggiated scale or melody).
 * Returns a cancel function.
 */
export function playNoteSequence(
  notes: string[],
  delayMs: number = 280,
  baseOctave: number = 4,
  volume: number = 0.4,
): () => void {
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  let currentOctave = baseOctave;
  let previousSemitone = -1;

  notes.forEach((note, index) => {
    const semitone = SEMITONES[note] ?? 0;
    // Advance octave if note wrapped around (e.g. B -> C)
    if (previousSemitone !== -1 && semitone <= previousSemitone) {
      currentOctave++;
    }
    previousSemitone = semitone;

    const octaveForNote = currentOctave;
    const timeout = setTimeout(() => {
      playPianoNote(note, octaveForNote, 1.2, volume);
    }, index * delayMs);

    timeouts.push(timeout);
  });

  return () => {
    timeouts.forEach((t) => clearTimeout(t));
  };
}

/**
 * Play a chord either as a simultaneous harmony or a gently rolled arpeggiated chord.
 */
export function playChord(
  notes: string[],
  arpeggiate: boolean = true,
  baseOctave: number = 4,
  volume: number = 0.35,
): () => void {
  if (arpeggiate) {
    // Quick, elegant roll (45ms between notes)
    return playNoteSequence(notes, 45, baseOctave, volume);
  }

  // Simultaneous
  let currentOctave = baseOctave;
  let previousSemitone = -1;

  notes.forEach((note) => {
    const semitone = SEMITONES[note] ?? 0;
    if (previousSemitone !== -1 && semitone <= previousSemitone) {
      currentOctave++;
    }
    previousSemitone = semitone;
    playPianoNote(note, currentOctave, 1.8, volume);
  });

  return () => {};
}

/**
 * Play a resonant chime/bell for practice timers and reminders.
 * @param type "phase" for intermediate notification, "complete" for session finish.
 */
export function playChime(type: "phase" | "complete" = "complete"): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const freqs = type === "complete" ? [523.25, 659.25, 783.99, 1046.5] : [659.25, 880];

  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const noteStart = now + idx * 0.12;
    const duration = 1.6;

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, noteStart);

    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.linearRampToValueAtTime(0.28, noteStart + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteStart);
    osc.stop(noteStart + duration);
  });
}

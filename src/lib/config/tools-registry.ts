import { lazy } from "react";
export interface ToolConfig {
  slug: string;
  title: string;
  description: string;
  type: "utility" | "reference" | "calculator";
  enabled: boolean;
  component: React.LazyExoticComponent<React.ComponentType>;
}
const MetronomeTool = lazy(() => import("@/components/tools/MetronomeTool"));
const PianoNoteFinderTool = lazy(() => import("@/components/tools/PianoNoteFinderTool"));
const ScaleChordReferenceTool = lazy(() => import("@/components/tools/ScaleChordReferenceTool"));
const PracticeTimerTool = lazy(() => import("@/components/tools/PracticeTimerTool"));
export const toolsRegistry: ToolConfig[] = [
  {
    slug: "metronome",
    title: "Metronome",
    description:
      "An interactive metronome with tempo markings (Largo, Andante, Allegro, etc.), tap-tempo, and time signature options. Useful for practice routines.",
    type: "utility",
    enabled: true,
    component: MetronomeTool,
  },
  {
    slug: "piano-note-finder",
    title: "Piano Note Finder",
    description:
      "An interactive keyboard diagram showing note names, scales, and chords. Great for beginners learning theory.",
    type: "reference",
    enabled: true,
    component: PianoNoteFinderTool,
  },
  {
    slug: "scale-chord-reference",
    title: "Scale & Chord Reference",
    description:
      "A tool to look up scales and chords by key, with on-screen keyboard visualization. Supports the learning & technique pillar.",
    type: "reference",
    enabled: true,
    component: ScaleChordReferenceTool,
  },
  {
    slug: "practice-timer",
    title: "Practice Timer & Scheduler",
    description:
      "A tool to calculate practice time distribution across warm-up, technique, repertoire, and cool-down. Helps structure practice sessions.",
    type: "calculator",
    enabled: true,
    component: PracticeTimerTool,
  },
];
export const enabledTools = toolsRegistry.filter((t) => t.enabled);
export function getTool(slug: string): ToolConfig | undefined {
  return toolsRegistry.find((t) => t.slug === slug);
}
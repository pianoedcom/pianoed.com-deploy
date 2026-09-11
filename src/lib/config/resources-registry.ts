export interface ResourceConfig {
  slug: string;
  title: string;
  description: string;
  type: "directory" | "glossary" | "guide" | "downloadable";
  category: string;
  tags: string[];
  enabled: boolean;
  downloadUrl?: string;
}
export const resourcesRegistry: ResourceConfig[] = [
  {
    slug: "sheet-music-library",
    title: "Sheet Music Library",
    description:
      "Curated, annotated sheet music recommendations across all genres — classical, jazz, pop, contemporary. Downloadable PDFs where possible.",
    type: "directory",
    category: "sheet-music-practice",
    tags: ["sheet-music", "classical", "jazz", "pop-piano"],
    enabled: true,
  },
  {
    slug: "piano-glossary",
    title: "Piano Terminology Glossary",
    description:
      "A glossary of piano and music terms — from 'arpeggio' to 'voicing' — explained warmly for beginners and enthusiasts alike.",
    type: "glossary",
    category: "learning-technique",
    tags: ["beginners", "piano"],
    enabled: true,
  },
  {
    slug: "practice-exercises",
    title: "Practice Exercise Database",
    description:
      "A growing collection of piano exercises (Hanon, Czerny, scales) with annotations and practice tips.",
    type: "directory",
    category: "sheet-music-practice",
    tags: ["technique", "practice", "sheet-music"],
    enabled: true,
  },
  {
    slug: "recommended-books-recordings",
    title: "Recommended Books & Recordings",
    description:
      "Curated list of recommended piano books, method books, recordings, and online courses across genres and skill levels.",
    type: "directory",
    category: "learning-technique",
    tags: ["beginners", "classical", "jazz"],
    enabled: true,
  },
];
export const enabledResources = resourcesRegistry.filter((r) => r.enabled);
export function getResource(slug: string): ResourceConfig | undefined {
  return resourcesRegistry.find((r) => r.slug === slug);
}
import { splitFrontmatter } from "./frontmatter";

export type MusicalEra = "Baroque" | "Classical" | "Romantic" | "20th Century" | "Contemporary" | "Jazz";

export interface SheetMusicFrontmatter {
  title: string;
  composer: string;
  composerBorn?: number;
  composerDied?: number;
  era: MusicalEra;
  genre: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  difficultyNotes?: string;
  keySignature?: string;
  timeSignature?: string;
  estimatedLearningWeeks?: number;
  handFocus?: string;
  skills?: string[];
  recommendedFor?: string[];
  pdfUrl?: string;
  imslpUrl?: string;
  tags?: string[];
  featuredPiece?: boolean;
  publishedAt?: string;
  description?: string;
}

export interface SheetMusicSummary extends SheetMusicFrontmatter {
  slug: string;
}

export interface SheetMusicDetail extends SheetMusicSummary {
  body: string;
}

const sheetMusicRawModules = import.meta.glob<string>("/content/sheet-music/*.{mdx,md}", {
  query: "?raw",
  import: "default",
  eager: true,
});

function parseSlugFromKey(path: string): string {
  const match = path.match(/\/content\/sheet-music\/([^/]+)\.(mdx|md)$/);
  return match ? match[1] : "";
}

function parseSheetMusicFile(raw: string, slug: string): SheetMusicDetail {
  const { frontmatter, body } = splitFrontmatter(raw);

  return {
    slug,
    title: (frontmatter.title as string) || slug,
    composer: (frontmatter.composer as string) || "Unknown Composer",
    composerBorn: typeof frontmatter.composerBorn === "number" ? frontmatter.composerBorn : undefined,
    composerDied: typeof frontmatter.composerDied === "number" ? frontmatter.composerDied : undefined,
    era: (frontmatter.era as MusicalEra) || "Classical",
    genre: (frontmatter.genre as string) || "Classical",
    difficulty: (frontmatter.difficulty as "beginner" | "intermediate" | "advanced") || "intermediate",
    difficultyNotes: typeof frontmatter.difficultyNotes === "string" ? frontmatter.difficultyNotes : undefined,
    keySignature: typeof frontmatter.keySignature === "string" ? frontmatter.keySignature : undefined,
    timeSignature: typeof frontmatter.timeSignature === "string" ? frontmatter.timeSignature : "4/4",
    estimatedLearningWeeks: typeof frontmatter.estimatedLearningWeeks === "number" ? frontmatter.estimatedLearningWeeks : undefined,
    handFocus: typeof frontmatter.handFocus === "string" ? frontmatter.handFocus : undefined,
    skills: Array.isArray(frontmatter.skills) ? (frontmatter.skills as string[]) : [],
    recommendedFor: Array.isArray(frontmatter.recommendedFor) ? (frontmatter.recommendedFor as string[]) : [],
    pdfUrl: typeof frontmatter.pdfUrl === "string" && frontmatter.pdfUrl.trim() ? frontmatter.pdfUrl.trim() : undefined,
    imslpUrl: typeof frontmatter.imslpUrl === "string" && frontmatter.imslpUrl.trim() ? frontmatter.imslpUrl.trim() : undefined,
    tags: Array.isArray(frontmatter.tags) ? (frontmatter.tags as string[]) : [],
    featuredPiece: Boolean(frontmatter.featuredPiece),
    publishedAt: typeof frontmatter.publishedAt === "string" ? frontmatter.publishedAt : undefined,
    description: typeof frontmatter.description === "string" ? frontmatter.description : undefined,
    body,
  };
}

let cachedSheetMusic: SheetMusicDetail[] | null = null;

function loadAllSheetMusic(): SheetMusicDetail[] {
  if (cachedSheetMusic) return cachedSheetMusic;

  const pieces: SheetMusicDetail[] = [];

  for (const [filePath, rawContent] of Object.entries(sheetMusicRawModules)) {
    const slug = parseSlugFromKey(filePath);
    if (!slug) continue;

    try {
      const parsed = parseSheetMusicFile(rawContent, slug);
      pieces.push(parsed);
    } catch (err) {
      console.error(`[sheet-music-loader] Failed to parse ${filePath}:`, err);
    }
  }

  // Sort featured pieces first, then alphabetically by composer and title
  pieces.sort((a, b) => {
    if (a.featuredPiece && !b.featuredPiece) return -1;
    if (!a.featuredPiece && b.featuredPiece) return 1;
    const compCmp = a.composer.localeCompare(b.composer);
    if (compCmp !== 0) return compCmp;
    return a.title.localeCompare(b.title);
  });

  cachedSheetMusic = pieces;
  return pieces;
}

export function getAllSheetMusic(): SheetMusicSummary[] {
  return loadAllSheetMusic().map(({ body: _, ...summary }) => summary);
}

export function getSheetMusicBySlug(slug: string): SheetMusicDetail | null {
  const all = loadAllSheetMusic();
  return all.find((p) => p.slug === slug) ?? null;
}

export function getEras(): MusicalEra[] {
  const all = loadAllSheetMusic();
  const eras = new Set<MusicalEra>();
  all.forEach((p) => {
    if (p.era) eras.add(p.era);
  });
  return Array.from(eras);
}

export function getGenres(): string[] {
  const all = loadAllSheetMusic();
  const genres = new Set<string>();
  all.forEach((p) => {
    if (p.genre) genres.add(p.genre);
  });
  return Array.from(genres);
}

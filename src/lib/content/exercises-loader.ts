import { splitFrontmatter } from "./frontmatter";

export interface ExerciseFrontmatter {
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  skillFocus?: string[];
  startingTempo?: number;
  targetTempo?: number;
  timeSignature?: string;
  handFocus?: string;
  estimatedMinutes?: number;
  series?: string;
  seriesNumber?: number;
  tags?: string[];
  publishedAt?: string;
}

export interface ExerciseSummary extends ExerciseFrontmatter {
  slug: string;
}

export interface ExerciseDetail extends ExerciseSummary {
  body: string;
}

const exerciseRawModules = import.meta.glob<string>("/content/exercises/*.{mdx,md}", {
  query: "?raw",
  import: "default",
  eager: true,
});

function parseSlugFromKey(path: string): string {
  const match = path.match(/\/content\/exercises\/([^/]+)\.(mdx|md)$/);
  return match ? match[1] : "";
}

function parseExerciseFile(raw: string, slug: string): ExerciseDetail {
  const { frontmatter, body } = splitFrontmatter(raw);

  return {
    slug,
    title: (frontmatter.title as string) || slug,
    description: (frontmatter.description as string) || "",
    difficulty: (frontmatter.difficulty as "beginner" | "intermediate" | "advanced") || "intermediate",
    category: (frontmatter.category as string) || "Technique",
    skillFocus: Array.isArray(frontmatter.skillFocus) ? (frontmatter.skillFocus as string[]) : [],
    startingTempo: typeof frontmatter.startingTempo === "number" ? frontmatter.startingTempo : undefined,
    targetTempo: typeof frontmatter.targetTempo === "number" ? frontmatter.targetTempo : undefined,
    timeSignature: typeof frontmatter.timeSignature === "string" ? frontmatter.timeSignature : "4/4",
    handFocus: typeof frontmatter.handFocus === "string" ? frontmatter.handFocus : "Both Hands",
    estimatedMinutes: typeof frontmatter.estimatedMinutes === "number" ? frontmatter.estimatedMinutes : 10,
    series: typeof frontmatter.series === "string" ? frontmatter.series : undefined,
    seriesNumber: typeof frontmatter.seriesNumber === "number" ? frontmatter.seriesNumber : undefined,
    tags: Array.isArray(frontmatter.tags) ? (frontmatter.tags as string[]) : [],
    publishedAt: typeof frontmatter.publishedAt === "string" ? frontmatter.publishedAt : undefined,
    body,
  };
}

let cachedExercises: ExerciseDetail[] | null = null;

function loadAllExercises(): ExerciseDetail[] {
  if (cachedExercises) return cachedExercises;

  const exercises: ExerciseDetail[] = [];

  for (const [filePath, rawContent] of Object.entries(exerciseRawModules)) {
    const slug = parseSlugFromKey(filePath);
    if (!slug) continue;

    try {
      const parsed = parseExerciseFile(rawContent, slug);
      exercises.push(parsed);
    } catch (err) {
      console.error(`[exercises-loader] Failed to parse ${filePath}:`, err);
    }
  }

  // Sort by series & seriesNumber if available, or title
  exercises.sort((a, b) => {
    if (a.series && b.series && a.series === b.series) {
      return (a.seriesNumber ?? 0) - (b.seriesNumber ?? 0);
    }
    return a.title.localeCompare(b.title);
  });

  cachedExercises = exercises;
  return exercises;
}

export function getAllExercises(): ExerciseSummary[] {
  return loadAllExercises().map(({ body: _, ...summary }) => summary);
}

export function getExerciseBySlug(slug: string): ExerciseDetail | null {
  const all = loadAllExercises();
  return all.find((ex) => ex.slug === slug) ?? null;
}

export function getExerciseCategories(): string[] {
  const all = loadAllExercises();
  const categories = new Set<string>();
  all.forEach((ex) => {
    if (ex.category) categories.add(ex.category);
  });
  return Array.from(categories);
}

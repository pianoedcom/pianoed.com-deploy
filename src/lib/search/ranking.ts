/**
 * Search ranking engine.
 *
 * Implements a weighted scoring algorithm with sensible field priorities:
 *
 *   exact title match      > title prefix      > title token match
 *   > heading match        > tag/category match > body match
 *
 * Optional recency weighting is added but never dominates relevance.
 */
import type { PostSummary } from "@/lib/content/types";
import { tokenize, tokenizeAll, tokenFrequencies } from "./tokenize";
/** Field weight configuration. Higher weight = more important. */
export const FIELD_WEIGHTS = {
  /** Exact full-title match (case-insensitive). */
  exactTitle: 100,
  /** Title starts with the query string. */
  titlePrefix: 60,
  /** Individual query tokens found in the title. */
  titleToken: 40,
  /** Tokens found in headings (extracted from body). */
  heading: 25,
  /** Tokens found in category slug. */
  category: 20,
  /** Tokens found in tag slugs. */
  tag: 20,
  /** Tokens found in the description. */
  description: 15,
  /** Tokens found in the body. */
  body: 5,
  /** Tokens found in the author slug. */
  author: 10,
} as const;
/** Maximum recency bonus added to the score (never dominates). */
const MAX_RECENCY_BONUS = 8;
/** Days over which recency decays to zero. */
const RECENCY_WINDOW_DAYS = 365;
/** A scored search document. */
export interface ScoredDocument {
  post: PostSummary;
  score: number;
  highlight?: string;
}
/** Extract heading text from MDX body for indexing. */
function extractHeadingTexts(body: string): string[] {
  const headings: string[] = [];
  const lines = body.split("\n");
  let inCodeBlock = false;
  for (const line of lines) {
    // Track fenced code blocks — skip headings inside them.
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    // ATX headings: ## Heading
    const atxMatch = line.match(/^(#{2,4})\s+(.+)$/);
    if (atxMatch) {
      headings.push(atxMatch[2].trim());
      continue;
    }
    // Setext headings: Heading\n===
    // (handled by looking at pairs — skipped for simplicity)
  }
  return headings;
}
/** Compute a recency bonus based on publication date. */
function recencyBonus(date: string): number {
  const published = new Date(date).getTime();
  if (Number.isNaN(published)) return 0;
  const daysAgo = (Date.now() - published) / (1000 * 60 * 60 * 24);
  if (daysAgo < 0) return MAX_RECENCY_BONUS; // future-dated
  if (daysAgo >= RECENCY_WINDOW_DAYS) return 0;
  // Linear decay from MAX_RECENCY_BONUS to 0 over the window.
  return MAX_RECENCY_BONUS * (1 - daysAgo / RECENCY_WINDOW_DAYS);
}
/** Build a highlight snippet from the body around the first match. */
function buildHighlight(body: string, queryTokens: string[], maxLen = 160): string | undefined {
  if (queryTokens.length === 0) return undefined;
  const lowerBody = body.toLowerCase();
  // Find the first matching query token position.
  let bestPos = -1;
  for (const token of queryTokens) {
    const pos = lowerBody.indexOf(token);
    if (pos !== -1 && (bestPos === -1 || pos < bestPos)) {
      bestPos = pos;
    }
  }
  if (bestPos === -1) return undefined;
  const start = Math.max(0, bestPos - 40);
  const end = Math.min(body.length, bestPos + maxLen - 40);
  let snippet = body.slice(start, end);
  if (start > 0) snippet = "…" + snippet;
  if (end < body.length) snippet += "…";
  return snippet;
}
/**
 * Score a single document against the query.
 *
 * @param post - The post summary to score.
 * @param query - Normalized query string (lowercased, trimmed).
 * @param queryTokens - Tokenized query (stop words removed).
 * @param bodyText - Optional body text for body/heading matching.
 */
export function scoreDocument(
  post: PostSummary,
  query: string,
  queryTokens: string[],
  bodyText?: string,
): ScoredDocument {
  let score = 0;
  const titleLower = post.title.toLowerCase();
  const titleTokens = tokenizeAll(post.title);
  // --- Exact title match ---
  if (titleLower === query) {
    score += FIELD_WEIGHTS.exactTitle;
  }
  // --- Title prefix match ---
  if (titleLower.startsWith(query)) {
    score += FIELD_WEIGHTS.titlePrefix;
  }
  // --- Title token matches ---
  const titleTokenSet = new Set(titleTokens);
  let titleTokenMatches = 0;
  for (const qt of queryTokens) {
    if (titleTokenSet.has(qt)) {
      titleTokenMatches++;
    }
  }
  if (titleTokenMatches > 0) {
    // Full coverage of all query tokens in title gets a bigger boost.
    const coverage = titleTokenMatches / queryTokens.length;
    score +=
      FIELD_WEIGHTS.titleToken * coverage * (titleTokenMatches === queryTokens.length ? 1.5 : 1);
  }
  // --- Category match ---
  const categoryTokens = tokenize(post.category);
  const categoryTokenSet = new Set(categoryTokens);
  for (const qt of queryTokens) {
    if (categoryTokenSet.has(qt)) {
      score += FIELD_WEIGHTS.category;
    }
  }
  // --- Tag matches ---
  for (const tag of post.tags) {
    const tagTokens = tokenize(tag);
    const tagTokenSet = new Set(tagTokens);
    for (const qt of queryTokens) {
      if (tagTokenSet.has(qt)) {
        score += FIELD_WEIGHTS.tag;
      }
    }
  }
  // --- Description match ---
  const descTokens = tokenizeAll(post.description);
  const descTokenSet = new Set(descTokens);
  let descMatches = 0;
  for (const qt of queryTokens) {
    if (descTokenSet.has(qt)) {
      descMatches++;
    }
  }
  if (descMatches > 0) {
    score += FIELD_WEIGHTS.description * (descMatches / queryTokens.length);
  }
  // --- Author match ---
  const authorTokens = tokenize(post.author);
  const authorTokenSet = new Set(authorTokens);
  for (const qt of queryTokens) {
    if (authorTokenSet.has(qt)) {
      score += FIELD_WEIGHTS.author;
    }
  }
  // --- Body & heading matches (only if body text is provided) ---
  let highlight: string | undefined;
  if (bodyText) {
    const headingTexts = extractHeadingTexts(bodyText);
    for (const heading of headingTexts) {
      const headingTokens = tokenizeAll(heading);
      const headingTokenSet = new Set(headingTokens);
      for (const qt of queryTokens) {
        if (headingTokenSet.has(qt)) {
          score += FIELD_WEIGHTS.heading;
        }
      }
    }
    const bodyTokens = tokenize(bodyText);
    const bodyFreq = tokenFrequencies(bodyTokens);
    let bodyMatches = 0;
    for (const qt of queryTokens) {
      if (bodyFreq.has(qt)) {
        bodyMatches++;
        // Diminishing returns for repeated body matches.
        score += FIELD_WEIGHTS.body / (1 + (bodyFreq.get(qt) ?? 1) * 0.1);
      }
    }
    if (bodyMatches > 0) {
      highlight = buildHighlight(bodyText, queryTokens);
    }
  }
  // --- Recency bonus (small, never dominates) ---
  score += recencyBonus(post.date);
  return { post, score, highlight };
}
/**
 * Rank a list of posts against a query.
 *
 * Posts with a score of 0 are excluded. Results are sorted by score
 * descending, then by date descending as a tiebreaker.
 */
export function rankPosts(
  posts: PostSummary[],
  query: string,
  queryTokens: string[],
  bodies?: Map<string, string>,
): ScoredDocument[] {
  const scored = posts
    .map((post) => {
      const body = bodies?.get(post.slug);
      return scoreDocument(post, query, queryTokens, body);
    })
    .filter((doc) => doc.score > 0);
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Tiebreaker: newer posts first.
    return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
  });
  return scored;
}
/**
 * Compute Levenshtein distance between two strings.
 * Used for fuzzy "Did you mean?" suggestions when a query returns zero results.
 */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}
/**
 * Find fuzzy suggestions for a query that returned zero results.
 *
 * Compares the query against all post titles and returns the closest matches.
 */
export function fuzzySuggestions(posts: PostSummary[], query: string, maxResults = 3): string[] {
  const queryLower = query.toLowerCase().trim();
  if (!queryLower) return [];
  const scored = posts.map((post) => {
    const titleLower = post.title.toLowerCase();
    const distance = levenshtein(queryLower, titleLower);
    const maxLen = Math.max(queryLower.length, titleLower.length);
    const similarity = maxLen === 0 ? 0 : 1 - distance / maxLen;
    return { title: post.title, similarity };
  });
  scored.sort((a, b) => b.similarity - a.similarity);
  return scored
    .filter((s) => s.similarity > 0.4)
    .slice(0, maxResults)
    .map((s) => s.title);
}
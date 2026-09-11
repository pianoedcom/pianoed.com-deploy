/**
 * Text tokenizer for the search engine.
 *
 * Splits text into normalized tokens suitable for indexing and querying.
 * Handles Unicode letters/numbers, lowercases, removes diacritics, and
 * filters stop words for better relevance.
 */
/** Common English stop words — removed from tokens to reduce noise. */
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "he",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "that",
  "the",
  "to",
  "was",
  "were",
  "will",
  "with",
  "this",
  "these",
  "those",
  "but",
  "or",
  "not",
  "what",
  "which",
  "who",
  "whom",
  "whose",
  "when",
  "where",
  "why",
  "how",
  "all",
  "any",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "can",
  "just",
  "should",
  "now",
  "i",
  "me",
  "my",
  "we",
  "our",
  "you",
  "your",
  "they",
  "them",
  "their",
  "there",
  "here",
  "about",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "up",
  "down",
  "out",
  "off",
  "over",
  "under",
  "again",
  "further",
  "then",
  "once",
  // PianoEd domain-specific stop words
  "piano",
  "pianist",
  "pianists",
]);
/** Remove diacritics (accents) from a string. */
function removeDiacritics(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
/** Options for tokenization. */
export interface TokenizeOptions {
  /** Whether to remove stop words. Defaults to true. */
  removeStopWords?: boolean;
  /** Minimum token length. Shorter tokens are dropped. Defaults to 1. */
  minLength?: number;
}
/**
 * Tokenize a text string into an array of normalized tokens.
 *
 * - Lowercases
 * - Removes diacritics
 * - Splits on non-alphanumeric characters (Unicode-aware)
 * - Optionally removes stop words
 * - Optionally filters by minimum length
 */
export function tokenize(text: string, options: TokenizeOptions = {}): string[] {
  const { removeStopWords = true, minLength = 1 } = options;
  const cleaned = removeDiacritics(text).toLowerCase();
  // Split on anything that is not a letter or number (Unicode-aware).
  const raw = cleaned.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const tokens: string[] = [];
  for (const token of raw) {
    if (token.length < minLength) continue;
    if (removeStopWords && STOP_WORDS.has(token)) continue;
    tokens.push(token);
  }
  return tokens;
}
/**
 * Tokenize without removing stop words — useful for query matching
 * where we want to match even common words if they appear in the title.
 */
export function tokenizeAll(text: string): string[] {
  return tokenize(text, { removeStopWords: false });
}
/**
 * Generate n-grams from a token for partial matching.
 * Returns the token plus all prefixes of length >= 2.
 */
export function tokenPrefixes(token: string, minLen = 2): string[] {
  const prefixes: string[] = [];
  for (let len = minLen; len < token.length; len++) {
    prefixes.push(token.slice(0, len));
  }
  return prefixes;
}
/**
 * Create a frequency map of tokens.
 * Useful for TF (term frequency) scoring.
 */
export function tokenFrequencies(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }
  return freq;
}
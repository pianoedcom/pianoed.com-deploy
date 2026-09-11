/**
 * Search engine public API.
 *
 * Re-exports the search types, local index, tokenizer, ranking, and query
 * layer. The UI and API route depend on this module, not on individual
 * implementations. An external search adapter (Meilisearch, Typesense,
 * Algolia, OpenSearch) can implement `SearchProvider` and be swapped in
 * without changing the UI.
 */
// --- Types ---
export type { SearchProvider, SearchResult, SearchQueryOptions, SearchResponse } from "./types";
export { normalizeQuery, validateQuery } from "./types";
// --- Tokenizer ---
export { tokenize, tokenizeAll, tokenPrefixes, tokenFrequencies } from "./tokenize";
export type { TokenizeOptions } from "./tokenize";
// --- Ranking ---
export { scoreDocument, rankPosts, FIELD_WEIGHTS } from "./ranking";
export type { ScoredDocument } from "./ranking";
// --- Local index ---
export { LocalSearchIndex, localSearchIndex } from "./local-index";
// --- Query layer ---
export { buildIndex, ensureIndex, searchPosts, resetSearchIndex, isSearchReady } from "./query";
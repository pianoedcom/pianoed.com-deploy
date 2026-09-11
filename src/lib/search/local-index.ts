/**
 * Local in-memory search index.
 *
 * Implements the `SearchProvider` interface using an inverted index built
 * from post summaries. This is the default adapter for local/development
 * use and small-to-medium content sets.
 *
 * The index stores:
 *   - Post summaries (metadata only — bodies are NOT shipped to the browser
 *     for listing; body text is only used server-side for ranking).
 *   - An inverted index mapping tokens → post slugs with field metadata.
 *
 * For large content sets or full-text search across article bodies, an
 * external adapter (Meilisearch, Typesense, Algolia) should be plugged in.
 */
import type { PostSummary } from "@/lib/content/types";
import type { SearchProvider, SearchQueryOptions, SearchResponse, SearchResult } from "./types";
import { tokenize, tokenizeAll } from "./tokenize";
import { rankPosts } from "./ranking";
/** Indexed fields for a single post. */
interface IndexedPost {
  summary: PostSummary;
  titleTokens: string[];
  descriptionTokens: string[];
  categoryTokens: string[];
  tagTokens: string[];
  authorTokens: string[];
  /** Body text — only available when the index is built with bodies. */
  body?: string;
}
/** An entry in the inverted index. */
interface IndexEntry {
  /** Map of slug → field where the token was found. */
  documents: Map<string, Set<string>>;
}
/** Fields tracked in the inverted index. */
type IndexField = "title" | "description" | "category" | "tag" | "author" | "body";
/**
 * Local in-memory search index.
 *
 * Thread-safe for single-threaded JS — the index is a module-level singleton.
 */
export class LocalSearchIndex implements SearchProvider {
  readonly name = "local";
  /** Map of slug → indexed post. */
  private posts = new Map<string, IndexedPost>();
  /** Inverted index: token → IndexEntry. */
  private inverted = new Map<string, IndexEntry>();
  /** Sorted array of tokens for O(log n) prefix matching via binary search. */
  private sortedTokens: string[] = [];
  private ready = false;
  /**
   * Build the index from a list of post summaries.
   *
   * If the posts include `bodyExcerpt` (populated by the content source),
   * the body text is indexed for full-text search matching.
   */
  async index(posts: PostSummary[]): Promise<void> {
    this.clear();
    for (const post of posts) {
      this.addToIndex(post, post.bodyExcerpt);
    }
    this.rebuildSortedTokens();
    this.ready = true;
  }
  /** Add or update a single post in the index. */
  async add(post: PostSummary): Promise<void> {
    // Remove existing entry if present.
    this.removeFromIndex(post.slug);
    this.addToIndex(post);
    this.rebuildSortedTokens();
    this.ready = true;
  }
  /**
   * Add or update a single post with explicit body text for body matching.
   * The body text is stored in the indexed post and used for body/heading
   * matching during search.
   */
  async addWithBody(post: PostSummary, body: string): Promise<void> {
    this.removeFromIndex(post.slug);
    this.addToIndex(post, body);
    this.rebuildSortedTokens();
    this.ready = true;
  }
  /** Remove a post from the index by slug. */
  async remove(slug: string): Promise<void> {
    this.removeFromIndex(slug);
  }
  /** Clear the entire index. */
  clear(): void {
    this.posts.clear();
    this.inverted.clear();
    this.sortedTokens = [];
    this.ready = false;
  }
  /** Whether the index is built and ready. */
  isReady(): boolean {
    return this.ready;
  }
  /** Get the number of indexed documents. */
  size(): number {
    return this.posts.size;
  }
  /** Rebuild the sorted token array from the inverted index keys. */
  private rebuildSortedTokens(): void {
    this.sortedTokens = Array.from(this.inverted.keys()).sort();
  }
  /**
   * Execute a search query against the local index.
   *
   * Uses the ranking engine for scoring. If body text was provided during
   * indexing, it's used for body/heading matching; otherwise only metadata
   * fields are searched.
   */
  async search(query: string, options: SearchQueryOptions = {}): Promise<SearchResponse> {
    const start = performance.now();
    const normalized = query.trim().replace(/\s+/g, " ").toLowerCase();
    const queryTokens = tokenize(normalized);
    if (queryTokens.length === 0 || !this.ready) {
      return {
        results: [],
        total: 0,
        query: normalized,
        tookMs: 0,
      };
    }
    // Get candidate documents using the inverted index.
    const candidateSlugs = this.findCandidates(queryTokens);
    // Apply filters.
    let candidates = Array.from(candidateSlugs)
      .map((slug) => this.posts.get(slug))
      .filter((p): p is IndexedPost => p !== null && p !== undefined);
    if (options.category) {
      candidates = candidates.filter((p) => p.summary.category === options.category);
    }
    if (options.tag) {
      candidates = candidates.filter((p) => p.summary.tags.includes(options.tag as string));
    }
    if (options.author) {
      candidates = candidates.filter((p) => p.summary.author === options.author);
    }
    // Build body map for ranking.
    const bodies = new Map<string, string>();
    for (const c of candidates) {
      if (c.body) {
        bodies.set(c.summary.slug, c.body);
      }
    }
    // Rank candidates.
    const scored = rankPosts(
      candidates.map((c) => c.summary),
      normalized,
      queryTokens,
      bodies,
    );
    // Convert to search results.
    const total = scored.length;
    const offset = options.offset ?? 0;
    const limit = options.limit ?? 20;
    const pageResults = scored.slice(offset, offset + limit);
    const results: SearchResult[] = pageResults.map((doc) => ({
      slug: doc.post.slug,
      title: doc.post.title,
      description: doc.post.description,
      date: doc.post.date,
      author: doc.post.author,
      category: doc.post.category,
      tags: doc.post.tags,
      readingTime: doc.post.readingTime,
      image: doc.post.image,
      imageAlt: doc.post.imageAlt,
      score: doc.score,
      highlight: doc.highlight,
    }));
    const tookMs = Math.round(performance.now() - start);
    return { results, total, query: normalized, tookMs };
  }
  // --- Internal helpers ---
  /**
   * Add a post to both the posts map and the inverted index.
   * If body text is provided, it's tokenized and indexed for body matching.
   */
  private addToIndex(post: PostSummary, bodyText?: string): void {
    const titleTokens = tokenizeAll(post.title);
    const descriptionTokens = tokenizeAll(post.description);
    const categoryTokens = tokenize(post.category);
    const tagTokens = post.tags.flatMap((t) => tokenize(t));
    const authorTokens = tokenize(post.author);
    // Tokenize body text if available for full-text search.
    const bodyTokens = bodyText ? tokenize(bodyText) : [];
    const indexed: IndexedPost = {
      summary: post,
      titleTokens,
      descriptionTokens,
      categoryTokens,
      tagTokens,
      authorTokens,
      body: bodyText,
    };
    this.posts.set(post.slug, indexed);
    // Add to inverted index.
    this.indexTokens(post.slug, titleTokens, "title");
    this.indexTokens(post.slug, descriptionTokens, "description");
    this.indexTokens(post.slug, categoryTokens, "category");
    this.indexTokens(post.slug, tagTokens, "tag");
    this.indexTokens(post.slug, authorTokens, "author");
    // Index body tokens for full-text matching.
    if (bodyTokens.length > 0) {
      this.indexTokens(post.slug, bodyTokens, "body");
    }
  }
  /** Index a set of tokens for a document under a field. */
  private indexTokens(slug: string, tokens: string[], field: IndexField): void {
    for (const token of tokens) {
      let entry = this.inverted.get(token);
      if (!entry) {
        entry = { documents: new Map() };
        this.inverted.set(token, entry);
      }
      let fields = entry.documents.get(slug);
      if (!fields) {
        fields = new Set();
        entry.documents.set(slug, fields);
      }
      fields.add(field);
    }
  }
  /** Remove a post from the index. */
  private removeFromIndex(slug: string): void {
    const indexed = this.posts.get(slug);
    if (!indexed) return;
    // Remove from inverted index.
    const allTokens = new Set([
      ...indexed.titleTokens,
      ...indexed.descriptionTokens,
      ...indexed.categoryTokens,
      ...indexed.tagTokens,
      ...indexed.authorTokens,
      // Include body tokens if they were indexed.
      ...(indexed.body ? tokenize(indexed.body) : []),
    ]);
    for (const token of allTokens) {
      const entry = this.inverted.get(token);
      if (!entry) continue;
      entry.documents.delete(slug);
      if (entry.documents.size === 0) {
        this.inverted.delete(token);
      }
    }
    this.posts.delete(slug);
    // Rebuild sorted tokens since the inverted index changed
    this.rebuildSortedTokens();
  }
  /** Find candidate document slugs using the inverted index. */
  private findCandidates(queryTokens: string[]): Set<string> {
    const candidates = new Set<string>();
    for (const token of queryTokens) {
      // Exact match — O(1) lookup
      const entry = this.inverted.get(token);
      if (entry) {
        for (const slug of entry.documents.keys()) {
          candidates.add(slug);
        }
      }
      // Prefix matches — O(log n + k) via binary search on sorted tokens
      const prefixMatches = this.findPrefixMatches(token);
      for (const matchedToken of prefixMatches) {
        if (matchedToken === token) continue;
        const idxEntry = this.inverted.get(matchedToken);
        if (idxEntry) {
          for (const slug of idxEntry.documents.keys()) {
            candidates.add(slug);
          }
        }
      }
    }
    return candidates;
  }
  /**
   * Binary search the sorted token array for all tokens starting with the
   * given prefix. Returns O(log n + k) where k is the number of matches.
   */
  private findPrefixMatches(prefix: string): string[] {
    const arr = this.sortedTokens;
    if (arr.length === 0) return [];
    // Binary search for the first token >= prefix
    let lo = 0;
    let hi = arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (arr[mid] < prefix) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    // Collect all tokens starting with the prefix
    const matches: string[] = [];
    for (let i = lo; i < arr.length; i++) {
      if (!arr[i].startsWith(prefix)) break;
      matches.push(arr[i]);
    }
    return matches;
  }
}
/** Module-level singleton instance. */
export const localSearchIndex = new LocalSearchIndex();
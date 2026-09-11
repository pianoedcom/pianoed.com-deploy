/**
 * Content pipeline public API.
 *
 * Re-exports the content source interface, the local adapter, and core
 * utilities. The rendering layer should depend on `ContentSource` and receive
 * a concrete adapter via the `getContentSource()` factory, which selects
 * between local and Git-backed sources based on environment configuration.
 */
// --- Imports (hoisted to top to avoid re-export/import naming conflicts) -----
import type { ContentSource } from "./source";
import { localSource, getContentSource, contentSource } from "./source-resolver";
// --- Type re-exports --------------------------------------------------------
export type {
  Author,
  Category,
  Post,
  PostSummary,
  PostStatus,
  Tag,
  ListPostsOptions,
} from "./types";
export type { ContentSource } from "./source";
export { localSource, isSlugPublished } from "./local-source";
export type { GitFileEntry, GitProvider, GitProviderConfig, GitSourceOptions } from "./git";
export { GitProviderError, createGitHubProvider, createGitSource } from "./git";
// Shared frontmatter utilities (used by both local and Git adapters)
export {
  splitFrontmatter,
  validateFrontmatter,
  toSummary,
  toPost,
  deriveStatus,
  categoryName,
  tagName,
} from "./frontmatter";
export { frontmatterSchema, parseFrontmatter } from "./schema";
export type { Frontmatter } from "./schema";
export { CONTENT_EXTENSIONS, KNOWN_CATEGORIES, KNOWN_TAGS, WORDS_PER_MINUTE } from "./constants";
export { slugify, isValidSlug, assertValidSlug } from "./slug";
export { calculateReadingTime, countWords } from "./reading-time";
// Content error classes (Phase 14)
export {
  ContentError,
  ContentNotFoundError,
  ContentValidationError,
  ContentParseError,
  ContentUnavailableError,
  isContentError,
  isContentNotFoundError,
  isContentValidationError,
  isContentParseError,
  isContentUnavailableError,
} from "./errors";
export type { ContentErrorKind } from "./errors";
// Taxonomy & pagination (Phase 9)
export {
  isValidCategory,
  isValidTag,
  isValidAuthor,
  findCategory,
  findTag,
  findAuthor,
  groupByYear,
  groupByYearMonth,
  getArchiveYears,
  getArchiveMonths,
  getPostsByYear,
  getPostsByYearMonth,
  monthName,
  MONTH_NAMES,
} from "./taxonomy";
export { paginate, slicePage, parsePageParam, pageRange, DEFAULT_PAGE_SIZE } from "./pagination";
export type { PaginationResult } from "./pagination";
// Cache & revalidation (Phase 5)
export { contentCache } from "./cache";
export type { CacheProfileName } from "./cache";
export {
  listPostsCached,
  getPostCached,
  getPostsByCategoryCached,
  getPostsByTagCached,
  getAllCategoriesCached,
  getAllTagsCached,
  getAuthorCached,
  getAllAuthorsCached,
  getHomepageLatestCached,
  getHomepageFeaturedCached,
  getHomepageTickerCached,
  getHomepageCategoryCached,
  getHomepageTrendingCached,
  getHomepageAuthorPostsCached,
  getPostsByTranslationKeyCached,
  getAdjacentPosts,
  getRelatedPosts,
} from "./queries";
export {
  revalidatePost,
  revalidatePostIndex,
  revalidateCategory,
  revalidateTag,
  revalidateAuthor,
  revalidateHomepage,
  revalidateAll,
} from "./revalidate";
export {
  postTag,
  categoryTag,
  tagTag,
  authorTag,
  POSTS_TAG,
  CATEGORIES_TAG,
  TAGS_TAG,
  AUTHORS_TAG,
  HOMEPAGE_TAG,
  SEARCH_TAG,
} from "@/lib/cache/tags";
// Redirects & URL lifecycle (Phase 17)
export {
  checkRedirect,
  checkSlugRedirect,
  resolveRedirect,
  recordRuntimeRedirect,
  getRuntimeRedirects,
  clearRuntimeRedirects,
  getAllRedirects,
  getRedirectSources,
  reloadRedirects,
  articlePath,
  normalizeRedirectPath,
  REDIRECT_STATUS_PERMANENT,
  REDIRECT_STATUS_MOVED,
} from "./redirects";
export type { RedirectEntry, RedirectType, RedirectsFile, RedirectCheckResult } from "./redirects";
// Content validation (Phase 18)
export {
  validatePostFrontmatter,
  checkDuplicateSlugs,
  checkAuthorReferences,
  checkInternalLinks,
  checkImageReferences,
  checkHeadingHierarchy,
  checkDraftLeakage,
  checkSeoMetadata,
  checkTaxonomyConsistency,
  extractInternalLinks,
  extractImageReferences,
  discoverContentFiles,
  validateAllContent,
  formatIssue,
  formatReport,
} from "./validation";
export type {
  Severity,
  ValidationIssue,
  FileValidationResult,
  ValidationReport,
  ContentFile,
} from "./validation";
// --- Source re-exports (logic lives in source-resolver.ts) ------------------
export { getContentSource, contentSource };
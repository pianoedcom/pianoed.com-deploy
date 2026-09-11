/** Known category slugs. Posts must reference one of these. */
export const KNOWN_CATEGORIES = [
  "history-culture",
  "learning-technique",
  "modern-developments",
  "sheet-music-practice",
  "gear-reviews",
  "artists-performers",
  "genres-repertoire",
  "piano-technology",
] as const;
/** Known tag slugs. Posts may only use tags from this list. */
export const KNOWN_TAGS = [
  "piano",
  "classical",
  "jazz",
  "pop-piano",
  "beginners",
  "technique",
  "practice",
  "sheet-music",
  "acoustic-pianos",
  "digital-pianos",
  "hybrid-pianos",
  "accessories",
  "pianists",
  "history",
  "piano-technology",
  "contemporary",
] as const;
export const WORDS_PER_MINUTE = 200;
/** Minimum reading time in minutes (never report 0). */
export const MIN_READING_TIME = 1;
/** Supported file extensions for content posts. */
export const CONTENT_EXTENSIONS = [".mdx", ".md"];
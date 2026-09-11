import { MIN_READING_TIME, WORDS_PER_MINUTE } from "./constants";
/**
 * Reading-time estimation.
 */
/** Count words in a markdown/MDX body (strips code fences and markup). */
export function countWords(body: string): number {
  const stripped = body
    .replace(/```[\s\S]*?```/g, " ") // remove code blocks
    .replace(/`[^`]*`/g, " ") // remove inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // remove images
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ") // remove links
    .replace(/[#>*_~-]/g, " ") // remove markdown syntax chars
    .trim();
  if (!stripped) return 0;
  return stripped.split(/\s+/).filter(Boolean).length;
}
/** Estimate reading time in minutes (minimum 1). */
export function calculateReadingTime(body: string): number {
  const words = countWords(body);
  const minutes = Math.round(words / WORDS_PER_MINUTE);
  return Math.max(MIN_READING_TIME, minutes);
}
/**
 * Canonical tag definitions for PianoEd.
 *
 * Post frontmatter `tags` values must match slugs from this list.
 */
export interface TagRef {
  slug: string;
  name: string;
  count: number;
}
export const tags: TagRef[] = [
  { slug: "piano", name: "Piano", count: 0 },
  { slug: "classical", name: "Classical", count: 0 },
  { slug: "jazz", name: "Jazz", count: 0 },
  { slug: "pop-piano", name: "Pop Piano", count: 0 },
  { slug: "beginners", name: "Beginners", count: 0 },
  { slug: "technique", name: "Technique", count: 0 },
  { slug: "practice", name: "Practice", count: 0 },
  { slug: "sheet-music", name: "Sheet Music", count: 0 },
  { slug: "acoustic-pianos", name: "Acoustic Pianos", count: 0 },
  { slug: "digital-pianos", name: "Digital Pianos", count: 0 },
  { slug: "hybrid-pianos", name: "Hybrid Pianos", count: 0 },
  { slug: "accessories", name: "Accessories", count: 0 },
  { slug: "pianists", name: "Pianists", count: 0 },
  { slug: "history", name: "History", count: 0 },
  { slug: "piano-technology", name: "Piano Technology", count: 0 },
  { slug: "contemporary", name: "Contemporary", count: 0 },
];
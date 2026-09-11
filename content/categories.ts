/**
 * Canonical category definitions for PianoEd.
 *
 * Post frontmatter `category` values must match one of these slugs.
 */
export interface CategoryRef {
  slug: string;
  name: string;
  description?: string;
}
export const categories: CategoryRef[] = [
  { slug: "history-culture", name: "History & Culture", description: "The piano's rich history, legendary performers, cultural impact, and the evolution of the instrument across centuries." },
  { slug: "learning-technique", name: "Learning & Technique", description: "Practical advice for beginners and active learners: technique tips, practice routines, hand positioning, and structured learning paths." },
  { slug: "modern-developments", name: "Modern Developments", description: "Coverage of new instruments, piano technology innovations, contemporary artists, and industry news shaping the piano world today." },
  { slug: "sheet-music-practice", name: "Sheet Music & Practice", description: "Annotated sheet music recommendations, practice plans, downloadable exercises, and repertoire guides across all genres." },
  { slug: "gear-reviews", name: "Gear & Reviews", description: "Hands-on reviews and comparisons of acoustic, digital, and hybrid pianos, plus accessories like pedals, benches, and metronomes." },
  { slug: "artists-performers", name: "Artists & Performers", description: "Profiles and spotlights on pianists past and present — from classical virtuosos to jazz legends and contemporary artists." },
  { slug: "genres-repertoire", name: "Genres & Repertoire", description: "Exploration of musical genres — classical, jazz, pop, contemporary — and the repertoire that defines each, treated equally." },
  { slug: "piano-technology", name: "Piano Technology", description: "Deep dives into piano mechanics, digital innovation, hybrid systems, and the engineering behind the instrument." },
];
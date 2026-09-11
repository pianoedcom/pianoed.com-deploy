import { describe, it, expect } from "vitest";
import { calculateReadingTime, countWords } from "@/lib/content/reading-time";
describe("reading-time", () => {
  it("counts words in plain text", () => {
    expect(countWords("one two three")).toBe(3);
  });
  it("strips code blocks before counting", () => {
    const body = "intro\n\n```ts\nconst x = 1;\n```\n\noutro word";
    expect(countWords(body)).toBe(3);
  });
  it("strips markdown syntax", () => {
    expect(countWords("# Heading\n\n**bold** _italic_")).toBe(3);
  });
  it("returns minimum 1 for short content", () => {
    expect(calculateReadingTime("short")).toBe(1);
  });
  it("estimates proportional reading time", () => {
    // 200 wpm default -> 400 words = 2 minutes
    const body = Array.from({ length: 400 }, (_, i) => `word${i}`).join(" ");
    expect(calculateReadingTime(body)).toBe(2);
  });
});
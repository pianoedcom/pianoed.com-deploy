import { describe, it, expect } from "vitest";
import { slugify, isValidSlug, assertValidSlug } from "@/lib/content/slug";
describe("slug", () => {
  it("slugifies a simple title", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });
  it("handles special characters and diacritics", () => {
    expect(slugify("Café & Crème!")).toBe("cafe-creme");
  });
  it("collapses repeated hyphens and trims", () => {
    expect(slugify("  ---  Multiple   Spaces  ---  ")).toBe("multiple-spaces");
  });
  it("validates a correct slug", () => {
    expect(isValidSlug("hello-world")).toBe(true);
    expect(isValidSlug("Hello_World")).toBe(false);
    expect(isValidSlug("hello world")).toBe(false);
    expect(isValidSlug("")).toBe(false);
  });
  it("assertValidSlug throws on invalid slug", () => {
    expect(() => assertValidSlug("Bad Slug")).toThrow();
    expect(() => assertValidSlug("good-slug")).not.toThrow();
  });
});
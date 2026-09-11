import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ArticleHero from "@/components/article/ArticleHero";
import type { Post } from "@/lib/content";

const mockPost: Post = {
  slug: "test-article",
  title: "Test Article Title",
  description: "Test description",
  date: "2026-01-01",
  author: "site-team",
  category: "learning-technique",
  tags: ["piano"],
  published: true,
  featured: false,
  status: "published",
  readingTime: 5,
  noindex: false,
  body: "Article content",
  image: "/images/posts/test.jpg",
  imageAlt: "A metronome and sheet music on a piano",
};

describe("ArticleHero", () => {
  it("renders null if post has no image", () => {
    const { container } = render(<ArticleHero post={{ ...mockPost, image: undefined }} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders image and does not render imageAlt text as caption when image loads fine", () => {
    render(<ArticleHero post={mockPost} />);

    // Image element exists with correct alt attribute
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "A metronome and sheet music on a piano");

    // Caption should not be rendered on the page
    expect(screen.queryByText("A metronome and sheet music on a piano")).toBeNull();
  });

  it("renders imageAlt text as caption only if the image fails to load", () => {
    render(<ArticleHero post={mockPost} />);

    const img = screen.getByRole("img");
    fireEvent.error(img);

    // Caption should now appear as fallback explanation
    expect(screen.getByText("A metronome and sheet music on a piano")).toBeInTheDocument();
  });
});

import { useEffect, useState } from "react";
import { buildJsonFeed, jsonFeedToString } from "@/lib/seo/json-feed";
import { listPostsCached, getAllAuthorsCached } from "@/lib/content/queries";
/**
 * JSON Feed 1.1 route — serves /feed.json.
 * Generates a valid JSON Feed from all published posts.
 */
const JsonFeedPage = () => {
  const [feedJson, setFeedJson] = useState<string>("");
  useEffect(() => {
    async function generate() {
      try {
        const [posts, authors] = await Promise.all([listPostsCached(), getAllAuthorsCached()]);
        const authorMap = new Map(authors.map((a) => [a.slug, a]));
        const feed = buildJsonFeed(posts, authorMap);
        setFeedJson(jsonFeedToString(feed));
      } catch (err) {
        console.error("[feed.json] Failed to generate JSON feed:", err);
      }
    }
    generate();
  }, []);
  useEffect(() => {
    if (!feedJson) return;
    // Set the content type to application/json and render as preformatted text
    const blob = new Blob([feedJson], { type: "application/feed+json" });
    const url = URL.createObjectURL(blob);
    // Redirect to the blob URL so the browser downloads/displays JSON
    window.location.href = url;
  }, [feedJson]);
  return null;
};
export default JsonFeedPage;
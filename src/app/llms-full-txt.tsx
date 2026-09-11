/**
 * /llms-full.txt route — expanded AEO content index.
 *
 * Serves a comprehensive plain-text index of all published articles
 * with descriptions, categories, tags, and canonical URLs for LLM indexing.
 */
import { useEffect, useState } from "react";
import {
  listPostsCached,
  getAllAuthorsCached,
  getAllCategoriesCached,
  getAllTagsCached,
} from "@/lib/content";
import { generateLlmsFullTxt } from "@/lib/seo/llms-txt";
const LlmsFullTxtPage = () => {
  const [content, setContent] = useState<string>("");
  useEffect(() => {
    (async () => {
      const [posts, authors, categories, tags] = await Promise.all([
        listPostsCached(),
        getAllAuthorsCached(),
        getAllCategoriesCached(),
        getAllTagsCached(),
      ]);
      const authorMap = new Map(authors.map((a) => [a.slug, a]));
      const txt = generateLlmsFullTxt(posts, authorMap, categories, tags);
      setContent(txt);
    })();
  }, []);
  useEffect(() => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain; charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.location.href = url;
  }, [content]);
  return null;
};
export default LlmsFullTxtPage;
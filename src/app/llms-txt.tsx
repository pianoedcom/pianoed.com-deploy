/**
 * /llms.txt route — AEO (Answer Engine Optimization) endpoint.
 *
 * Serves a structured plain-text index of the site for LLM/answer-engine
 * crawlers. Also generates /llms-full.txt with the complete article index.
 */
import { useEffect, useState } from "react";
import {
  listPostsCached,
  getAllAuthorsCached,
  getAllCategoriesCached,
  getAllTagsCached,
} from "@/lib/content";
import { generateLlmsTxt, generateLlmsFullTxt } from "@/lib/seo/llms-txt";
const LlmsTxtPage = () => {
  const [content, setContent] = useState<string>("");
  useEffect(() => {
    (async () => {
      const txt = generateLlmsTxt();
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
export default LlmsTxtPage;
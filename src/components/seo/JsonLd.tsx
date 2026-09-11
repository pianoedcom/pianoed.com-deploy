/**
 * JsonLd — injects JSON-LD structured data into the document head.
 *
 * Serializes the schema object safely via JSON.stringify (which handles
 * quote escaping) and injects it as a <script type="application/ld+json">
 * element. The component cleans up the element on unmount to avoid
 * duplicate schema entries when navigating between routes.
 *
 * Safety: we never inject raw HTML. JSON.stringify escapes all special
 * characters in string values, and the script type is
 * "application/ld+json" which browsers do not execute as JavaScript.
 */
import { useEffect, useRef } from "react";
interface JsonLdProps {
  /** The schema.org object to serialize. */
  schema: Record<string, unknown>;
  /** Optional unique key to deduplicate (defaults to the schema @id). */
  id?: string;
}
/**
 * Inject a JSON-LD <script> tag into the document head.
 * Removes the tag on unmount to prevent stale schema entries.
 */
const JsonLd = ({ schema, id }: JsonLdProps) => {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  useEffect(() => {
    const schemaId = id ?? (schema["@id"] as string) ?? "jsonld";
    const selector = `script[data-jsonld-id="${CSS.escape(schemaId)}"]`;
    // Remove any existing script with the same ID to avoid duplicates.
    const existing = document.head.querySelector(selector);
    if (existing) {
      existing.remove();
    }
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-jsonld-id", schemaId);
    // JSON.stringify safely escapes all string content.
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    scriptRef.current = script;
    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
    };
  }, [schema, id]);
  return null;
};
export default JsonLd;
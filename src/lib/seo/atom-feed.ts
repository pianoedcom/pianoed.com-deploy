/**
 * Atom 1.0 feed generator.
 *
 * Creates a valid Atom 1.0 feed from published posts, complementing the
 * existing RSS 2.0 and JSON Feed formats. Some feed readers prefer Atom
 * for its well-defined IETF standard (RFC 4287).
 *
 * @see https://www.rfc-editor.org/rfc/rfc4287
 */
import { siteConfig } from "@/lib/site-config";
import { buildUrl } from "@/lib/seo/metadata";
import type { FeedItem } from "./feed";
const AMP = String.fromCharCode(38) + "amp;";
const LT = String.fromCharCode(38) + "lt;";
const GT = String.fromCharCode(38) + "gt;";
const QUOT = String.fromCharCode(38) + "quot;";
const APOS = String.fromCharCode(38) + "apos;";
/** Escape a string for safe inclusion in XML. */
function escapeXml(str: string): string {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    if (ch === 38) result += AMP;
    else if (ch === 60) result += LT;
    else if (ch === 62) result += GT;
    else if (ch === 34) result += QUOT;
    else if (ch === 39) result += APOS;
    else result += str[i];
  }
  return result;
}
/**
 * Serialize feed items to an Atom 1.0 XML document.
 *
 * Accepts the same `FeedItem` structure used by the RSS 2.0 generator
 * so both feeds share identical data preparation logic.
 */
export function atomFeedToXml(items: FeedItem[]): string {
  const updated =
    items.length > 0 ? new Date(items[0].pubDate).toISOString() : new Date().toISOString();
  const entriesXml = items
    .map((item) => {
      let xml = "  <entry>\n";
      xml += `    <title>${escapeXml(item.title)}</title>\n`;
      xml += `    <link href="${escapeXml(item.link)}" />\n`;
      xml += `    <id>${escapeXml(item.guid)}</id>\n`;
      xml += `    <updated>${new Date(item.pubDate).toISOString()}</updated>\n`;
      xml += `    <published>${new Date(item.pubDate).toISOString()}</published>\n`;
      if (item.author) {
        xml += "    <author>\n";
        xml += `      <name>${escapeXml(item.author)}</name>\n`;
        xml += "    </author>\n";
      }
      xml += `    <summary>${escapeXml(item.description)}</summary>\n`;
      if (item.contentEncoded) {
        xml += `    <content type="text"><![CDATA[${escapeXml(item.contentEncoded)}]]></content>\n`;
      }
      for (const cat of item.categories) {
        xml += `    <category term="${escapeXml(cat)}" />\n`;
      }
      xml += "  </entry>";
      return xml;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(siteConfig.name)}</title>
  <link href="${escapeXml(siteConfig.url)}" />
  <link href="${escapeXml(buildUrl("/atom.xml"))}" rel="self" type="application/atom+xml" />
  <id>${escapeXml(siteConfig.url)}</id>
  <updated>${updated}</updated>
  <subtitle>${escapeXml(siteConfig.description)}</subtitle>
  <generator>Inkwell Blog Starter Kit</generator>
${entriesXml}
</feed>`;
}
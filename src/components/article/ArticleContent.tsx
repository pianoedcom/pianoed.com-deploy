import { MdxRenderer } from "@/components/mdx";
interface ArticleContentProps {
  /** Raw MDX body (frontmatter already stripped). */
  body: string;
  /** Post slug — used to look up pre-compiled MDX modules. */
  slug?: string;
}
/**
 * Article body wrapper — renders MDX through the controlled component
 * registry inside the prose-article typography container.
 */
const ArticleContent = ({ body, slug }: ArticleContentProps) => {
  return (
    <div className="prose-article text-lg leading-relaxed mt-10">
      <MdxRenderer body={body} slug={slug} />
    </div>
  );
};
export default ArticleContent;
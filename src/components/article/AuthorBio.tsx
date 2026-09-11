import type { Author } from "@/lib/content";
interface AuthorBioProps {
  author: Author;
}
/**
 * Author bio card — shown at the end of an article. Displays avatar,
 * name, bio, and optional social links.
 */
const AuthorBio = ({ author }: AuthorBioProps) => {
  return (
    <footer className="mt-12 rounded-lg border border-border bg-muted/30 p-6">
      <div className="flex items-start gap-4">
        {author.avatar ? (
          <img
            src={author.avatar}
            alt={author.name}
            className="h-12 w-12 rounded-full border border-border object-cover"
          />
        ) : null}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Written by {author.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{author.bio}</p>
          {author.social ? (
            <div className="mt-3 flex flex-wrap gap-3 text-xs">
              {author.social.twitter ? (
                <a
                  href={author.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                >
                  Twitter
                </a>
              ) : null}
              {author.social.github ? (
                <a
                  href={author.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                >
                  GitHub
                </a>
              ) : null}
              {author.social.linkedin ? (
                <a
                  href={author.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                >
                  LinkedIn
                </a>
              ) : null}
              {author.social.website ? (
                <a
                  href={author.social.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                >
                  Website
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
};
export default AuthorBio;
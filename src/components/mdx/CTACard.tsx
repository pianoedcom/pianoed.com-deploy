import { cn } from "@/lib/utils";
interface CTACardProps {
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
  className?: string;
}
/**
 * Call-to-action card for converting readers into agency clients.
 * Styled with the accent color to draw attention.
 */
const CTACard = ({
  title,
  description,
  buttonText = "Get in touch",
  buttonHref = "/contact",
  className,
}: CTACardProps) => {
  return (
    <div className={cn("my-6 rounded-lg border border-accent/30 bg-accent/5 p-6", className)}>
      <h3 className="mb-2 text-lg font-bold text-foreground">{title}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      <a
        href={buttonHref}
        className="inline-flex items-center gap-1.5 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {buttonText}
      </a>
    </div>
  );
};
export default CTACard;
import type { ReactNode } from "react";
import {
  Accordion as ShadcnAccordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
/**
 * AccordionGroup — collapsible FAQ or deep-dive sections for MDX.
 *
 * Wraps the shadcn Accordion with sensible defaults for article use.
 * Each item uses a unique value derived from its index.
 *
 * Usage in MDX:
 *   <AccordionGroup>
 *     <AccordionItem title="What is X?">
 *       Detailed answer here.
 *     </AccordionItem>
 *   </AccordionGroup>
 */
interface AccordionGroupProps {
  children: ReactNode;
  /** Allow multiple items open simultaneously. */
  type?: "single" | "multiple";
  /** Default open item value (for single type). */
  defaultValue?: string;
}
export const AccordionGroup = ({
  children,
  type = "single",
  defaultValue,
}: AccordionGroupProps) => {
  if (type === "multiple") {
    return (
      <ShadcnAccordion
        type="multiple"
        defaultValue={defaultValue ? [defaultValue] : undefined}
        className="my-6 w-full"
      >
        {children}
      </ShadcnAccordion>
    );
  }
  return (
    <ShadcnAccordion type="single" collapsible defaultValue={defaultValue} className="my-6 w-full">
      {children}
    </ShadcnAccordion>
  );
};
interface AccordionItemProps {
  title: string;
  children: ReactNode;
  value?: string;
}
export const AccordionItemWrapper = ({ title, children, value }: AccordionItemProps) => (
  <AccordionItem value={value ?? title.toLowerCase().replace(/\s+/g, "-")}>
    <AccordionTrigger className="text-left text-base font-semibold text-foreground">
      {title}
    </AccordionTrigger>
    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
      {children}
    </AccordionContent>
  </AccordionItem>
);
export { AccordionItemWrapper as AccordionItem };
export default AccordionGroup;
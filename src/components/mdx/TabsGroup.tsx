import type { ReactNode } from "react";
import { Tabs as ShadcnTabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
/**
 * TabsGroup — tabbed content sections for MDX.
 *
 * Ideal for code snippet language tabs, multi-step guides, or
 * side-by-side comparisons within an article.
 *
 * Usage in MDX:
 *   <TabsGroup defaultValue="js">
 *     <TabsList>
 *       <TabsTrigger value="js">JavaScript</TabsTrigger>
 *       <TabsTrigger value="py">Python</TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="js">console.log("Hello")</TabsContent>
 *     <TabsContent value="py">print("Hello")</TabsContent>
 *   </TabsGroup>
 */
interface TabsGroupProps {
  children: ReactNode;
  defaultValue: string;
  className?: string;
}
export { ShadcnTabs as TabsGroup, TabsList, TabsTrigger, TabsContent };
export default ShadcnTabs;
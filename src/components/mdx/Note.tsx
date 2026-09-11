import type { ComponentProps } from "react";
import { Callout } from "./Callout";
/**
 * Note — a callout variant for general notes and asides.
 */
export const Note = (props: Omit<ComponentProps<typeof Callout>, "variant">) => (
  <Callout variant="note" {...props} />
);
export default Note;
import type { ComponentProps } from "react";
import { Callout } from "./Callout";
/**
 * Warning — a callout variant for cautions and pitfalls.
 */
export const Warning = (props: Omit<ComponentProps<typeof Callout>, "variant">) => (
  <Callout variant="warning" {...props} />
);
export default Warning;
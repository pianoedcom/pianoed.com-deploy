import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        outline:
          "border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        solid: "bg-primary text-primary-foreground hover:bg-primary/90",
      },
      size: {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "md",
    },
  },
);
export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof iconButtonVariants> {
  asChild?: boolean;
  /** Accessible label — required since the button contains only an icon. */
  label: string;
}
/**
 * Icon-only button with mandatory accessible label.
 * Renders as a <button> by default; use `asChild` to slot into a <Link>.
 */
const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, asChild = false, label, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(iconButtonVariants({ variant, size, className }))}
        ref={ref}
        aria-label={label}
        {...props}
      />
    );
  },
);
IconButton.displayName = "IconButton";
export { IconButton, iconButtonVariants };
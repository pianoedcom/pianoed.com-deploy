import type { ReactNode } from "react";

export interface DefinitionProps {
  children: ReactNode;
}

export const Definition = ({ children }: DefinitionProps) => {
  return (
    <div className="text-base sm:text-lg leading-relaxed text-foreground font-normal">
      {children}
    </div>
  );
};

export default Definition;

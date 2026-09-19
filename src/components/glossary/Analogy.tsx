import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export interface AnalogyProps {
  children: ReactNode;
  label?: string;
}

export const Analogy = ({ children, label = "Analogy & Practice Tip" }: AnalogyProps) => {
  return (
    <div className="mt-3.5 rounded-lg border border-accent/30 bg-accent/5 p-3.5 sm:p-4 text-sm sm:text-base leading-relaxed text-foreground">
      <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-accent text-xs sm:text-sm tracking-wide uppercase">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <div className="italic text-muted-foreground">{children}</div>
    </div>
  );
};

export default Analogy;

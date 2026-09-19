import React from "react";
import { Check } from "lucide-react";

interface ExerciseStepGuideProps {
  steps: string[];
  title?: string;
  className?: string;
}

export const ExerciseStepGuide: React.FC<ExerciseStepGuideProps> = ({
  steps,
  title = "Step-by-Step Practice Guide",
  className = "",
}) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className={`my-6 rounded-xl border border-border bg-card p-5 ${className}`}>
      {title && (
        <h4 className="mb-4 font-serif text-lg font-semibold text-foreground border-b border-border pb-2">
          {title}
        </h4>
      )}
      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start gap-3 text-sm text-foreground leading-relaxed">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
              {index + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default ExerciseStepGuide;

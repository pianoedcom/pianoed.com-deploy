import React from "react";

interface ExerciseDifficultyBadgeProps {
  difficulty: "beginner" | "intermediate" | "advanced";
  className?: string;
}

const styles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  beginner: {
    bg: "bg-emerald-500/10 border-emerald-500/30",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    label: "Beginner",
  },
  intermediate: {
    bg: "bg-amber-500/10 border-amber-500/30",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    label: "Intermediate",
  },
  advanced: {
    bg: "bg-rose-500/10 border-rose-500/30",
    text: "text-rose-700 dark:text-rose-400",
    dot: "bg-rose-500",
    label: "Advanced",
  },
};

export const ExerciseDifficultyBadge: React.FC<ExerciseDifficultyBadgeProps> = ({
  difficulty,
  className = "",
}) => {
  const conf = styles[difficulty] || styles.intermediate;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${conf.bg} ${conf.text} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${conf.dot}`} aria-hidden />
      {conf.label}
    </span>
  );
};

export default ExerciseDifficultyBadge;

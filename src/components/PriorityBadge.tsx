import React from "react";
import { PriorityLevel } from "../types";
import { getPriorityColor } from "../utils/categoryUtils";
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

interface PriorityBadgeProps {
  score: number;
  level: PriorityLevel;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
  id?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  score,
  level,
  showScore = true,
  size = "md",
  id
}) => {
  const colors = getPriorityColor(level);

  const getIcon = () => {
    switch (level) {
      case "CRITICAL":
        return <AlertCircle className="w-3.5 h-3.5 shrink-0" />;
      case "HIGH":
        return <AlertTriangle className="w-3.5 h-3.5 shrink-0" />;
      case "MEDIUM":
        return <Info className="w-3.5 h-3.5 shrink-0" />;
      case "LOW":
        return <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />;
    }
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-semibold",
    md: "px-2.5 py-1 text-xs font-semibold",
    lg: "px-3.5 py-1.5 text-sm font-bold"
  }[size];

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1.5 rounded-md border whitespace-nowrap ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses}`}
    >
      {getIcon()}
      <span>{level}</span>
      {showScore && (
        <span className="opacity-80 font-mono text-[11px]">
          ({score}/100)
        </span>
      )}
    </span>
  );
};

import React from "react";
import { ComplaintStatus } from "../types";
import { formatStatusLabel, getStatusBadgeColor } from "../utils/categoryUtils";

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: "sm" | "md" | "lg";
  id?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md", id }) => {
  const colors = getStatusBadgeColor(status);
  const label = formatStatusLabel(status);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm"
  }[size];

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border whitespace-nowrap ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      <span>{label}</span>
    </span>
  );
};

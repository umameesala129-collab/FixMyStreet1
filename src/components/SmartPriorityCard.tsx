import React from "react";
import { Issue, PriorityBreakdown } from "../types";
import { PriorityBadge } from "./PriorityBadge";
import {
  Flame,
  Info,
  Layers,
  MapPin,
  Clock,
  School,
  AlertTriangle
} from "lucide-react";

interface SmartPriorityCardProps {
  score: number;
  level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  breakdown?: PriorityBreakdown;
  compact?: boolean;
  id?: string;
}

export const SmartPriorityCard: React.FC<SmartPriorityCardProps> = ({
  score,
  level,
  breakdown,
  compact = false,
  id
}) => {
  // Derive human explanation tags
  const factors: string[] = [];
  if (breakdown) {
    if (breakdown.factors && breakdown.factors.length > 0) {
      factors.push(...breakdown.factors);
    } else {
      if (breakdown.severityScore >= 30) factors.push("High/Critical physical hazard severity");
      if (breakdown.reportsScore >= 15) factors.push("Multiple corroborating citizen reports nearby");
      if (breakdown.locationScore >= 5) factors.push("Located on major arterial road corridor");
      if (breakdown.ageScore >= 5) factors.push("Extended unresolved duration");
    }
  } else {
    if (score >= 80) factors.push("High physical impact hazard on primary roadway with multiple reports");
    else if (score >= 60) factors.push("Medium severity community infrastructure issue");
    else factors.push("Standard maintenance queue priority");
  }

  const getScoreColor = () => {
    if (level === "CRITICAL") return "text-rose-600 border-rose-200 bg-rose-50";
    if (level === "HIGH") return "text-orange-600 border-orange-200 bg-orange-50";
    if (level === "MEDIUM") return "text-amber-600 border-amber-200 bg-amber-50";
    return "text-slate-600 border-slate-200 bg-slate-50";
  };

  const getProgressColor = () => {
    if (level === "CRITICAL") return "bg-rose-500";
    if (level === "HIGH") return "bg-orange-500";
    if (level === "MEDIUM") return "bg-amber-500";
    return "bg-slate-400";
  };

  if (compact) {
    return (
      <div id={id} className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold border ${getScoreColor()}`}>
          {score}/100
        </span>
        <PriorityBadge score={score} level={level} size="sm" />
      </div>
    );
  }

  return (
    <div id={id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className={`w-4 h-4 ${level === "CRITICAL" ? "text-rose-600" : "text-amber-500"}`} />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Automated Triage Score
          </h4>
        </div>
        <PriorityBadge score={score} level={level} size="sm" />
      </div>

      {/* Numerical score indicator bar */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-slate-900">{score}</span>
            <span className="text-xs text-slate-400 font-medium">/ 100</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            {level} PRIORITY
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
          />
        </div>
      </div>

      {/* Human-readable "Why?" justification */}
      <div className="pt-2 border-t border-slate-100 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>Why this score?</span>
        </div>

        <ul className="space-y-1 text-xs text-slate-600">
          {factors.map((factor, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-blue-500 font-bold text-xs mt-0.5">&bull;</span>
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

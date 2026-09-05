import React, { useState } from "react";
import { Issue, DepartmentType } from "../types";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { ALL_DEPARTMENTS } from "../utils/categoryUtils";
import {
  Flame,
  AlertTriangle,
  ArrowUpDown,
  ChevronRight,
  Filter,
  MapPin,
  Building2,
  Clock,
  Layers,
  CheckCircle2,
  Users
} from "lucide-react";

interface PriorityQueueViewProps {
  issues: Issue[];
  onSelectIssue: (id: string) => void;
  id?: string;
}

export const PriorityQueueView: React.FC<PriorityQueueViewProps> = ({
  issues = [],
  onSelectIssue,
  id
}) => {
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [onlyUnresolved, setOnlyUnresolved] = useState<boolean>(true);

  const safeIssues = Array.isArray(issues) ? issues : [];

  // Filter and sort by priority_score descending
  const queue = safeIssues
    .filter((item) => {
      if (!item) return false;
      if (onlyUnresolved && (item.status === "RESOLVED" || item.status === "CITIZEN_VERIFIED")) {
        return false;
      }
      if (selectedDept !== "ALL" && item.department !== selectedDept) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.priority_score - a.priority_score);

  return (
    <div id={id || "priority-queue-view"} className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4" />
            <span>Autonomous Triage Engine</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Municipal Priority Queue
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked work orders dynamically weighted by public safety severity, report frequency, and corridor criticality.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Dept:</span>
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs py-1.5 px-3 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:border-blue-500 focus:outline-hidden shadow-2xs"
            >
              <option value="ALL">All Departments</option>
              {ALL_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyUnresolved}
              onChange={(e) => setOnlyUnresolved(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Active Issues Only</span>
          </label>
        </div>
      </div>

      {/* Priority Stack List */}
      <div className="space-y-3">
        {queue.map((issue, index) => {
          const isTopTier = issue.priority_score >= 85;

          return (
            <div
              key={issue.id}
              onClick={() => onSelectIssue(issue.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group ${
                isTopTier
                  ? "bg-white border-rose-200/90 hover:border-rose-400 hover:shadow-md"
                  : "bg-white border-slate-200 hover:border-blue-400 hover:shadow-sm"
              }`}
            >
              {/* Left: Score Badge + Identity */}
              <div className="flex items-center gap-4 min-w-0">
                {/* Ranking Rank + Score Pill */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-6 text-center font-mono text-xs font-bold text-slate-400">
                    #{index + 1}
                  </span>
                  <div
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono border shadow-2xs ${
                      issue.priority_level === "CRITICAL"
                        ? "bg-rose-50 border-rose-200 text-rose-700"
                        : issue.priority_level === "HIGH"
                        ? "bg-orange-50 border-orange-200 text-orange-700"
                        : "bg-amber-50 border-amber-200 text-amber-700"
                    }`}
                  >
                    <span className="text-lg font-black leading-none">{issue.priority_score}</span>
                    <span className="text-[9px] font-bold uppercase tracking-tight mt-0.5">
                      {issue.priority_level}
                    </span>
                  </div>
                </div>

                {/* Thumb + Title */}
                <img
                  src={issue.image_path}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 hidden md:block"
                  referrerPolicy="no-referrer"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-600">
                      {issue.id}
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {issue.category}
                    </span>
                    {issue.is_main_road && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        Main Arterial
                      </span>
                    )}
                    {issue.related_reports_count > 1 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center gap-1">
                        <Users className="w-2.5 h-2.5" />
                        <span>{issue.related_reports_count} Reports</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mt-0.5">
                    {issue.title}
                  </h3>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{issue.address}</span>
                  </div>
                </div>
              </div>

              {/* Right: Department & Action */}
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 justify-start sm:justify-end">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>{issue.department}</span>
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={issue.status} size="sm" />
                  </div>
                </div>

                <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}

        {queue.length === 0 && (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No complaints currently match this priority filter.
          </div>
        )}
      </div>
    </div>
  );
};

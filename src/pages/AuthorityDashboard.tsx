import React, { useState } from "react";
import { Issue, DepartmentType, ComplaintStatus, PriorityLevel } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import {
  ALL_DEPARTMENTS,
  ALL_CATEGORIES,
  ALL_STATUSES
} from "../utils/categoryUtils";
import {
  Shield,
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck,
  ChevronRight,
  Flame,
  Layers,
  MapPin
} from "lucide-react";

interface AuthorityDashboardProps {
  issues: Issue[];
  onSelectIssue: (id: string) => void;
  onUpdateStatus: (id: string, status: ComplaintStatus, dept?: DepartmentType) => void;
  id?: string;
}

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({
  issues,
  onSelectIssue,
  onUpdateStatus,
  id
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"priority" | "date" | "reports">("priority");

  // Statistics
  const totalComplaints = issues.length;
  const pendingCount = issues.filter(
    (i) => i.status === "REPORTED" || i.status === "VERIFIED"
  ).length;
  const criticalCount = issues.filter((i) => i.priority_level === "CRITICAL").length;
  const inProgressCount = issues.filter((i) => i.status === "IN_PROGRESS").length;
  const resolvedCount = issues.filter(
    (i) => i.status === "RESOLVED" || i.status === "CITIZEN_VERIFIED"
  ).length;
  const verificationFailedCount = issues.filter(
    (i) => i.status === "VERIFICATION_FAILED"
  ).length;

  // Filter & Sort
  const filtered = issues.filter((issue) => {
    if (categoryFilter !== "ALL" && issue.category !== categoryFilter) return false;
    if (priorityFilter !== "ALL" && issue.priority_level !== priorityFilter) return false;
    if (statusFilter !== "ALL" && issue.status !== statusFilter) return false;
    if (departmentFilter !== "ALL" && issue.department !== departmentFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = issue.id.toLowerCase().includes(q);
      const matchTitle = issue.title.toLowerCase().includes(q);
      const matchDesc = issue.description.toLowerCase().includes(q);
      const matchAddr = issue.address.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchDesc && !matchAddr) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (sortBy === "priority") {
      return b.priority_score - a.priority_score;
    }
    if (sortBy === "reports") {
      return b.related_reports_count - a.related_reports_count;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div id={id} className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-display">Municipal Authority Workbench</h1>
              <p className="text-xs text-slate-500">
                Logged in as <strong className="text-slate-800">R. K. Verma</strong> (Ward Works Officer) &bull; Priority Queue &amp; Field Dispatch
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Ranked by:</span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full">
              Explainable Priority Index (0–100)
            </span>
          </div>
        </div>

        {/* Top 6 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 block">
              Total
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalComplaints}</div>
            <span className="text-[11px] text-slate-400">All registered</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 block">
              Pending
            </span>
            <div className="text-2xl font-bold text-slate-700 mt-1">{pendingCount}</div>
            <span className="text-[11px] text-slate-400">Needs triage</span>
          </div>

          <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 shadow-2xs">
            <span className="text-xs font-semibold text-rose-700 block flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-600" /> Critical
            </span>
            <div className="text-2xl font-bold text-rose-700 mt-1">{criticalCount}</div>
            <span className="text-[11px] text-rose-600 font-medium">Score 80–100</span>
          </div>

          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-2xs">
            <span className="text-xs font-semibold text-amber-700 block">
              In Progress
            </span>
            <div className="text-2xl font-bold text-amber-700 mt-1">{inProgressCount}</div>
            <span className="text-[11px] text-amber-600">Crews deployed</span>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-2xs">
            <span className="text-xs font-semibold text-emerald-700 block">
              Resolved
            </span>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{resolvedCount}</div>
            <span className="text-[11px] text-emerald-600">Repairs posted</span>
          </div>

          <div className="bg-red-50/70 p-4 rounded-2xl border border-red-200 shadow-2xs">
            <span className="text-xs font-semibold text-red-700 block flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-red-600" /> Failed Verify
            </span>
            <div className="text-2xl font-bold text-red-700 mt-1">
              {verificationFailedCount}
            </div>
            <span className="text-[11px] text-red-600">Citizen rejected</span>
          </div>
        </div>

        {/* Priority Queue Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <span>Municipal Priority Queue</span>
                <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  {filtered.length} Work Orders
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Weighted index: Severity (40%), Reports (25%), Affected Impact (15%), Main Corridor (10%), Age (10%)
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Sort By:</span>
              <button
                onClick={() => setSortBy("priority")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  sortBy === "priority"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Priority
              </button>
              <button
                onClick={() => setSortBy("reports")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  sortBy === "reports"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Reports
              </button>
              <button
                onClick={() => setSortBy("date")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  sortBy === "date"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Newest
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-2 text-xs">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search complaint ID, description, or road..."
                className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 shadow-2xs"
              />
            </div>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs py-2 px-3 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:border-blue-500 focus:outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {ALL_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs py-2 px-3 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:border-blue-500 focus:outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs py-2 px-3 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:border-blue-500 focus:outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical (80–100)</option>
              <option value="HIGH">High (60–79)</option>
              <option value="MEDIUM">Medium (40–59)</option>
              <option value="LOW">Low (0–39)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-2 px-3 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:border-blue-500 focus:outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Queue Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Priority Score</th>
                  <th className="px-5 py-3.5">Complaint ID &amp; Category</th>
                  <th className="px-5 py-3.5">Location &amp; Ward</th>
                  <th className="px-5 py-3.5">Assigned Department</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Citizen Reports</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map((issue) => (
                  <tr
                    key={issue.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => onSelectIssue(issue.id)}
                  >
                    {/* Priority Score Pillar */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-9 h-9 rounded-lg font-mono font-bold text-sm flex items-center justify-center border shadow-2xs ${
                            issue.priority_level === "CRITICAL"
                              ? "bg-rose-100 text-rose-700 border-rose-200"
                              : issue.priority_level === "HIGH"
                              ? "bg-orange-100 text-orange-700 border-orange-200"
                              : issue.priority_level === "MEDIUM"
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {issue.priority_score}
                        </span>
                        <div>
                          <span className="font-bold text-xs block text-slate-900">
                            {issue.priority_level}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Impact: ~{issue.estimated_affected_people || 100}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Complaint ID & Title */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={issue.image_path}
                          alt=""
                          className="w-11 h-11 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0 shadow-2xs"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="font-mono text-[11px] font-bold text-blue-600 block">
                            {issue.id}
                          </span>
                          <span className="font-semibold text-slate-900 line-clamp-1 max-w-xs text-xs">
                            {issue.category} &bull; {issue.title}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4 text-slate-500 max-w-xs truncate">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{issue.address}</span>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium whitespace-nowrap">
                        {issue.department}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={issue.status} size="sm" />
                    </td>

                    {/* Reports count */}
                    <td className="px-5 py-4 font-bold text-slate-700 text-xs">
                      {issue.related_reports_count} {issue.related_reports_count === 1 ? "citizen" : "citizens"}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectIssue(issue.id)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="p-12 text-center text-slate-400 text-xs">
                No civic complaints match the selected filter criteria.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

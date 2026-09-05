import React, { useState } from "react";
import { Issue, DepartmentType, ComplaintStatus, PriorityLevel } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { PriorityQueueView } from "../components/PriorityQueueView";
import { CivicAnalytics } from "../components/CivicAnalytics";
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
  MapPin,
  BarChart3,
  ListOrdered,
  Building2
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
  const [activeTab, setActiveTab] = useState<"complaints" | "queue" | "analytics">("complaints");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"priority" | "date" | "reports">("priority");

  // Statistics
  const safeIssues = Array.isArray(issues) ? issues : [];
  const totalComplaints = safeIssues.length;
  const criticalCount = safeIssues.filter((i) => i && i.priority_level === "CRITICAL").length;
  const pendingCount = safeIssues.filter(
    (i) => i && (i.status === "REPORTED" || i.status === "VERIFIED" || i.status === "ASSIGNED")
  ).length;
  const inProgressCount = safeIssues.filter((i) => i && i.status === "IN_PROGRESS").length;
  const resolvedCount = safeIssues.filter(
    (i) => i && (i.status === "RESOLVED" || i.status === "CITIZEN_VERIFIED")
  ).length;
  const verificationFailedCount = safeIssues.filter(
    (i) => i && i.status === "VERIFICATION_FAILED"
  ).length;

  // Filter & Sort
  const filtered = safeIssues.filter((issue) => {
    if (!issue) return false;
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
    <div id={id || "authority-dashboard"} className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header (Section 19: Authority Control Center) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Municipal Operations Portal
              </span>
              <h1 className="text-2xl font-bold text-slate-900 font-display mt-0.5">
                Authority Control Center
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Ward 112 Command Desk &bull; Real-time issue triage, crew dispatch, and verification lifecycle.
              </p>
            </div>
          </div>

          {/* Sub-view switcher tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/70 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("complaints")}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "complaints"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Complaints</span>
            </button>
            <button
              onClick={() => setActiveTab("queue")}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "queue"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>Priority Queue</span>
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "analytics"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Analytics</span>
            </button>
          </div>
        </div>

        {/* SECTION 19: SIX KEY METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Issues
            </span>
            <div className="text-2xl font-bold text-slate-900 font-mono mt-1">{totalComplaints}</div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">All Ward reports</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block">
              Critical
            </span>
            <div className="text-2xl font-bold text-rose-600 font-mono mt-1">{criticalCount}</div>
            <span className="text-[11px] text-rose-500 mt-0.5 block">Immediate hazard</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Pending
            </span>
            <div className="text-2xl font-bold text-slate-700 font-mono mt-1">{pendingCount}</div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Awaiting action</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">
              In Progress
            </span>
            <div className="text-2xl font-bold text-amber-600 font-mono mt-1">{inProgressCount}</div>
            <span className="text-[11px] text-amber-500 mt-0.5 block">Crews on site</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
              Resolved
            </span>
            <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">{resolvedCount}</div>
            <span className="text-[11px] text-emerald-500 mt-0.5 block">Repairs completed</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block">
              Reopened
            </span>
            <div className="text-2xl font-bold text-rose-700 font-mono mt-1">{verificationFailedCount}</div>
            <span className="text-[11px] text-rose-400 mt-0.5 block">Verification rejected</span>
          </div>
        </div>

        {/* TAB 1: COMPLAINTS TABLE */}
        {activeTab === "complaints" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
            {/* Filter Bar */}
            <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 font-display">
                  Active Work Orders
                </h2>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {filtered.length} showing
                </span>
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Search */}
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter by ID, street, title..."
                    className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden shadow-2xs"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs py-1.5 px-3 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:border-blue-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  {ALL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {/* Department Filter */}
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="text-xs py-1.5 px-3 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:border-blue-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">All Departments</option>
                  {ALL_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs py-1.5 px-3 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:border-blue-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st.replace("_", " ")}
                    </option>
                  ))}
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs py-1.5 px-3 border border-slate-200 rounded-xl bg-white text-slate-800 font-bold focus:border-blue-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="priority">Sort: Priority Score</option>
                  <option value="reports">Sort: Related Reports</option>
                  <option value="date">Sort: Date Logged</option>
                </select>
              </div>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-100">
                <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">ID / Category</th>
                    <th className="px-6 py-3.5">Location</th>
                    <th className="px-6 py-3.5">Priority Index</th>
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Quick Action</th>
                    <th className="px-6 py-3.5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filtered.map((issue) => (
                    <tr
                      key={issue.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => onSelectIssue(issue.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={issue.image_path}
                            alt=""
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-mono text-[11px] font-bold text-blue-600 block">
                              {issue.id}
                            </span>
                            <span className="font-semibold text-slate-900 text-xs line-clamp-1 max-w-xs">
                              {issue.title}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {issue.category} &bull; {issue.related_reports_count} reports
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 max-w-xs truncate text-slate-600">
                        {issue.address}
                      </td>

                      <td className="px-6 py-4">
                        <PriorityBadge
                          score={issue.priority_score}
                          level={issue.priority_level}
                          size="sm"
                        />
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {issue.department}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={issue.status} size="sm" />
                      </td>

                      {/* Quick Action Selector (stops propagation to row click) */}
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={issue.status}
                          onChange={(e) =>
                            onUpdateStatus(issue.id, e.target.value as ComplaintStatus, issue.department)
                          }
                          className="text-xs py-1 px-2.5 border border-slate-200 rounded-lg bg-white font-medium text-slate-800 hover:border-blue-500 focus:outline-hidden"
                        >
                          <option value="REPORTED">Reported</option>
                          <option value="ASSIGNED">Assigned</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CITIZEN_VERIFIED">Citizen Verified</option>
                          <option value="VERIFICATION_FAILED">Reopen</option>
                        </select>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onSelectIssue(issue.id)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No complaints found matching this filter set.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DEDICATED PRIORITY QUEUE (SECTION 20) */}
        {activeTab === "queue" && (
          <PriorityQueueView
            issues={issues}
            onSelectIssue={onSelectIssue}
          />
        )}

        {/* TAB 3: CIVIC ANALYTICS (SECTION 21) */}
        {activeTab === "analytics" && (
          <CivicAnalytics issues={issues} />
        )}
      </div>
    </div>
  );
};

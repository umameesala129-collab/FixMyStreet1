import React, { useState } from "react";
import { Issue, ComplaintStatus } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import {
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Calendar,
  Layers
} from "lucide-react";

interface CitizenDashboardProps {
  issues: Issue[];
  onSelectIssue: (id: string) => void;
  onOpenReport: () => void;
  onOpenVerificationModal: (issue: Issue) => void;
  id?: string;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  issues,
  onSelectIssue,
  onOpenReport,
  onOpenVerificationModal,
  id
}) => {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const citizenIssues = issues;
  const pendingCount = citizenIssues.filter((i) => i.status === "REPORTED" || i.status === "VERIFIED" || i.status === "ASSIGNED").length;
  const inProgressCount = citizenIssues.filter((i) => i.status === "IN_PROGRESS").length;
  const resolvedCount = citizenIssues.filter((i) => i.status === "RESOLVED" || i.status === "CITIZEN_VERIFIED").length;

  const awaitingVerification = citizenIssues.filter(
    (i) => i.status === "RESOLVED" && (!i.resolution || !i.resolution.citizen_verified)
  );

  const filtered = citizenIssues.filter((issue) => {
    if (filterStatus !== "ALL" && issue.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = issue.id.toLowerCase().includes(q);
      const matchCat = issue.category.toLowerCase().includes(q);
      const matchTitle = issue.title.toLowerCase().includes(q);
      const matchAddr = issue.address.toLowerCase().includes(q);
      if (!matchId && !matchCat && !matchTitle && !matchAddr) return false;
    }
    return true;
  });

  return (
    <div id={id} className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">Citizen Activity Portal</h1>
            <p className="text-xs text-slate-500 mt-1">
              Logged in as <strong className="text-slate-800">Ananya Sharma</strong> (Ward 112, Indiranagar) &bull; Track status and verify repairs
            </p>
          </div>
          <button
            id="citizen-new-report-btn"
            onClick={onOpenReport}
            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Report New Issue</span>
          </button>
        </div>

        {/* Verification Alert Callout */}
        {awaitingVerification.length > 0 && (
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-950">
                  {awaitingVerification.length} Complaint(s) Marked Complete by Field Crews
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Authority uploaded after-repair evidence for <strong>{awaitingVerification[0].id}</strong> ({awaitingVerification[0].category}). Please inspect before the work order closes.
                </p>
              </div>
            </div>
            <button
              id="verify-pending-banner-btn"
              onClick={() => onOpenVerificationModal(awaitingVerification[0])}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs shrink-0 transition-colors cursor-pointer"
            >
              Verify Resolution Now
            </button>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
              <span>Total Reports</span>
              <Layers className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{citizenIssues.length}</div>
            <span className="text-xs text-slate-400 mt-0.5 block">Logged in system</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
              <span>Pending Review</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-700">{pendingCount}</div>
            <span className="text-xs text-slate-400 mt-0.5 block">Awaiting triage</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
              <span>In Progress</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-600">{inProgressCount}</div>
            <span className="text-xs text-slate-400 mt-0.5 block">Crews dispatched</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
              <span>Resolved / Verified</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">{resolvedCount}</div>
            <span className="text-xs text-slate-400 mt-0.5 block">Completed work</span>
          </div>
        </div>

        {/* Complaints Table & Filter Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, title, or road..."
                className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs py-2 px-3 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:border-blue-500 focus:outline-hidden shadow-2xs cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="REPORTED">Reported</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CITIZEN_VERIFIED">Citizen Verified</option>
                <option value="VERIFICATION_FAILED">Verification Failed</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">ID &amp; Issue</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Reported</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map((issue) => {
                  const needsVerification =
                    issue.status === "RESOLVED" && (!issue.resolution || !issue.resolution.citizen_verified);

                  return (
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
                            className="w-11 h-11 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0 shadow-2xs"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-mono text-[11px] font-bold text-blue-600 block">
                              {issue.id}
                            </span>
                            <span className="font-semibold text-slate-900 line-clamp-1 max-w-xs text-xs">
                              {issue.title}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-800">
                        {issue.category}
                      </td>

                      <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                        {issue.address}
                      </td>

                      <td className="px-6 py-4">
                        <PriorityBadge
                          score={issue.priority_score}
                          level={issue.priority_level}
                          size="sm"
                        />
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={issue.status} size="sm" />
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {new Date(issue.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {needsVerification ? (
                          <button
                            onClick={() => onOpenVerificationModal(issue)}
                            className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verify Fix</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onSelectIssue(issue.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="p-12 text-center text-slate-400 text-xs">
                No civic complaints match the selected filter or search query.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

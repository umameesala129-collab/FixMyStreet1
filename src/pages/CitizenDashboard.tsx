import React, { useState } from "react";
import { Issue, User } from "../types";
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
  Layers,
  Heart,
  Users,
  Compass,
  ArrowRight
} from "lucide-react";

interface CitizenDashboardProps {
  issues: Issue[];
  currentUser: User;
  onSelectIssue: (id: string) => void;
  onOpenReport: () => void;
  onOpenVerificationModal: (issue: Issue) => void;
  onOpenNearby?: () => void;
  id?: string;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  issues,
  currentUser,
  onSelectIssue,
  onOpenReport,
  onOpenVerificationModal,
  onOpenNearby,
  id
}) => {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const citizenIssues = Array.isArray(issues) ? issues : [];
  const pendingCount = citizenIssues.filter(
    (i) => i && (i.status === "REPORTED" || i.status === "VERIFIED" || i.status === "ASSIGNED")
  ).length;
  const inProgressCount = citizenIssues.filter((i) => i && i.status === "IN_PROGRESS").length;
  const resolvedCount = citizenIssues.filter(
    (i) => i && (i.status === "RESOLVED" || i.status === "CITIZEN_VERIFIED")
  ).length;

  const awaitingVerification = citizenIssues.filter(
    (i) => i && i.status === "RESOLVED" && (!i.resolution || !i.resolution.citizen_verified)
  );

  const filtered = citizenIssues.filter((issue) => {
    if (!issue) return false;
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
    <div id={id || "citizen-dashboard"} className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* SECTION 10: WELCOMING HEADER */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              {currentUser.ward || "Ward 112, Indiranagar"}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 font-display mt-0.5">
              Good day, {currentUser.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Help improve your neighborhood &bull; Track repair progress and verify municipal field resolutions.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {onOpenNearby && (
              <button
                onClick={onOpenNearby}
                className="flex-1 md:flex-none px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-slate-500" />
                <span>Nearby Issues</span>
              </button>
            )}

            <button
              id="citizen-new-report-btn"
              onClick={onOpenReport}
              className="flex-1 md:flex-none px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Report an Issue</span>
            </button>
          </div>
        </div>

        {/* VERIFICATION NEEDED BANNER */}
        {awaitingVerification.length > 0 && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Verification Needed
                </span>
                <h3 className="text-sm font-bold text-emerald-950 mt-1">
                  Please check if the issue was fixed for {awaitingVerification[0].id} ({awaitingVerification[0].category})
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Municipal crews uploaded repair evidence for {awaitingVerification[0].address}. Your inspection closes the ticket.
                </p>
              </div>
            </div>

            <button
              id="verify-pending-banner-btn"
              onClick={() => onOpenVerificationModal(awaitingVerification[0])}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs shrink-0 transition-colors cursor-pointer"
            >
              Verify Fix Now
            </button>
          </div>
        )}

        {/* SECTION 10: YOUR ACTIVITY (4 KPI CARDS) */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Your Activity
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
                <span>Reports</span>
                <Layers className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{citizenIssues.length}</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Logged in system</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
                <span>Pending Review</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-700">{pendingCount}</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Awaiting triage</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
                <span>In Progress</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-amber-600">{inProgressCount}</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Crews dispatched</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
                <span>Resolved</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-600">{resolvedCount}</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Completed works</span>
            </div>
          </div>
        </div>

        {/* SECTION 10: YOUR IMPACT CALLOUT */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6 fill-rose-500/20" />
            </div>
            <div>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Your Civic Impact
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                You've helped fix {resolvedCount} issues in your ward.
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Over 420 neighborhood residents benefited from your verified reports this month.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-around">
            <div>
              <span className="text-lg font-bold text-slate-900 font-mono">14</span>
              <span className="text-[10px] text-slate-400 block">Community Upvotes</span>
            </div>
            <div>
              <span className="text-lg font-bold text-emerald-600 font-mono">96%</span>
              <span className="text-[10px] text-slate-400 block">Verification Accuracy</span>
            </div>
          </div>
        </div>

        {/* SECTION 10: RECENT REPORTS TABLE */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Recent Reports
              </h2>
              <p className="text-xs text-slate-500">
                Civic complaints submitted across your residential sector
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search complaints..."
                  className="text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs py-1.5 px-3 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:border-blue-500 focus:outline-hidden cursor-pointer"
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
                  <th className="px-6 py-3.5">Complaint</th>
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
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0 shadow-2xs"
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
                            className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verify Fix</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onSelectIssue(issue.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>View Details</span>
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

import React, { useState } from "react";
import { Issue, ComplaintStatus, DepartmentType, User } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { Timeline } from "../components/Timeline";
import { ALL_DEPARTMENTS } from "../utils/categoryUtils";
import {
  recordResolution,
  recordCitizenVerification,
  updateIssueStatus
} from "../services/storage";
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  Shield,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  User as UserIcon,
  Flame,
  Layers,
  Camera,
  FileText,
  AlertTriangle,
  ExternalLink
} from "lucide-react";

interface IssueDetailPageProps {
  issue: Issue;
  currentUser: User;
  onBack: () => void;
  onIssueUpdated: (updatedIssue: Issue) => void;
  id?: string;
}

export const IssueDetailPage: React.FC<IssueDetailPageProps> = ({
  issue,
  currentUser,
  onBack,
  onIssueUpdated,
  id
}) => {
  // Authority resolution form state
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [resolutionPhoto, setResolutionPhoto] = useState<string>(
    "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80"
  );
  const [resolutionNotes, setResolutionNotes] = useState<string>(
    "Field repair crew deployed. Bitumen compaction and asphalt hot-mix patching completed to grade. Area cleared for vehicular traffic."
  );
  const [resolvedBy, setResolvedBy] = useState<string>(currentUser.name);

  // Authority Department re-assignment state
  const [assignedDept, setAssignedDept] = useState<DepartmentType>(issue.department);

  // Citizen verification rejection comment
  const [rejectionComment, setRejectionComment] = useState("");

  const handleStatusChange = (newStatus: ComplaintStatus) => {
    const updated = updateIssueStatus(issue.id, newStatus, assignedDept);
    if (updated) {
      onIssueUpdated(updated);
    }
  };

  const handleDeptChange = (newDept: DepartmentType) => {
    setAssignedDept(newDept);
    const updated = updateIssueStatus(issue.id, issue.status, newDept);
    if (updated) {
      onIssueUpdated(updated);
    }
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionPhoto) {
      alert("Please provide an after-resolution photo URL or upload.");
      return;
    }
    const updated = recordResolution(issue.id, {
      after_image: resolutionPhoto,
      resolution_notes: resolutionNotes,
      resolved_by: resolvedBy || "Municipal Engineer",
      resolved_at: new Date().toISOString()
    });
    if (updated) {
      onIssueUpdated(updated);
      setShowResolutionForm(false);
    }
  };

  const handleCitizenVerification = (isFixed: boolean) => {
    const updated = recordCitizenVerification(
      issue.id,
      isFixed,
      isFixed ? "Verified fixed by citizen." : rejectionComment || "Citizen reported problem still exists."
    );
    if (updated) {
      onIssueUpdated(updated);
    }
  };

  return (
    <div id={id} className="min-h-screen bg-[#080808] text-[#d4d4d8] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top bar with back button & ID */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#a1a1aa] hover:text-white bg-[#141416] border border-[#27272a] px-3.5 py-1.5 rounded-sm shadow-xs transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#c5a059] bg-[#141416] px-3 py-1 rounded-sm border border-[#27272a] shadow-xs">
              {issue.id}
            </span>
            <StatusBadge status={issue.status} size="md" />
          </div>
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Visual evidence & Resolution before/after */}
          <div className="lg:col-span-1 space-y-4">
            {/* Primary Evidence Photo */}
            <div className="bg-[#0c0c0c] rounded-lg border border-[#1a1a1a] overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 bg-[#141416] text-[#71717a] border-b border-[#27272a] flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-widest text-white text-[10px]">Reported Evidence</span>
                <span className="text-[10px] text-[#71717a] font-mono">
                  {new Date(issue.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="aspect-video sm:aspect-square w-full bg-black overflow-hidden relative">
                <img
                  src={issue.image_path}
                  alt={issue.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* If Resolved or Verification Failed: Display After-Resolution Photo */}
            {issue.resolution && (
              <div className="bg-[#0c0c0c] rounded-lg border border-[#10b981]/30 overflow-hidden shadow-sm">
                <div className="px-4 py-2.5 bg-[#0e2418] text-[#34d399] border-b border-[#10b981]/30 flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-widest text-[10px]">Repair Evidence (After)</span>
                  <span className="text-[10px] text-[#34d399] font-mono">
                    {new Date(issue.resolution.resolved_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="aspect-video sm:aspect-square w-full bg-black overflow-hidden relative">
                  <img
                    src={issue.resolution.after_image}
                    alt="After resolution"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-3 text-xs bg-[#141416] text-[#d4d4d8] border-t border-[#27272a]">
                  <div className="font-semibold text-white uppercase tracking-wider text-[10px]">Field Notes:</div>
                  <p className="mt-1 text-[#a1a1aa] font-mono text-[11px] bg-[#0c0c0c] p-2.5 rounded-sm border border-[#1a1a1a]">
                    {issue.resolution.resolution_notes}
                  </p>
                  <div className="mt-2 text-[10px] text-[#71717a] font-mono">
                    Crew Lead: {issue.resolution.resolved_by}
                  </div>
                </div>
              </div>
            )}

            {/* AI Vision Metadata Card */}
            <div className="bg-[#0c0c0c] rounded-lg border border-[#1a1a1a] p-4 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>AI Vision Analysis</span>
              </div>
              <div className="bg-[#141416] p-3 rounded-sm border border-[#27272a] space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#71717a]">Detected:</span>
                  <strong className="text-[#c5a059] font-semibold">{issue.ai_category || issue.category}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71717a]">Confidence:</span>
                  <strong className="text-[#34d399] font-mono">
                    {Math.round((issue.ai_confidence || 0.91) * 100)}%
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71717a]">Suggested Severity:</span>
                  <strong className="text-white">{issue.severity}</strong>
                </div>
                {issue.ai_reasoning && (
                  <p className="text-[10px] text-[#71717a] italic pt-1.5 border-t border-[#27272a] mt-1">
                    "{issue.ai_reasoning}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Center & Right Column: Details, Timeline, Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Priority Header Card */}
            <div className="bg-[#0c0c0c] rounded-lg border border-[#1a1a1a] p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#c5a059] uppercase tracking-widest">
                    {issue.category}
                  </span>
                  <h1 className="text-lg sm:text-xl font-light tracking-[0.05em] text-white mt-1">{issue.title}</h1>
                  <div className="flex items-center gap-1.5 text-xs text-[#71717a] mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                    <span>{issue.address}</span>
                  </div>
                </div>

                <div className="text-right">
                  <PriorityBadge
                    score={issue.priority_score}
                    level={issue.priority_level}
                    size="lg"
                  />
                  <span className="text-[10px] text-[#71717a] font-mono block mt-1">
                    {issue.related_reports_count} citizen report(s)
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="pt-3 border-t border-[#1a1a1a] text-xs leading-relaxed">
                <h4 className="font-bold text-white uppercase tracking-wider text-[10px] mb-1.5">Citizen Problem Statement:</h4>
                <p className="bg-[#141416] p-3.5 rounded-sm border border-[#27272a] text-[#d4d4d8]">{issue.description}</p>
              </div>

              {/* Status Timeline */}
              <div className="pt-2 border-t border-[#1a1a1a]">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#71717a] mb-2">
                  Complaint Resolution Lifecycle
                </h4>
                <Timeline
                  status={issue.status}
                  department={issue.department}
                  createdAt={issue.created_at}
                  updatedAt={issue.updated_at}
                />
              </div>
            </div>

            {/* Smart Priority Score Breakdown */}
            <div className="bg-[#0c0c0c] rounded-lg border border-[#1a1a1a] p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-[#f87171]" />
                  <span>Smart Priority Score Calculation Breakdown</span>
                </h3>
                <span className="font-mono text-xs font-bold text-[#c5a059] bg-[#211a0c] border border-[#c5a059]/40 px-2 py-0.5 rounded-sm">
                  Score: {issue.priority_score} / 100
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#141416] p-3.5 rounded-sm border border-[#27272a]">
                  <div className="flex justify-between text-[#a1a1aa]">
                    <span>Severity Weight (40%):</span>
                    <strong className="text-white font-mono">{issue.priority_breakdown?.severityScore ?? 30} pts</strong>
                  </div>
                  <div className="flex justify-between text-[#a1a1aa] mt-1.5">
                    <span>Citizen Reports (25%):</span>
                    <strong className="text-white font-mono">{issue.priority_breakdown?.reportsScore ?? 20} pts</strong>
                  </div>
                  <div className="flex justify-between text-[#a1a1aa] mt-1.5">
                    <span>People Affected (15%):</span>
                    <strong className="text-white font-mono">{issue.priority_breakdown?.affectedScore ?? 15} pts</strong>
                  </div>
                </div>

                <div className="bg-[#141416] p-3.5 rounded-sm border border-[#27272a]">
                  <div className="flex justify-between text-[#a1a1aa]">
                    <span>Location Zone (10%):</span>
                    <strong className="text-white font-mono">{issue.priority_breakdown?.locationScore ?? 10} pts</strong>
                  </div>
                  <div className="flex justify-between text-[#a1a1aa] mt-1.5">
                    <span>Issue Age Factor (10%):</span>
                    <strong className="text-white font-mono">{issue.priority_breakdown?.ageScore ?? 8} pts</strong>
                  </div>
                  <div className="flex justify-between text-[#a1a1aa] mt-1.5">
                    <span>Arterial Corridor:</span>
                    <strong className="text-white font-mono">{issue.is_main_road ? "Yes (+5)" : "No"}</strong>
                  </div>
                </div>
              </div>

              {issue.priority_breakdown?.factors && (
                <div className="text-[10px] text-[#71717a] pt-2 border-t border-[#1a1a1a] space-y-0.5">
                  <span className="font-semibold text-[#a1a1aa] uppercase tracking-wider">Audit Factors:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[#71717a]">
                    {issue.priority_breakdown.factors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* CITIZEN VERIFICATION PROMPT */}
            {issue.status === "RESOLVED" && (!issue.resolution?.citizen_verified) && (
              <div className="bg-[#0e2418] border-2 border-[#10b981]/50 rounded-lg p-6 shadow-xl space-y-4 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-sm bg-[#10b981]/20 border border-[#10b981]/40 text-[#34d399] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      The Municipal Authority has marked this issue as Resolved.
                    </h3>
                    <p className="text-xs text-[#a7f3d0] mt-1">
                      Compare the before and after repair photos above. Was this issue actually resolved at the physical location?
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="detail-verify-comment" className="block text-[11px] font-semibold uppercase tracking-wider text-white">
                    Citizen Inspection Note:
                  </label>
                  <input
                    id="detail-verify-comment"
                    type="text"
                    value={rejectionComment}
                    onChange={(e) => setRejectionComment(e.target.value)}
                    placeholder="e.g., Road surface smoothly leveled, or debris still left on sidewalk..."
                    className="w-full text-xs p-2.5 border border-[#10b981]/40 rounded-sm bg-[#141416] text-white placeholder-[#52525b] focus:border-[#34d399] focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                  <button
                    id="detail-verify-no-btn"
                    onClick={() => handleCitizenVerification(false)}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#fb7185] bg-[#241118] hover:bg-[#331822] border border-[#f43f5e]/40 rounded-sm flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5 text-[#fb7185]" />
                    <span>NO, STILL EXISTS</span>
                  </button>
                  <button
                    id="detail-verify-yes-btn"
                    onClick={() => handleCitizenVerification(true)}
                    className="w-full sm:w-auto px-5 py-2 text-xs font-bold uppercase tracking-wider text-black bg-[#c5a059] hover:bg-[#d4b068] rounded-sm shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                    <span>YES, IT IS FIXED</span>
                  </button>
                </div>
              </div>
            )}

            {/* CITIZEN VERIFIED SUCCESS BADGE */}
            {issue.status === "CITIZEN_VERIFIED" && (
              <div className="bg-[#0e2418] border border-[#10b981]/40 rounded-lg p-4 text-xs text-[#d4d4d8] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#34d399] shrink-0" />
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wider text-white block">Citizen Verified &amp; Closed</span>
                    <span className="text-[#a7f3d0] text-[11px] mt-0.5 block">
                      Inspection feedback: "{issue.resolution?.verification_comment || "Confirmed fixed"}" on{" "}
                      {issue.resolution?.verified_at ? new Date(issue.resolution.verified_at).toLocaleDateString() : "recently"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* AUTHORITY WORK ORDER CONTROLS */}
            <div className="bg-[#0c0c0c] rounded-lg border border-[#1a1a1a] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Authority Action Controls</span>
                </h3>
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Department Workflow Actions</span>
              </div>

              {/* Department Assignment Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label htmlFor="dept-assignment-select" className="block text-[#a1a1aa] font-semibold text-[11px] uppercase tracking-wider mb-1">
                    Assign Department:
                  </label>
                  <select
                    id="dept-assignment-select"
                    value={assignedDept}
                    onChange={(e) => handleDeptChange(e.target.value as DepartmentType)}
                    className="w-full text-xs p-2 border border-[#27272a] rounded-sm bg-[#141416] text-white font-medium focus:border-[#c5a059] focus:outline-hidden"
                  >
                    {ALL_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Status Progression Buttons */}
                <div>
                  <label className="block text-[#a1a1aa] font-semibold text-[11px] uppercase tracking-wider mb-1">Advance Status:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {issue.status === "REPORTED" && (
                      <button
                        id="mark-verified-btn"
                        onClick={() => handleStatusChange("VERIFIED")}
                        className="px-3 py-1.5 bg-[#141416] border border-[#38bdf8]/40 text-[#38bdf8] hover:bg-[#38bdf8]/10 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-colors"
                      >
                        Verify Complaint
                      </button>
                    )}
                    {(issue.status === "REPORTED" || issue.status === "VERIFIED") && (
                      <button
                        id="mark-assigned-btn"
                        onClick={() => handleStatusChange("ASSIGNED")}
                        className="px-3 py-1.5 bg-[#141416] border border-[#818cf8]/40 text-[#818cf8] hover:bg-[#818cf8]/10 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-colors"
                      >
                        Assign to {assignedDept.split(" ")[0]}
                      </button>
                    )}
                    {(issue.status === "ASSIGNED" || issue.status === "VERIFICATION_FAILED") && (
                      <button
                        id="mark-inprogress-btn"
                        onClick={() => handleStatusChange("IN_PROGRESS")}
                        className="px-3 py-1.5 bg-[#141416] border border-[#f59e0b]/40 text-[#fbbf24] hover:bg-[#f59e0b]/10 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-colors"
                      >
                        Mark In Progress
                      </button>
                    )}
                    {(issue.status === "IN_PROGRESS" || issue.status === "ASSIGNED") && (
                      <button
                        id="open-resolve-form-btn"
                        onClick={() => setShowResolutionForm(true)}
                        className="px-3 py-1.5 bg-[#c5a059] text-black hover:bg-[#d4b068] rounded-sm text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                        <span>Upload Resolution Proof</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Resolution Form Modal / Drawer */}
              {showResolutionForm && (
                <form
                  onSubmit={handleResolveSubmit}
                  className="mt-4 p-4 bg-[#141416] border border-[#27272a] rounded-lg space-y-3"
                >
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#c5a059] flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#c5a059]" />
                    <span>Upload After-Resolution Evidence &amp; Mark Resolved</span>
                  </h4>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#a1a1aa] mb-1">
                      After-Resolution Image (Photo Proof URL):
                    </label>
                    <input
                      type="text"
                      value={resolutionPhoto}
                      onChange={(e) => setResolutionPhoto(e.target.value)}
                      placeholder="Image URL or upload"
                      className="w-full text-xs p-2 border border-[#27272a] rounded-sm bg-[#0c0c0c] text-white focus:border-[#c5a059] focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#a1a1aa] mb-1">
                      Resolution Notes / Work Order Summary:
                    </label>
                    <textarea
                      rows={2}
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Specify materials used, crew hours, and road clearance status..."
                      className="w-full text-xs p-2 border border-[#27272a] rounded-sm bg-[#0c0c0c] text-white font-mono focus:border-[#c5a059] focus:outline-hidden"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowResolutionForm(false)}
                      className="px-3 py-1.5 text-xs text-[#71717a] hover:text-white uppercase tracking-wider transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      id="submit-resolve-btn"
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-black bg-[#c5a059] hover:bg-[#d4b068] rounded-sm shadow-xs transition-colors"
                    >
                      Mark Resolved &amp; Send to Citizen
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

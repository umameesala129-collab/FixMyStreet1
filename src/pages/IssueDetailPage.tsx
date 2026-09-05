import React, { useState } from "react";
import { Issue, ComplaintStatus, DepartmentType, User } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { Timeline } from "../components/Timeline";
import { SmartPriorityCard } from "../components/SmartPriorityCard";
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
  Building2,
  Calendar,
  Eye,
  Check
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
    "Field repair crew deployed. Bitumen compaction and asphalt hot-mix patching completed to grade. Road surface leveled and cleared for vehicular traffic."
  );
  const [resolvedBy, setResolvedBy] = useState<string>(currentUser.name);

  // Authority Department re-assignment state
  const [assignedDept, setAssignedDept] = useState<DepartmentType>(issue.department);

  // Citizen verification rejection comment
  const [rejectionComment, setRejectionComment] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const isCitizen = currentUser.role === "citizen";
  const isAuthority = currentUser.role === "authority";

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
      alert("Please provide an after-resolution photo URL.");
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
      setShowRejectForm(false);
    }
  };

  return (
    <div id={id || "issue-detail-page"} className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top bar with back button & ID */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200/80">
              {issue.id}
            </span>
            <StatusBadge status={issue.status} size="md" />
            <PriorityBadge score={issue.priority_score} level={issue.priority_level} size="md" />
          </div>
        </div>

        {/* SECTION 16: COMPLAINT TIMELINE */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 font-display">
                Complaint Life Cycle Timeline
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Reported on {new Date(issue.created_at).toLocaleDateString()}
            </span>
          </div>

          <Timeline
            status={issue.status}
            department={issue.department}
            createdAt={issue.created_at}
            updatedAt={issue.updated_at}
          />
        </div>

        {/* SECTION 17: BEFORE / AFTER RESOLUTION COMPARISON */}
        {issue.resolution && (
          <div className="bg-white rounded-2xl border border-emerald-200 shadow-xs overflow-hidden">
            <div className="bg-emerald-50/80 px-6 py-3 border-b border-emerald-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-emerald-950 font-display">
                  Field Resolution Evidence
                </h3>
              </div>
              <span className="text-xs font-medium text-emerald-800">
                Resolved by {issue.resolution.resolved_by} &bull; {new Date(issue.resolution.resolved_at).toLocaleDateString()}
              </span>
            </div>

            <div className="p-6 space-y-6">
              {/* Before and After Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* BEFORE */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      BEFORE (Citizen Evidence)
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="aspect-video w-full rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shadow-2xs">
                    <img
                      src={issue.image_path}
                      alt="Before repair"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* AFTER */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      AFTER (Municipal Repair Evidence)
                    </span>
                    <span className="text-[11px] text-emerald-700 font-mono">
                      {new Date(issue.resolution.resolved_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="aspect-video w-full rounded-xl bg-slate-100 border border-emerald-200 overflow-hidden shadow-2xs">
                    <img
                      src={issue.resolution.after_image}
                      alt="After repair"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>

              {/* Work Order Notes */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Crew Completion Notes:
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {issue.resolution.resolution_notes}
                </p>
              </div>

              {/* Citizen Verification Prompt (Only if status is RESOLVED and not yet verified) */}
              {issue.status === "RESOLVED" && (!issue.resolution.citizen_verified) && (
                <div className="bg-blue-50/70 border-2 border-blue-200 rounded-2xl p-6 space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 font-display">
                      Was this issue actually fixed?
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      As a resident or reporting citizen, please verify if the repair has been carried out satisfactorily on site.
                    </p>
                  </div>

                  {!showRejectForm ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => handleCitizenVerification(true)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Yes, It's Fixed (Verify)</span>
                      </button>

                      <button
                        onClick={() => setShowRejectForm(true)}
                        className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>No, It Still Exists (Reopen)</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-rose-200">
                      <label className="block text-xs font-semibold text-rose-900">
                        Please explain why this issue is not fixed:
                      </label>
                      <textarea
                        value={rejectionComment}
                        onChange={(e) => setRejectionComment(e.target.value)}
                        placeholder="e.g. Patching is uneven, pothole crater still deep on right side..."
                        rows={3}
                        className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-hidden"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCitizenVerification(false)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Confirm Reopen Complaint
                        </button>
                        <button
                          onClick={() => setShowRejectForm(false)}
                          className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Verified Confirmation */}
              {issue.status === "CITIZEN_VERIFIED" && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-xs text-emerald-900 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    Citizen Inspection Verified &bull; {issue.resolution.verification_comment || "Work approved by community."}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Issue Core Details & AI Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  {issue.category}
                </span>
                <h1 className="text-xl font-bold text-slate-900 font-display mt-1">
                  {issue.title}
                </h1>
              </div>

              <div className="aspect-video w-full rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shadow-2xs">
                <img
                  src={issue.image_path}
                  alt={issue.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Citizen Description
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {issue.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800 block">Incident Location</span>
                    <span className="text-slate-500">{issue.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <UserIcon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800 block">Filed by</span>
                    <span className="text-slate-500">{issue.created_by.name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 13: IMPROVED AI DETECTION UI */}
            <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-blue-600">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Automated Vision Inspection
                </h3>
              </div>

              <div className="bg-blue-50/60 border border-blue-200/70 rounded-xl p-4 space-y-2">
                <p className="text-sm font-bold text-blue-950">
                  "We think this is a {issue.ai_category || issue.category}."
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400">Confidence: </span>
                    <strong className="text-slate-900">
                      {Math.round((issue.ai_confidence || 0.92) * 100)}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Suggested Severity: </span>
                    <strong className="text-slate-900">{issue.severity}</strong>
                  </div>
                </div>
                {issue.ai_reasoning && (
                  <p className="text-xs text-slate-500 pt-1 border-t border-blue-200/50">
                    Analysis: {issue.ai_reasoning}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Col: Priority, Department, Authority Actions */}
          <div className="space-y-6">
            {/* SECTION 15: SMART PRIORITY EXPLAINABLE CARD */}
            <SmartPriorityCard
              score={issue.priority_score}
              level={issue.priority_level}
              breakdown={issue.priority_breakdown}
            />

            {/* Authority Action Panel (For municipal officers) */}
            {isAuthority && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Municipal Management
                  </h3>
                </div>

                {/* Status selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Work Order Status
                  </label>
                  <select
                    value={issue.status}
                    onChange={(e) => handleStatusChange(e.target.value as ComplaintStatus)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="REPORTED">Reported</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CITIZEN_VERIFIED">Citizen Verified</option>
                    <option value="VERIFICATION_FAILED">Verification Failed</option>
                  </select>
                </div>

                {/* Department Assignment */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Responsible Department
                  </label>
                  <select
                    value={assignedDept}
                    onChange={(e) => handleDeptChange(e.target.value as DepartmentType)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:border-blue-500 focus:outline-hidden"
                  >
                    {ALL_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mark as Resolved CTA */}
                {!showResolutionForm ? (
                  <button
                    onClick={() => setShowResolutionForm(true)}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Upload Resolution Evidence</span>
                  </button>
                ) : (
                  <form onSubmit={handleResolveSubmit} className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Record Completion
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowResolutionForm(false)}
                        className="text-[11px] text-slate-400 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        After Photo URL
                      </label>
                      <input
                        type="url"
                        required
                        value={resolutionPhoto}
                        onChange={(e) => setResolutionPhoto(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Completion Notes
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Save &amp; Notify Citizen
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* General Metadata */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Report Details
              </h4>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Related Reports</span>
                <span className="font-bold text-slate-800">{issue.related_reports_count} citizens</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Main Arterial Road</span>
                <span className="font-bold text-slate-800">{issue.is_main_road ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">School / Hospital Zone</span>
                <span className="font-bold text-slate-800">{issue.is_near_school ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

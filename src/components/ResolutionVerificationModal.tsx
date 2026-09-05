import React, { useState } from "react";
import { Issue } from "../types";
import { CheckCircle2, XCircle, AlertCircle, X, ShieldCheck } from "lucide-react";

interface ResolutionVerificationModalProps {
  isOpen: boolean;
  issue: Issue;
  onClose: () => void;
  onVerify: (isFixed: boolean, comment?: string) => void;
  id?: string;
}

export const ResolutionVerificationModal: React.FC<ResolutionVerificationModalProps> = ({
  isOpen,
  issue,
  onClose,
  onVerify,
  id
}) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !issue.resolution) return null;

  const handleDecision = (isFixed: boolean) => {
    setIsSubmitting(true);
    onVerify(isFixed, comment);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      id={id}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Citizen Resolution Verification</h3>
              <p className="text-xs text-slate-500 font-mono">Complaint {issue.id} &bull; {issue.category}</p>
            </div>
          </div>
          <button
            id="close-verify-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 text-xs">The authority marked this work order completed.</span>
              <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                Inspect the photographic proof submitted by field workers and confirm whether the problem is fixed on site.
              </p>
            </div>
          </div>

          {/* Before vs After Images */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Photographic Proof Comparison
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Before */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-2xs">
                <div className="px-3.5 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Before (Citizen Report)</span>
                  <span className="text-[11px] font-mono text-slate-500">{new Date(issue.created_at).toLocaleDateString()}</span>
                </div>
                <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={issue.image_path}
                    alt="Before repair condition"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* After */}
              <div className="border border-emerald-300 rounded-xl overflow-hidden bg-emerald-50/40 shadow-2xs">
                <div className="px-3.5 py-2 bg-emerald-100/60 border-b border-emerald-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">After (Crew Completion)</span>
                  <span className="text-[11px] font-mono text-emerald-700">
                    {issue.resolution?.resolved_at ? new Date(issue.resolution.resolved_at).toLocaleDateString() : "Recently"}
                  </span>
                </div>
                <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={issue.resolution.after_image}
                    alt="After resolution condition"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Authority Notes */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-800">Field Crew Notes:</span>
              <span className="text-xs">Logged by {issue.resolution.resolved_by || "Municipal Field Officer"}</span>
            </div>
            <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
              {issue.resolution.resolution_notes}
            </p>
          </div>

          {/* Citizen Verification Question */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 text-center mb-1">
              Was this issue successfully repaired?
            </h4>
            <p className="text-xs text-slate-500 text-center mb-4">
              Your confirmation officially closes this public complaint.
            </p>

            <div className="space-y-2">
              <label htmlFor="verify-feedback-comment" className="block text-xs font-semibold text-slate-700">
                Optional Inspection Comment:
              </label>
              <textarea
                id="verify-feedback-comment"
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g., Road surface smoothly tarred; or debris still left on sidewalk..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
          <button
            id="verify-no-btn"
            type="button"
            disabled={isSubmitting}
            onClick={() => handleDecision(false)}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <XCircle className="w-4 h-4 text-red-600" />
            <span>No, Still Exists (Reopen)</span>
          </button>
          <button
            id="verify-yes-btn"
            type="button"
            disabled={isSubmitting}
            onClick={() => handleDecision(true)}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Yes, Verified Fixed</span>
          </button>
        </div>
      </div>
    </div>
  );
};

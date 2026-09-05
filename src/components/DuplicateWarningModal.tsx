import React from "react";
import { DuplicateMatch } from "../types";
import { AlertTriangle, MapPin, ExternalLink, ArrowRight, X } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

interface DuplicateWarningModalProps {
  isOpen: boolean;
  match: DuplicateMatch;
  onClose: () => void;
  onReportAnyway: () => void;
  onViewExisting: (complaintId: string) => void;
  id?: string;
}

export const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({
  isOpen,
  match,
  onClose,
  onReportAnyway,
  onViewExisting,
  id
}) => {
  if (!isOpen || !match) return null;

  const { issue, distance_meters, similarity_score } = match;

  return (
    <div
      id={id}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Nearby Similar Complaint</h3>
              <p className="text-xs text-amber-700 font-medium">
                {similarity_score}% match detected within {distance_meters} meters
              </p>
            </div>
          </div>
          <button
            id="close-dup-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            A neighbor has recently reported a matching issue at this spot. Viewing the existing complaint helps our municipal teams merge citizen reports and boost repair priority.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md text-blue-700">
                {issue.id}
              </span>
              <StatusBadge status={issue.status} size="sm" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900">{issue.title}</h4>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1">{issue.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>
                  <strong className="text-slate-800">{distance_meters} m</strong> away
                </span>
              </div>
              <div className="text-right">
                <span>
                  Reports: <strong className="text-slate-800">{issue.related_reports_count} citizens</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-800 leading-relaxed">
            <strong>Civic Note:</strong> You are not blocked from submitting. If your complaint is separate or in a different spot, you can proceed with <em>"Report Anyway"</em>.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            id="report-anyway-btn"
            type="button"
            onClick={onReportAnyway}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            Report Anyway
          </button>
          <button
            id="view-existing-complaint-btn"
            type="button"
            onClick={() => onViewExisting(issue.id)}
            className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View Existing Ticket</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

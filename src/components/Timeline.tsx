import React from "react";
import { ComplaintStatus } from "../types";
import { Check, Clock, AlertTriangle, Sparkles, UserCheck, XCircle, ShieldAlert } from "lucide-react";

interface TimelineProps {
  status: ComplaintStatus;
  department?: string;
  createdAt: string;
  updatedAt?: string;
  id?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  status,
  department,
  createdAt,
  updatedAt,
  id
}) => {
  const steps: { key: string; label: string; sub?: string }[] = [
    { key: "REPORTED", label: "Reported", sub: "Citizen complaint filed" },
    { key: "AI_ANALYSIS", label: "AI Analysis", sub: "Vision model classified" },
    { key: "VERIFIED", label: "Verified", sub: "Triage engine scored" },
    { key: "ASSIGNED", label: "Assigned", sub: department ? `Sent to ${department}` : "Department allocated" },
    { key: "IN_PROGRESS", label: "In Progress", sub: "Crews dispatched" },
    { key: "RESOLVED", label: "Resolved", sub: "After photo uploaded" },
    { key: "CITIZEN_VERIFIED", label: "Citizen Verified", sub: "Citizen confirmed fix" }
  ];

  // Map complaint status to step index (0 to 6)
  const getStatusIndex = (st: ComplaintStatus): number => {
    switch (st) {
      case "REPORTED":
        return 1; // Both reported & AI analysis complete
      case "VERIFIED":
        return 2;
      case "ASSIGNED":
        return 3;
      case "IN_PROGRESS":
        return 4;
      case "RESOLVED":
        return 5;
      case "CITIZEN_VERIFIED":
        return 6;
      case "VERIFICATION_FAILED":
        return 4; // Reopened to In Progress
      default:
        return 0;
    }
  };

  const currentIndex = getStatusIndex(status);

  return (
    <div id={id || "complaint-timeline"} className="w-full py-4">
      {status === "VERIFICATION_FAILED" && (
        <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
              Verification Rejected by Citizen
            </h4>
            <p className="text-xs text-rose-800 mt-0.5">
              The inspecting citizen reported that the problem was not adequately resolved. Ticket has been automatically reopened and escalated back to In Progress.
            </p>
          </div>
        </div>
      )}

      {/* Desktop Horizontal Stepper */}
      <div className="hidden lg:flex items-center justify-between relative px-2">
        {/* Track Line */}
        <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-200 -z-0" />
        <div
          className="absolute top-4 left-8 h-0.5 bg-blue-600 transition-all duration-500 -z-0"
          style={{
            width: `${Math.max(0, Math.min(100, (currentIndex / (steps.length - 1)) * 100))}%`
          }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isFailedStep = status === "VERIFICATION_FAILED" && idx === 6;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10 w-24 text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs transition-colors duration-200 ${
                  isCompleted
                    ? "bg-emerald-600 text-white shadow-xs"
                    : isCurrent
                    ? "bg-blue-600 text-white font-bold ring-4 ring-blue-100 shadow-xs"
                    : isFailedStep
                    ? "bg-rose-600 text-white ring-4 ring-rose-100 shadow-xs"
                    : "bg-white border border-slate-200 text-slate-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 animate-pulse stroke-[2.5]" />
                ) : isFailedStep ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <span
                className={`mt-2 text-xs font-semibold ${
                  isCurrent
                    ? "text-blue-700 font-bold"
                    : isCompleted
                    ? "text-slate-800"
                    : "text-slate-400"
                }`}
              >
                {step.label}
              </span>

              <span className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 px-1 leading-tight">
                {step.sub}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile & Tablet Vertical Stepper */}
      <div className="lg:hidden space-y-3 px-1">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isFailedStep = status === "VERIFICATION_FAILED" && idx === 6;

          return (
            <div key={step.key} className="flex items-start gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs shrink-0 mt-0.5 ${
                  isCompleted
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : isCurrent
                    ? "bg-blue-600 text-white font-bold ring-2 ring-blue-100"
                    : isFailedStep
                    ? "bg-rose-600 text-white"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 animate-pulse" />
                ) : (
                  idx + 1
                )}
              </div>

              <div className="flex-1 pb-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isCurrent
                        ? "text-blue-700"
                        : isCompleted
                        ? "text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                      Active Stage
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{step.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

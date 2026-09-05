import React from "react";
import { ComplaintStatus } from "../types";
import { Check, Clock, AlertTriangle, UserCheck, XCircle, ArrowRight } from "lucide-react";

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
  const steps: { key: ComplaintStatus; label: string; sub?: string }[] = [
    { key: "REPORTED", label: "Reported", sub: "Citizen complaint filed" },
    { key: "VERIFIED", label: "Verified", sub: "AI & geo checked" },
    { key: "ASSIGNED", label: "Assigned", sub: department ? `Sent to ${department}` : "Department allocated" },
    { key: "IN_PROGRESS", label: "In Progress", sub: "Crews dispatched" },
    { key: "RESOLVED", label: "Resolved", sub: "Evidence uploaded" },
    { key: "CITIZEN_VERIFIED", label: "Citizen Verified", sub: "Citizen confirmed fix" }
  ];

  const statusOrder: ComplaintStatus[] = [
    "REPORTED",
    "VERIFIED",
    "ASSIGNED",
    "IN_PROGRESS",
    "RESOLVED",
    "CITIZEN_VERIFIED"
  ];

  const currentIndex = status === "VERIFICATION_FAILED" ? 3 : statusOrder.indexOf(status);

  return (
    <div id={id} className="w-full py-4">
      {status === "VERIFICATION_FAILED" && (
        <div className="mb-4 p-3.5 bg-[#2e1014] border border-[#ef4444]/30 rounded-lg flex items-start gap-3">
          <XCircle className="w-5 h-5 text-[#f87171] mt-0.5 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-[#f87171] uppercase tracking-wider">Verification Rejected by Citizen</h4>
            <p className="text-xs text-[#fca5a5] mt-0.5">
              The citizen inspected the site and reported the issue remains unresolved. Complaint has been reopened to In Progress.
            </p>
          </div>
        </div>
      )}

      {/* Desktop Horizontal Stepper */}
      <div className="hidden md:flex items-center justify-between relative">
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#1a1a1a] -z-0" />
        <div
          className="absolute top-4 left-6 h-0.5 bg-[#c5a059] transition-all duration-500 -z-0"
          style={{
            width: `${Math.max(0, Math.min(100, (currentIndex / (steps.length - 1)) * 100))}%`
          }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isFailedStep = status === "VERIFICATION_FAILED" && step.key === "CITIZEN_VERIFIED";

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10 w-28 text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs transition-colors duration-200 ${
                  isCompleted
                    ? "bg-[#14291f] text-[#34d399] border border-[#10b981]/40 shadow-sm"
                    : isCurrent
                    ? "bg-[#c5a059] text-black font-bold ring-4 ring-[#c5a059]/20 shadow-sm"
                    : isFailedStep
                    ? "bg-[#2e1014] text-[#f87171] ring-4 ring-[#ef4444]/20 border border-[#ef4444]/40"
                    : "bg-[#0c0c0c] border border-[#27272a] text-[#52525b]"
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
                className={`mt-2 text-[11px] uppercase tracking-wider font-semibold ${
                  isCurrent
                    ? "text-[#c5a059] font-bold"
                    : isCompleted
                    ? "text-[#d4d4d8]"
                    : "text-[#52525b]"
                }`}
              >
                {step.label}
              </span>
              <span className="text-[10px] text-[#71717a] line-clamp-1 mt-0.5">
                {step.sub}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Stepper */}
      <div className="md:hidden space-y-3">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex items-start gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5 ${
                  isCompleted
                    ? "bg-[#14291f] text-[#34d399] border border-[#10b981]/40"
                    : isCurrent
                    ? "bg-[#c5a059] text-black font-bold ring-2 ring-[#c5a059]/30"
                    : "bg-[#0c0c0c] text-[#52525b] border border-[#27272a]"
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : idx + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs uppercase tracking-wider font-semibold ${
                      isCurrent ? "text-[#c5a059]" : isCompleted ? "text-[#d4d4d8]" : "text-[#52525b]"
                    }`}
                  >
                    {step.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[9px] uppercase font-bold text-[#c5a059] bg-[#211a0c] px-2 py-0.5 rounded border border-[#c5a059]/30">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#71717a]">{step.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

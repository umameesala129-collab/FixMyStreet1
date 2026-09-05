import React, { useState } from "react";
import { CheckCircle2, ChevronRight, Play, X, Sparkles, ArrowRight, RotateCcw } from "lucide-react";

interface DemoScenarioGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerStepAction: (stepNumber: number) => void;
  id?: string;
}

export const DemoScenarioGuide: React.FC<DemoScenarioGuideProps> = ({
  isOpen,
  onClose,
  onTriggerStepAction,
  id
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  if (!isOpen) return null;

  const steps = [
    { num: 1, title: "Citizen Login", desc: "Citizen role is active (Ananya Sharma)." },
    { num: 2, title: "Click 'Report an Issue'", desc: "Open the 1-minute civic issue reporting form." },
    { num: 3, title: "Upload Pothole Photo", desc: "Attach road defect photo or select the sample pothole photo." },
    { num: 4, title: "AI Vision Analysis", desc: "AI model classifies: Pothole, 94% confidence, High severity." },
    { num: 5, title: "Capture Location", desc: "Select coordinates near Indiranagar 100ft Road (12.9719, 77.6412)." },
    { num: 6, title: "Duplicate Engine Triggered", desc: "System checks proximity & category against existing database." },
    { num: 7, title: "Duplicate Warning Displayed", desc: "Alert shows similar complaint FM-1024 is 37m away with 5 reports." },
    { num: 8, title: "Select 'Report Anyway'", desc: "Citizen opts to continue reporting unique incident." },
    { num: 9, title: "Smart Priority Engine", desc: "Calculates priority score 87/100 (CRITICAL level) with 5 factor weights." },
    { num: 10, title: "Complaint Submitted", desc: "Complaint FM-1042 registered in database." },
    { num: 11, title: "Authority Dashboard Updates", desc: "Switch to Authority view; see FM-1042 in priority queue." },
    { num: 12, title: "Open FM-1042 Details", desc: "Review evidence, location, AI confidence, and priority breakdown." },
    { num: 13, title: "Assign Department", desc: "Allocate Roads Department crew to the work order." },
    { num: 14, title: "Transition Status", desc: "Move status from Reported -> Assigned -> In Progress." },
    { num: 15, title: "Upload Resolution Evidence", desc: "Authority attaches after-repair photo and repair log notes." },
    { num: 16, title: "Mark as 'Resolved'", desc: "Issue enters verification state awaiting citizen signoff." },
    { num: 17, title: "Citizen Verification Prompt", desc: "Citizen dashboard alerts: 'Authority has marked issue as resolved'." },
    { num: 18, title: "Before vs After Comparison", desc: "Side-by-side evidence inspection of repaired bitumen surface." },
    { num: 19, title: "Click 'YES, IT IS FIXED'", desc: "Citizen validates repair quality at site." },
    { num: 20, title: "Status: CITIZEN VERIFIED", desc: "Accountability lifecycle verified with immutable timestamp." },
    { num: 21, title: "Public Map Reflects Status", desc: "Leaflet OpenStreetMap marker updates to green Verified pin." }
  ];

  return (
    <div
      id={id}
      className="fixed bottom-4 right-4 z-50 max-w-md w-full bg-[#0c0c0c] rounded-xl shadow-2xl border border-[#27272a] overflow-hidden animate-in slide-in-from-bottom-5 text-[#d4d4d8]"
    >
      {/* Header */}
      <div className="bg-[#141416] px-4 py-3 border-b border-[#27272a] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-[#c5a059] text-black flex items-center justify-center font-bold text-xs">
            21
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              21-Step Demo Scenario Guide
            </h3>
            <p className="text-[10px] text-[#71717a] font-mono">Spec Section 34 Walkthrough</p>
          </div>
        </div>
        <button
          id="close-demo-guide-x"
          onClick={onClose}
          className="text-[#71717a] hover:text-white p-1 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#a1a1aa] uppercase tracking-wider text-[11px]">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-[11px] text-[#c5a059] font-mono font-bold">
            {Math.round((currentStep / steps.length) * 100)}% Complete
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#c5a059] transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>

        {/* Active step card */}
        <div className="bg-[#141416] border border-[#27272a] rounded-lg p-3">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-sm bg-[#211a0c] border border-[#c5a059]/40 text-[#c5a059] flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
              {currentStep}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                {steps[currentStep - 1].title}
              </h4>
              <p className="text-[11px] text-[#a1a1aa] mt-0.5 leading-relaxed">
                {steps[currentStep - 1].desc}
              </p>
            </div>
          </div>
        </div>

        {/* Quick action buttons for the guide */}
        <div className="flex items-center justify-between pt-1 gap-2">
          <button
            type="button"
            disabled={currentStep <= 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="px-2.5 py-1 text-xs text-[#71717a] hover:text-white disabled:opacity-30 rounded uppercase tracking-wider"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={() => onTriggerStepAction(currentStep)}
            className="px-3.5 py-1.5 text-xs font-bold text-black bg-[#c5a059] hover:bg-[#d4b068] rounded-sm shadow-xs flex items-center gap-1 transition-colors uppercase tracking-wider"
          >
            <span>Jump to Step {currentStep}</span>
            <ArrowRight className="w-3 h-3 text-black stroke-[2.5]" />
          </button>

          <button
            type="button"
            disabled={currentStep >= steps.length}
            onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
            className="px-2.5 py-1 text-xs text-[#71717a] hover:text-white disabled:opacity-30 rounded font-medium uppercase tracking-wider"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

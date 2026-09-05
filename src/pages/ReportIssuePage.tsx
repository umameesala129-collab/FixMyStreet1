import React, { useState, useEffect } from "react";
import { CivicCategory, SeverityLevel, Issue } from "../types";
import {
  ALL_CATEGORIES,
  getDefaultDepartmentForCategory
} from "../utils/categoryUtils";
import { analyzeCivicIssueImage } from "../services/aiService";
import { calculatePriorityScore } from "../utils/priorityEngine";
import { findPotentialDuplicates } from "../utils/duplicateDetector";
import { addIssue, generateNextId, getStoredIssues } from "../services/storage";
import { SmartPriorityCard } from "../components/SmartPriorityCard";
import {
  Upload,
  Sparkles,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Info,
  Camera,
  Layers,
  ChevronRight,
  Compass,
  FileCheck,
  ShieldAlert,
  Loader2
} from "lucide-react";

interface ReportIssuePageProps {
  onSuccess: (newIssueId: string) => void;
  onCancel: () => void;
  id?: string;
}

// Pre-packaged high quality sample civic photos for rapid one-click testing
const PRESET_SAMPLE_PHOTOS = [
  {
    label: "Pothole (Indiranagar)",
    category: "Pothole" as CivicCategory,
    severity: "High" as SeverityLevel,
    url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    name: "pothole_crater_indiranagar.jpg",
    desc: "Large hazardous pothole right in the center lane near 12th Main junction. Two wheelers frequently swerving."
  },
  {
    label: "Garbage Overflow (Market)",
    category: "Garbage Overflow" as CivicCategory,
    severity: "Medium" as SeverityLevel,
    url: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80",
    name: "garbage_overflow_dump.jpg",
    desc: "Commercial municipal dumpster overflowing onto pedestrian pavement. Stray animals dispersing litter."
  },
  {
    label: "Blocked Drain (Ulsoor)",
    category: "Blocked Drain" as CivicCategory,
    severity: "Critical" as SeverityLevel,
    url: "https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=800&q=80",
    name: "blocked_stormwater_drain.jpg",
    desc: "Primary storm drain completely jammed with silt and plastic debris causing waterlogging."
  },
  {
    label: "Broken Streetlight (Jayanagar)",
    category: "Broken Streetlight" as CivicCategory,
    severity: "Medium" as SeverityLevel,
    url: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80",
    name: "broken_streetlight_pole.jpg",
    desc: "Streetlight fixture knocked loose with exposed electrical wiring."
  }
];

export const ReportIssuePage: React.FC<ReportIssuePageProps> = ({
  onSuccess,
  onCancel,
  id
}) => {
  // Step State (1 to 8)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>("");

  // AI & Classification
  const [aiResult, setAiResult] = useState<{
    category: CivicCategory;
    confidence: number;
    severity: SeverityLevel;
    reasoning?: string;
  } | null>(null);

  // Confirmed Fields
  const [category, setCategory] = useState<CivicCategory>("Pothole");
  const [severity, setSeverity] = useState<SeverityLevel>("High");
  const [title, setTitle] = useState<string>("Hazardous pothole in vehicular lane");
  const [description, setDescription] = useState<string>(
    "Deep cavity in road surface creating immediate hazard for two-wheelers and passenger vehicles."
  );
  const [address, setAddress] = useState<string>(
    "100ft Road, near 12th Main junction, Indiranagar, Ward 112"
  );
  const [latitude, setLatitude] = useState<number>(12.9719);
  const [longitude, setLongitude] = useState<number>(77.6412);
  const [isMainRoad, setIsMainRoad] = useState<boolean>(true);
  const [isNearSchool, setIsNearSchool] = useState<boolean>(true);

  // Duplicate Match
  const [duplicateMatch, setDuplicateMatch] = useState<any | null>(null);
  const [showDuplicateExplanation, setShowDuplicateExplanation] = useState<boolean>(false);

  // Submitted Success State
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl);
      setImageFileName(file.name);
      runAIAnalysis(dataUrl, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: typeof PRESET_SAMPLE_PHOTOS[0]) => {
    setImagePreview(preset.url);
    setImageBase64(preset.url);
    setImageFileName(preset.name);
    setTitle(`${preset.category} incident in Ward 112`);
    setDescription(preset.desc);
    runAIAnalysis(preset.url, preset.name, preset.category, preset.severity);
  };

  const runAIAnalysis = async (
    dataUrl: string,
    fileName: string,
    forcedCat?: CivicCategory,
    forcedSev?: SeverityLevel
  ) => {
    setIsAnalyzing(true);
    setLoadingText("Analyzing your photo with municipal computer vision...");
    setCurrentStep(2);

    try {
      const result = await analyzeCivicIssueImage({
        imageBase64: dataUrl,
        mimeType: "image/jpeg",
        fileName: fileName
      });

      const cat = forcedCat || result.category;
      const sev = forcedSev || result.severity;

      setAiResult({
        category: cat,
        confidence: result.confidence,
        severity: sev,
        reasoning: result.reasoning
      });

      setCategory(cat);
      setSeverity(sev);

      // Auto advance to step 3 after brief pause
      setTimeout(() => {
        setIsAnalyzing(false);
        setCurrentStep(3);
      }, 1000);
    } catch {
      setIsAnalyzing(false);
      setCurrentStep(3);
    }
  };

  // Run duplicate check when reaching step 6
  const checkForDuplicates = () => {
    setLoadingText("Checking for similar reports nearby...");
    const existing = getStoredIssues();
    const dups = findPotentialDuplicates(
      {
        category,
        latitude,
        longitude,
        description
      },
      existing,
      150 // 150m threshold
    );

    if (dups.length > 0) {
      setDuplicateMatch(dups[0]);
    } else {
      setDuplicateMatch(null);
    }
  };

  // Compute live priority
  const priorityBreakdown = calculatePriorityScore({
    severity,
    relatedReportsCount: duplicateMatch ? duplicateMatch.issue.related_reports_count + 1 : 1,
    isMainRoad,
    isNearSchool,
    daysOld: 0
  });

  // Final Submit
  const handleFinalSubmit = () => {
    const nextId = generateNextId();
    const newIssue: Issue = {
      id: nextId,
      title: title || `${category} reported at ${address.split(",")[0]}`,
      description,
      category,
      latitude,
      longitude,
      address,
      image_path: imagePreview || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
      ai_category: aiResult?.category || category,
      ai_confidence: aiResult?.confidence || 0.92,
      ai_reasoning: aiResult?.reasoning,
      severity,
      priority_score: priorityBreakdown.totalScore,
      priority_level: priorityBreakdown.level,
      priority_breakdown: priorityBreakdown,
      status: "REPORTED",
      department: getDefaultDepartmentForCategory(category),
      created_by: {
        id: "user-1",
        name: "Ananya Sharma",
        email: "ananya.sharma@example.com"
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      related_reports_count: duplicateMatch ? duplicateMatch.issue.related_reports_count + 1 : 1,
      is_main_road: isMainRoad,
      is_near_school: isNearSchool,
      estimated_affected_people: isMainRoad ? 400 : 120,
      upvotes: 1
    };

    addIssue(newIssue);
    setSubmittedId(nextId);
  };

  const stepsMeta = [
    { num: 1, label: "Photo Evidence" },
    { num: 2, label: "AI Analysis" },
    { num: 3, label: "Confirm Category" },
    { num: 4, label: "Location" },
    { num: 5, label: "Description" },
    { num: 6, label: "Duplicate Check" },
    { num: 7, label: "Priority Preview" },
    { num: 8, label: "Submit" }
  ];

  // If submitted successfully: SECTION 31 SUCCESS STATE
  if (submittedId) {
    return (
      <div id={id || "report-success-view"} className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 font-display">
              Your issue has been reported.
            </h2>
            <p className="text-xs text-slate-500">
              Complaint ID: <strong className="font-mono text-blue-600 text-sm">{submittedId}</strong>
            </p>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Keep this ID to track your report. You will receive notifications as work progresses.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => onSuccess(submittedId)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Complaint Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onCancel}
              className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Return to Citizen Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id={id || "report-issue-wizard"} className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header & Cancel */}
        <div className="flex items-center justify-between">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>

          <div className="text-right">
            <span className="text-xs font-bold text-blue-600 font-mono">
              STEP {currentStep} OF 8
            </span>
            <span className="text-xs text-slate-400 block font-medium">
              {stepsMeta[currentStep - 1]?.label}
            </span>
          </div>
        </div>

        {/* SECTION 12: PROGRESS INDICATOR (1/8 ... 8/8) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Report Progress</span>
            <span className="font-mono text-slate-700">{Math.round((currentStep / 8) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 8) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP CARDS */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {/* STEP 1: UPLOAD PHOTO */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  Step 1: Upload Photo Evidence
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Take a clear photograph of the civic problem. Our municipal AI will analyze the hazard.
                </p>
              </div>

              {/* Upload Dropzone */}
              <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-900">
                  Click or drag photo to upload
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Supports JPEG, PNG up to 10MB
                </span>
              </label>

              {/* Preset Sample Photos for Rapid 1-Click Testing */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Or pick a sample testing scenario:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PRESET_SAMPLE_PHOTOS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-600 bg-white hover:bg-blue-50/40 text-left transition-all group"
                    >
                      <img
                        src={preset.url}
                        alt=""
                        className="w-full h-16 rounded-lg object-cover mb-2"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-700 block truncate">
                        {preset.label}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {preset.severity} Priority
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: AI ANALYSIS LOADING */}
          {currentStep === 2 && (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto animate-spin">
                <Loader2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Analyzing your photo...
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Running civic computer vision model to detect infrastructure category, physical boundaries, and safety severity.
              </p>
            </div>
          )}

          {/* STEP 3: CONFIRM ISSUE CATEGORY (SECTION 13) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  Step 3: Confirm Issue Category
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Verify or override the category identified by the computer vision system.
                </p>
              </div>

              {/* SECTION 13: HUMAN READABLE AI DETECTION BOX */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-blue-700">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    AI Visual Assessment
                  </span>
                </div>

                <h3 className="text-base font-bold text-blue-950 font-display">
                  "We think this is a {aiResult?.category || category}."
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 pt-1">
                  <div>
                    <span className="text-slate-500">Confidence: </span>
                    <strong className="text-slate-900 font-bold">
                      {Math.round((aiResult?.confidence || 0.91) * 100)}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Suggested Priority: </span>
                    <strong className="text-slate-900 font-bold">
                      {aiResult?.severity || severity}
                    </strong>
                  </div>
                </div>

                {aiResult?.reasoning && (
                  <p className="text-xs text-slate-600 pt-1 border-t border-blue-200/50">
                    Observation: {aiResult.reasoning}
                  </p>
                )}
              </div>

              {/* Category Override Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Select or Change Category Manually:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {ALL_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        category === cat
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-700">
                  Hazard Severity:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["Low", "Medium", "High", "Critical"] as SeverityLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSeverity(lvl)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        severity === lvl
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SELECT LOCATION */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  Step 4: Confirm Location &amp; Road Context
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Specify street address and nearby community landmarks to guide field response.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Street Address / Junction
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value))}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value))}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isMainRoad}
                      onChange={(e) => setIsMainRoad(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Located on major arterial road (affects higher traffic volume)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNearSchool}
                      onChange={(e) => setIsNearSchool(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Located near school, kindergarten, or hospital zone</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: ADD DESCRIPTION */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  Step 5: Add Description &amp; Details
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Help dispatchers understand how the hazard impacts residents or motorists.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Issue Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detailed Observations
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:border-blue-500 focus:outline-hidden leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: DUPLICATE CHECK (SECTION 14) */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  Step 6: Duplicate Check
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Checking if neighboring citizens have already reported this hazard to avoid work order fragmentation.
                </p>
              </div>

              {duplicateMatch ? (
                /* SECTION 14 IMPROVED DUPLICATE DETECTION UX */
                <div className="bg-amber-50/80 border-2 border-amber-200 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-amber-900">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h3 className="text-base font-bold font-display">
                      Similar issue found nearby.
                    </h3>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        {duplicateMatch.issue.id} &bull; {duplicateMatch.issue.category}
                      </span>
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                        Approximately {duplicateMatch.distance_meters} m away
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      {duplicateMatch.issue.title}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <span>Status: <strong className="text-slate-800">{duplicateMatch.issue.status}</strong></span>
                      <span>Related reports: <strong className="text-slate-800">{duplicateMatch.issue.related_reports_count} citizens</strong></span>
                    </div>
                  </div>

                  {/* Expandable "Why did we flag this?" */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDuplicateExplanation(!showDuplicateExplanation)}
                      className="text-xs font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1 underline"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>{showDuplicateExplanation ? "Hide reasons" : "Why did we flag this?"}</span>
                    </button>

                    {showDuplicateExplanation && (
                      <div className="mt-2 text-xs text-amber-900 bg-amber-100/50 p-3 rounded-lg space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                          <span>Category matches ({duplicateMatch.issue.category})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                          <span>Location is nearby ({duplicateMatch.distance_meters} meters away)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                          <span>Description text and hazard keywords are highly correlated</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => onSuccess(duplicateMatch.issue.id)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      View Existing Issue
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(7)}
                      className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl"
                    >
                      Report Anyway (New Incident)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-950">
                    No duplicate reports detected in this radius.
                  </h4>
                  <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                    Your report appears to be the first notification for this specific problem in Ward 112.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 7: PRIORITY PREVIEW (SECTION 15) */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  Step 7: Priority Score Preview
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  How the municipal triage algorithm evaluates your report based on physical impact and safety context.
                </p>
              </div>

              <SmartPriorityCard
                score={priorityBreakdown.totalScore}
                level={priorityBreakdown.level}
                breakdown={priorityBreakdown}
              />
            </div>
          )}

          {/* STEP 8: FINAL SUBMIT */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  Step 8: Review &amp; Submit Complaint
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Please review the summary before submitting to the city operations dispatch queue.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Category:</span>
                  <strong className="text-slate-900 font-bold">{category}</strong>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Location:</span>
                  <strong className="text-slate-900 font-bold truncate max-w-xs">{address}</strong>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Severity:</span>
                  <strong className="text-slate-900 font-bold">{severity}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Initial Priority Score:</span>
                  <strong className="text-blue-600 font-bold font-mono">
                    {priorityBreakdown.totalScore}/100 ({priorityBreakdown.level})
                  </strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinalSubmit}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Official Complaint</span>
              </button>
            </div>
          )}

          {/* Navigation Controls (Back & Next) */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              disabled={currentStep === 1 || currentStep === 2}
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-colors"
            >
              &larr; Back
            </button>

            {currentStep < 8 && currentStep !== 2 && (
              <button
                type="button"
                disabled={currentStep === 1 && !imagePreview}
                onClick={() => {
                  if (currentStep === 5) {
                    checkForDuplicates();
                  }
                  setCurrentStep((prev) => Math.min(8, prev + 1));
                }}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

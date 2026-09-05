import React, { useState } from "react";
import { CivicCategory, SeverityLevel, Issue } from "../types";
import {
  ALL_CATEGORIES,
  getDefaultDepartmentForCategory
} from "../utils/categoryUtils";
import { analyzeCivicIssueImage } from "../services/aiService";
import { calculatePriorityScore } from "../utils/priorityEngine";
import { findPotentialDuplicates } from "../utils/duplicateDetector";
import { addIssue, generateNextId, getStoredIssues } from "../services/storage";
import { DuplicateWarningModal } from "../components/DuplicateWarningModal";
import {
  Upload,
  Sparkles,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Flame,
  Info,
  Camera,
  Layers,
  ArrowLeft
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
    desc: "Large pothole in road center lane causing vehicles to swerve."
  },
  {
    label: "Garbage Overflow (Market)",
    category: "Garbage Overflow" as CivicCategory,
    severity: "Medium" as SeverityLevel,
    url: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80",
    name: "garbage_overflow_dump.jpg",
    desc: "Commercial municipal dumpster overflowing onto pedestrian pavement."
  },
  {
    label: "Blocked Drain (Ulsoor)",
    category: "Blocked Drain" as CivicCategory,
    severity: "Critical" as SeverityLevel,
    url: "https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=800&q=80",
    name: "blocked_stormwater_drain.jpg",
    desc: "Storm drain blocked with solid plastic debris causing waterlogging."
  },
  {
    label: "Broken Streetlight (Jayanagar)",
    category: "Broken Streetlight" as CivicCategory,
    severity: "Medium" as SeverityLevel,
    url: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80",
    name: "broken_streetlight_pole.jpg",
    desc: "Streetlight fixture knocked loose with disconnected electrical cables."
  }
];

export const ReportIssuePage: React.FC<ReportIssuePageProps> = ({
  onSuccess,
  onCancel,
  id
}) => {
  // Form State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<{
    category: CivicCategory;
    confidence: number;
    severity: SeverityLevel;
    reasoning?: string;
  } | null>(null);

  // Confirmed Fields
  const [category, setCategory] = useState<CivicCategory>("Pothole");
  const [isManualCategory, setIsManualCategory] = useState<boolean>(false);
  const [severity, setSeverity] = useState<SeverityLevel>("High");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [address, setAddress] = useState<string>("Indiranagar 100ft Road, near 12th Main junction, Ward 112");
  const [latitude, setLatitude] = useState<number>(12.9719);
  const [longitude, setLongitude] = useState<number>(77.6412);
  const [isMainRoad, setIsMainRoad] = useState<boolean>(true);
  const [isNearSchool, setIsNearSchool] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Duplicate Modal State
  const [duplicateMatch, setDuplicateMatch] = useState<any | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState<boolean>(false);

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl);
      setImageFileName(file.name);
      triggerAIAnalysis(dataUrl, file.name);
    };
    reader.readAsDataURL(file);
  };

  // Preset Sample Photo Selection
  const handleSelectPreset = (preset: typeof PRESET_SAMPLE_PHOTOS[0]) => {
    setImagePreview(preset.url);
    setImageBase64("");
    setImageFileName(preset.name);
    if (!title) setTitle(`Report: ${preset.category} issue`);
    if (!description) setDescription(preset.desc);

    triggerAIAnalysis("", preset.name, preset.desc);
  };

  // Trigger AI Vision Detection
  const triggerAIAnalysis = async (b64: string, fName: string, desc?: string) => {
    setIsAnalyzing(true);
    setAiResult(null);

    try {
      const result = await analyzeCivicIssueImage({
        imageBase64: b64,
        fileName: fName,
        description: desc || description
      });

      setAiResult(result);
      setCategory(result.category);
      setSeverity(result.severity);
      if (!title) {
        setTitle(`${result.category} reported on ${address.split(",")[0] || "Street"}`);
      }
    } catch (err) {
      console.warn("AI analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get User Geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        setLatitude(Number(position.coords.latitude.toFixed(5)));
        setLongitude(Number(position.coords.longitude.toFixed(5)));
        setAddress(`GPS Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}), Ward Area`);
      },
      (error) => {
        setIsLocating(false);
        console.warn("Geolocation error:", error.message);
        alert("Could not retrieve GPS location. You may use preset municipal coordinates.");
      },
      { timeout: 8000 }
    );
  };

  // Calculate live priority score preview
  const priorityPreview = calculatePriorityScore({
    severity,
    relatedReportsCount: 1,
    isMainRoad,
    isNearSchool,
    daysOld: 0
  });

  // Pre-check for duplicate complaints before submitting
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!imagePreview) {
      alert("Please upload or select an evidence photo of the issue.");
      return;
    }

    if (!title.trim() || !description.trim()) {
      alert("Please enter a title and description for the report.");
      return;
    }

    const existingIssues = getStoredIssues();
    const potentialDuplicates = findPotentialDuplicates(
      {
        category,
        latitude,
        longitude,
        description
      },
      existingIssues,
      60
    );

    if (potentialDuplicates.length > 0) {
      setDuplicateMatch(potentialDuplicates[0]);
      setShowDuplicateModal(true);
      return;
    }

    commitComplaintSubmission();
  };

  const commitComplaintSubmission = () => {
    const newId = generateNextId();
    const department = getDefaultDepartmentForCategory(category);

    const newIssue: Issue = {
      id: newId,
      title: title.trim(),
      description: description.trim(),
      category,
      latitude,
      longitude,
      address,
      image_path: imagePreview || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
      ai_category: aiResult?.category,
      ai_confidence: aiResult?.confidence,
      ai_reasoning: aiResult?.reasoning,
      severity,
      priority_score: priorityPreview.totalScore,
      priority_level: priorityPreview.level,
      priority_breakdown: priorityPreview,
      status: "REPORTED",
      department,
      created_by: {
        id: "user-1",
        name: "Ananya Sharma",
        email: "ananya.sharma@example.com"
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      related_reports_count: 1,
      is_main_road: isMainRoad,
      is_near_school: isNearSchool,
      estimated_affected_people: isMainRoad ? 350 : 80
    };

    addIssue(newIssue);
    onSuccess(newId);
  };

  return (
    <div id={id} className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Duplicate Warning Modal */}
      {duplicateMatch && (
        <DuplicateWarningModal
          isOpen={showDuplicateModal}
          match={duplicateMatch}
          onClose={() => setShowDuplicateModal(false)}
          onReportAnyway={() => {
            setShowDuplicateModal(false);
            commitComplaintSubmission();
          }}
          onViewExisting={(existingId) => {
            setShowDuplicateModal(false);
            onSuccess(existingId);
          }}
        />
      )}

      <div className="max-w-3xl mx-auto">
        {/* Navigation & Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel &amp; Return</span>
          </button>
          <div className="text-right">
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200/60">
              Ward 112 Public Submission
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-white">
            <h1 className="text-xl font-bold text-slate-900 font-display">Report a Civic Problem</h1>
            <p className="text-xs text-slate-500 mt-1">
              Upload a clear photo and location. Our system categorizes the issue, checks for existing nearby tickets, and alerts the responsible department.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* STEP 1: Upload Photo Evidence */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    1
                  </span>
                  Photographic Evidence *
                </label>
                <span className="text-xs text-slate-400">JPG, PNG, WEBP (&lt; 10MB)</span>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-5 text-center transition-colors bg-slate-50/60">
                {imagePreview ? (
                  <div className="space-y-3">
                    <div className="aspect-video max-h-64 mx-auto rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative shadow-2xs">
                      <img
                        src={imagePreview}
                        alt="Civic evidence preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <label
                        htmlFor="file-upload-replace"
                        className="cursor-pointer text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-1.5 rounded-lg shadow-2xs transition-colors"
                      >
                        Change Photo
                      </label>
                      <input
                        id="file-upload-replace"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="py-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                      <Camera className="w-6 h-6" />
                    </div>
                    <label
                      htmlFor="file-upload-main"
                      className="cursor-pointer inline-flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-98"
                    >
                      <Upload className="w-4 h-4 stroke-[2.5]" />
                      <span>Choose Photo from Device</span>
                    </label>
                    <input
                      id="file-upload-main"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <p className="text-xs text-slate-500 mt-2.5">
                      Or select one of our pre-loaded test samples below to try the system immediately:
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div className="pt-1">
                <span className="text-xs font-semibold text-slate-600 block mb-2">
                  Sample Test Photos:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PRESET_SAMPLE_PHOTOS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="p-3 text-left rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/20 text-xs transition-all flex flex-col justify-between shadow-2xs cursor-pointer"
                    >
                      <span className="font-semibold text-slate-800 line-clamp-1">{preset.label}</span>
                      <span className="text-[11px] font-medium text-blue-600 mt-1">{preset.severity} Priority</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 2: AI Analysis & Category Confirmation */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                  2
                </span>
                AI Classification &amp; Category Confirmation *
              </label>

              {isAnalyzing && (
                <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center gap-3 animate-pulse">
                  <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                  <div>
                    <h4 className="text-xs font-bold text-blue-900">Analyzing Photo with AI Vision...</h4>
                    <p className="text-xs text-blue-700 mt-0.5">Detecting infrastructure category, severity estimate, and hazard risk.</p>
                  </div>
                </div>
              )}

              {aiResult && !isAnalyzing && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900">AI Suggestion:</span>
                      <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-md">
                        {aiResult.category}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      {Math.round(aiResult.confidence * 100)}% Match
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>
                      Suggested Severity: <strong className="text-slate-900">{aiResult.severity}</strong>
                    </span>
                    <span className="text-slate-500 italic text-xs">
                      {aiResult.reasoning || "Detected surface defect"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCategory(aiResult.category);
                        setSeverity(aiResult.severity);
                        setIsManualCategory(false);
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                        !isManualCategory
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      Confirm ({aiResult.category})
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsManualCategory(true)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                        isManualCategory
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      Choose Different Category
                    </button>
                  </div>
                </div>
              )}

              {(isManualCategory || !aiResult) && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Select Civic Category Manually:
                    </span>
                    <span className="text-xs text-slate-400">Routes to relevant municipal team</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ALL_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setCategory(cat);
                          setIsManualCategory(true);
                        }}
                        className={`p-2.5 text-left rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          category === cat
                            ? "bg-blue-50 text-blue-800 border-blue-400 font-bold shadow-2xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-700">Observed Hazard Severity:</span>
                    <div className="flex gap-1.5">
                      {(["Low", "Medium", "High", "Critical"] as SeverityLevel[]).map((sev) => (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => setSeverity(sev)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                            severity === sev
                              ? "bg-blue-600 text-white border-blue-600 font-bold shadow-2xs"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {sev}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 3: Location Details */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    3
                  </span>
                  Incident Location *
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-50 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{isLocating ? "Locating..." : "Use Current GPS"}</span>
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name, landmark, Ward number"
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div>
                  <span className="text-slate-500 text-[11px] font-medium">Latitude:</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg mt-1 bg-white text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] font-medium">Longitude:</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg mt-1 bg-white text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Location Context Toggles */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMainRoad}
                    onChange={(e) => setIsMainRoad(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-slate-700">Located on Main Arterial Corridor (+5 priority)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNearSchool}
                    onChange={(e) => setIsNearSchool(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-slate-700">Near School or Hospital Zone</span>
                </label>
              </div>
            </div>

            {/* STEP 4: Title & Description */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                  4
                </span>
                Problem Summary &amp; Details *
              </label>

              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short summary (e.g. Hazardous pothole opposite metro exit)"
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue condition, depth, hazard to two-wheelers/pedestrians..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
            </div>

            {/* STEP 5: Smart Priority Score Live Breakdown */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    5
                  </span>
                  Calculated Priority Preview
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Calculated Score:</span>
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                    {priorityPreview.totalScore} / 100
                  </span>
                  <span className="text-xs font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                    {priorityPreview.level}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
                  <span>Weight Breakdown:</span>
                  <span>Objective Municipal Engine</span>
                </div>
                <div className="space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Severity (40%):</span>
                    <strong className="text-slate-900 font-mono">{priorityPreview.severityScore} / 40 pts</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Neighbor Reports (25%):</span>
                    <strong className="text-slate-900 font-mono">{priorityPreview.reportsScore} / 25 pts</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Impact (15%):</span>
                    <strong className="text-slate-900 font-mono">{priorityPreview.affectedScore} / 15 pts</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Location Context (10%):</span>
                    <strong className="text-slate-900 font-mono">{priorityPreview.locationScore} / 10 pts</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Issue Age Factor (10%):</span>
                    <strong className="text-slate-900 font-mono">{priorityPreview.ageScore} / 10 pts</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Submission Actions */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="submit-complaint-btn"
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                <span>Submit Complaint</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

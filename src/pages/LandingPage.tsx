import React from "react";
import { Issue } from "../types";
import {
  Sparkles,
  CopyCheck,
  Flame,
  ShieldCheck,
  MapPin,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ChevronRight,
  Shield,
  Camera,
  Users
} from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import smartCityBg from "../assets/images/smart_city_bg_1788593742554.jpg";

interface LandingPageProps {
  issues: Issue[];
  onNavigate: (tab: "home" | "report" | "map" | "citizen-dash" | "authority-dash" | "login") => void;
  onSelectIssue: (id: string) => void;
  onOpenAuthModal?: (initialRole?: "citizen" | "authority") => void;
  onOpenAuthPage?: (role?: "citizen" | "authority", view?: "choose-role" | "citizen-login" | "authority-login" | "citizen-register" | "authority-register") => void;
  id?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  issues = [],
  onNavigate,
  onSelectIssue,
  onOpenAuthModal,
  onOpenAuthPage,
  id
}) => {
  const safeIssues = Array.isArray(issues) ? issues : [];
  const totalReported = safeIssues.length;
  const resolvedCount = safeIssues.filter(
    (i) => i && (i.status === "RESOLVED" || i.status === "CITIZEN_VERIFIED")
  ).length;
  const activeCount = totalReported - resolvedCount;
  const criticalCount = safeIssues.filter((i) => i && i.priority_level === "CRITICAL").length;
  const resolutionRate = totalReported > 0 ? Math.round((resolvedCount / totalReported) * 100) : 0;

  const recentIssues = safeIssues.slice(0, 4);

  const handleSignInClick = () => {
    if (onOpenAuthPage) {
      onOpenAuthPage(undefined, "choose-role");
    } else if (onOpenAuthModal) {
      onOpenAuthModal("citizen");
    } else {
      onNavigate("login");
    }
  };

  const handleAuthorityAccessClick = () => {
    if (onOpenAuthPage) {
      onOpenAuthPage("authority", "authority-login");
    } else if (onOpenAuthModal) {
      onOpenAuthModal("authority");
    } else {
      onNavigate("login");
    }
  };

  return (
    <div id={id} className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Hero Section with Smart City Background */}
      <section className="relative overflow-hidden bg-slate-950 border-b border-slate-800/80 py-18 sm:py-26">
        {/* Background Image Container with Ambient Gradient Overlays */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={smartCityBg}
            alt="FixMyStreet smart city connected infrastructure"
            className="w-full h-full object-cover object-center opacity-35 filter contrast-105 brightness-90"
            referrerPolicy="no-referrer"
          />
          {/* Multi-layered soft vignette and gradient to preserve maximum text legibility and generous negative space */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/60 to-slate-950/95" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-slate-950/70" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/25 text-blue-300 text-xs font-semibold mb-6 shadow-2xs backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Open Civic Network &bull; Transparent Municipal Works</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white font-display mb-5 leading-tight">
            Report neighborhood problems. <br className="hidden sm:inline" />
            <span className="text-blue-400">Watch your city fix them.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 mb-9 leading-relaxed">
            Snap a photo of potholes, trash overflow, or broken streetlights. Your report is routed to the right municipal department, tracked publicly on the map, and confirmed by neighbors when finished.
          </p>

          {/* Action Buttons per Section 24: Report an Issue, Sign In, Authority Access */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              id="hero-report-btn"
              onClick={() => onNavigate("report")}
              className="px-6 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <span>Report an Issue</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              id="hero-signin-btn"
              onClick={handleSignInClick}
              className="px-5 py-3.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer backdrop-blur-md"
            >
              <Users className="w-4 h-4 text-blue-300" />
              <span>Sign In</span>
            </button>

            <button
              id="hero-authority-btn"
              onClick={handleAuthorityAccessClick}
              className="px-5 py-3.5 text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer backdrop-blur-md"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Authority Access</span>
            </button>

            <button
              id="hero-map-btn"
              onClick={() => onNavigate("map")}
              className="px-4 py-3.5 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Explore Map</span>
            </button>
          </div>
        </div>
      </section>

      {/* Real-time Civic Metrics Summary */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20 w-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 overflow-hidden">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs font-semibold mb-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Issues Reported</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{totalReported}</div>
            <p className="text-xs text-slate-400 mt-1">Logged across all wards</p>
          </div>

          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs font-semibold mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Repairs Completed</span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-600">{resolvedCount}</div>
            <p className="text-xs text-slate-400 mt-1">Work orders closed</p>
          </div>

          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs font-semibold mb-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Active in Progress</span>
            </div>
            <div className="text-3xl font-extrabold text-amber-600">{activeCount}</div>
            <p className="text-xs text-slate-400 mt-1">Field crews deployed</p>
          </div>

          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs font-semibold mb-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Resolution Rate</span>
            </div>
            <div className="text-3xl font-extrabold text-indigo-600">{resolutionRate}%</div>
            <p className="text-xs text-slate-400 mt-1">City accountability index</p>
          </div>
        </div>
      </section>

      {/* Section 4: Role Selection Portal Experience */}
      <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
            Welcome to FixMyStreet
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            How would you like to continue? Select your access portal to begin reporting or managing civic infrastructure.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8 text-left">
            {/* Citizen Option */}
            <div
              id="landing-role-citizen-card"
              onClick={() => {
                if (onOpenAuthModal) onOpenAuthModal("citizen");
                else onNavigate("citizen-dash");
              }}
              className="p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-600 bg-slate-50/50 hover:bg-blue-50/20 transition-all cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  Citizen Login
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Report and track civic issues in your neighborhood. Confirm when repairs are completed.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-blue-700">
                <span>Enter Citizen Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Authority Option */}
            <div
              id="landing-role-authority-card"
              onClick={() => {
                if (onOpenAuthModal) onOpenAuthModal("authority");
                else onNavigate("authority-dash");
              }}
              className="p-6 rounded-2xl border-2 border-slate-200 hover:border-slate-800 bg-slate-50/50 hover:bg-slate-100/50 transition-all cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  Authority Login
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Manage and resolve civic issues. Triage priority work orders, assign departments, and upload proof.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Enter Operations Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
            Simple 5-Step Process
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
            How complaints travel from report to repair
          </h3>
          <p className="text-slate-600 text-sm mt-2">
            Every step is recorded on the public timeline so citizens stay updated and departments stay accountable.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { step: "1", title: "Snap & Report", desc: "Upload photo, location, and brief problem description" },
            { step: "2", title: "AI Categorize", desc: "Computer vision suggests category and checks duplicates" },
            { step: "3", title: "Priority Score", desc: "Objective scoring from 0 to 100 ensures urgent safety first" },
            { step: "4", title: "Council Repair", desc: "Assigned department deploys crew & attaches after-repair photo" },
            { step: "5", title: "Citizen Confirms", desc: "Reporting citizen inspects before/after photos to close the ticket" }
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-blue-300 hover:shadow-xs transition-all relative"
            >
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200/60 mb-3">
                {item.step}
              </span>
              <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Architectural Features */}
      <section className="py-12 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              System Capabilities
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
              Built for real urban challenges
            </h3>
            <p className="text-slate-600 text-sm mt-2">
              No bloated enterprise software or expensive subscriptions. Pure, reliable civic-tech.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1.5">AI Vision Categorization</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Detects potholes, drain blocks, garbage piles, and streetlight issues instantly. Citizens can always review and change the AI's suggestion.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/60 px-2.5 py-1 rounded-md w-fit">
                Zero-setup local fallback included
              </span>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                  <CopyCheck className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1.5">Duplicate Warning System</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Haversine distance calculations warn users if neighbors have already reported the same issue nearby, preventing council backlog.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/60 px-2.5 py-1 rounded-md w-fit">
                Informs citizens without blocking
              </span>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                  <Flame className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1.5">Explainable Priority Engine</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Scores issues from 0 to 100 based on severity (40%), report count (25%), safety impact (15%), arterial road zone (10%), and age factor (10%).
                </p>
              </div>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-100/60 px-2.5 py-1 rounded-md w-fit">
                Transparent &amp; auditable formula
              </span>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1.5">Citizen Photo Sign-off</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  When crews finish, they upload physical photo proof. The reporting citizen must confirm the problem is truly solved before ticket closes.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/60 px-2.5 py-1 rounded-md w-fit">
                Reopens automatically if rejected
              </span>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1.5">Privacy-First Public Map</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  OpenStreetMap with Leaflet displays real-time pins color-coded by urgency. No personal contact details or citizen identity are ever published.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-sky-800 bg-sky-100/60 px-2.5 py-1 rounded-md w-fit">
                100% Free OpenStreetMap
              </span>
            </div>

            {/* Dual Role Governance */}
            <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-1.5">Dual-Role Governance</h4>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Switch between Citizen Portal and Municipal Officer Workbench to assign departments, triage queues, and upload work order proofs.
                </p>
              </div>
              <button
                onClick={() => onNavigate("authority-dash")}
                className="mt-5 text-xs font-bold text-blue-900 bg-white hover:bg-blue-50 px-3.5 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Open Authority Workbench</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Civic Issues Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Recent Neighborhood Reports</h3>
            <p className="text-xs text-slate-500 mt-0.5">Live complaints currently tracked across municipal wards</p>
          </div>
          <button
            onClick={() => onNavigate("map")}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View all reports on map</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {recentIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => onSelectIssue(issue.id)}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={issue.image_path}
                    alt={issue.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-white/95 text-slate-800 rounded-md border border-slate-200 shadow-2xs">
                      {issue.id}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      {issue.category}
                    </span>
                    <PriorityBadge score={issue.priority_score} level={issue.priority_level} size="sm" />
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">{issue.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{issue.address}</span>
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between text-xs mt-2">
                <StatusBadge status={issue.status} size="sm" />
                <span className="text-xs font-semibold text-blue-600 flex items-center gap-0.5">
                  Inspect <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 26: Trust & Transparency Section */}
      <section className="py-16 bg-slate-50 border-t border-slate-200 w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display mb-3">
            Why FixMyStreet?
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto mb-10">
            A reliable municipal reporting bridge built on open civic data and community accountability.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900 mb-2">Faster Reporting</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Structured complaints make reporting easier. Pre-filled location tags and quick photo analysis remove guesswork.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900 mb-2">Better Prioritization</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Urgent issues receive higher priority. Multi-factor scoring ensures hazardous road and drainage conditions get dispatched first.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900 mb-2">Transparent Resolution</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Citizens can verify completed work. Side-by-side photographic evidence ensures tickets are only closed when actually fixed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Human Footer */}
      <footer className="mt-auto bg-white text-slate-500 py-8 border-t border-slate-200 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 font-display">FixMyStreet</span>
            <span>&bull;</span>
            <span>Connecting citizens and local municipal wards</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Powered by OpenStreetMap</span>
            <span>&bull;</span>
            <span>Community Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

import React from "react";
import { User } from "../types";
import {
  MapPin,
  PlusCircle,
  LayoutDashboard,
  Shield,
  User as UserIcon,
  RotateCcw,
  BookOpen,
  Map as MapIcon,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";

interface NavbarProps {
  activeTab: "home" | "report" | "map" | "citizen-dash" | "authority-dash" | "issue-detail";
  setActiveTab: (tab: "home" | "report" | "map" | "citizen-dash" | "authority-dash") => void;
  currentUser: User;
  onSwitchRole: (role: "citizen" | "authority") => void;
  onResetDemoData: () => void;
  onOpenDemoGuide: () => void;
  id?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onSwitchRole,
  onResetDemoData,
  onOpenDemoGuide,
  id
}) => {
  return (
    <header id={id} className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
      {/* Top Utility Bar: City Status, Role Switcher, Demo Actions */}
      <div className="bg-slate-50 border-b border-slate-200/70 text-xs px-4 sm:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-600 text-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-800">Bangalore Civic Network</span>
            <span className="text-slate-300 hidden sm:inline">&bull;</span>
            <span className="text-slate-500 hidden sm:inline">Active coverage in Ward 112 (Indiranagar, Ulsoor, Jayanagar)</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Human Role Switcher */}
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-400 px-2 hidden sm:inline">View as:</span>
              <button
                id="switch-role-citizen-btn"
                onClick={() => onSwitchRole("citizen")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  currentUser.role === "citizen"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Citizen
              </button>
              <button
                id="switch-role-authority-btn"
                onClick={() => onSwitchRole("authority")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  currentUser.role === "authority"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Municipal Officer
              </button>
            </div>

            {/* Demo Guide */}
            <button
              id="demo-guide-btn"
              onClick={onOpenDemoGuide}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1 rounded-lg border border-blue-200/70 transition-colors"
              title="Open the step-by-step testing scenario"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Demo Guide</span>
            </button>

            {/* Reset Data */}
            <button
              id="reset-demo-data-btn"
              onClick={() => {
                if (confirm("Reset sample complaints back to initial state?")) {
                  onResetDemoData();
                }
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 px-1 py-1 transition-colors"
              title="Reset sample reports"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Seed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab("home")}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:bg-blue-700 transition-colors">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight font-display">
                  FixMyStreet
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200/60">
                  Public Beta
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-0.5">
                Civic reporting &amp; community verification
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              id="nav-home-btn"
              onClick={() => setActiveTab("home")}
              className={`text-sm font-medium px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === "home"
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Overview
            </button>

            <button
              id="nav-map-btn"
              onClick={() => setActiveTab("map")}
              className={`text-sm font-medium px-3.5 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "map"
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <MapIcon className="w-4 h-4 text-slate-500" />
              <span>Interactive Map</span>
            </button>

            <button
              id="nav-citizen-dash-btn"
              onClick={() => setActiveTab("citizen-dash")}
              className={`text-sm font-medium px-3.5 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "citizen-dash"
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <UserIcon className="w-4 h-4 text-slate-500" />
              <span>Citizen Portal</span>
            </button>

            <button
              id="nav-authority-dash-btn"
              onClick={() => setActiveTab("authority-dash")}
              className={`text-sm font-medium px-3.5 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "authority-dash"
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Shield className="w-4 h-4 text-slate-500" />
              <span>City Operations</span>
            </button>
          </nav>

          {/* Action CTA */}
          <div className="flex items-center gap-3">
            <button
              id="nav-report-issue-btn"
              onClick={() => setActiveTab("report")}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 active:scale-98"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Report a Problem</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 bg-white px-2 py-2 text-xs">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center py-1 px-2 rounded-md ${
            activeTab === "home" ? "text-blue-600 font-bold bg-blue-50" : "text-slate-600"
          }`}
        >
          <span className="text-xs">Overview</span>
        </button>
        <button
          onClick={() => setActiveTab("map")}
          className={`flex flex-col items-center py-1 px-2 rounded-md ${
            activeTab === "map" ? "text-blue-600 font-bold bg-blue-50" : "text-slate-600"
          }`}
        >
          <span className="text-xs">Map</span>
        </button>
        <button
          onClick={() => setActiveTab("citizen-dash")}
          className={`flex flex-col items-center py-1 px-2 rounded-md ${
            activeTab === "citizen-dash" ? "text-blue-600 font-bold bg-blue-50" : "text-slate-600"
          }`}
        >
          <span className="text-xs">Citizen</span>
        </button>
        <button
          onClick={() => setActiveTab("authority-dash")}
          className={`flex flex-col items-center py-1 px-2 rounded-md ${
            activeTab === "authority-dash" ? "text-blue-600 font-bold bg-blue-50" : "text-slate-600"
          }`}
        >
          <span className="text-xs">Operations</span>
        </button>
      </div>
    </header>
  );
};

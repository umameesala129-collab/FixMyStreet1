import React, { useState, useRef, useEffect } from "react";
import { User, CivicNotification, Issue } from "../types";
import {
  MapPin,
  PlusCircle,
  LayoutDashboard,
  Shield,
  User as UserIcon,
  RotateCcw,
  BookOpen,
  Map as MapIcon,
  Bell,
  ChevronDown,
  Sparkles,
  Building2,
  Compass,
  LogOut,
  CheckCircle2,
  FileText,
  UserRound,
  LogIn
} from "lucide-react";

interface NavbarProps {
  activeTab: "home" | "report" | "map" | "citizen-dash" | "authority-dash" | "issue-detail" | "login";
  setActiveTab: (tab: "home" | "report" | "map" | "citizen-dash" | "authority-dash" | "login") => void;
  currentUser: User;
  isAuthenticated?: boolean;
  issues?: Issue[];
  unreadNotificationsCount?: number;
  onOpenNotifications: () => void;
  onOpenAuthModal?: () => void;
  onOpenAuthPage?: (role?: "citizen" | "authority", view?: "choose-role" | "citizen-login" | "authority-login" | "citizen-register" | "authority-register") => void;
  onLogout?: () => void;
  onOpenNearbyIssues?: () => void;
  onResetDemoData: () => void;
  onOpenDemoGuide: () => void;
  id?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  isAuthenticated = true,
  issues = [],
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenAuthModal,
  onOpenAuthPage,
  onLogout,
  onOpenNearbyIssues,
  onResetDemoData,
  onOpenDemoGuide,
  id
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute stats for profile dropdown (Section 23)
  const safeIssues = Array.isArray(issues) ? issues : [];
  const citizenMyReports = safeIssues.length;
  const citizenResolvedReports = safeIssues.filter(
    (i) => i && (i.status === "RESOLVED" || i.status === "CITIZEN_VERIFIED")
  ).length;

  const authorityDeptIssues = safeIssues.filter(
    (i) => i && (!currentUser.department || i.department === currentUser.department)
  ).length;

  return (
    <header id={id || "app-navbar"} className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs font-sans">
      {/* Top Utility Bar: City Status, Role Switcher, Demo Actions */}
      <div className="bg-slate-50 border-b border-slate-200/70 text-xs px-4 sm:px-8 py-1.5">
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

          <div className="flex items-center gap-2.5">
            {/* User Profile Pill & Dropdown (Section 23 & 25) */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  id="navbar-role-auth-btn"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
                  title="View profile & account options"
                >
                  {currentUser.role === "authority" ? (
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>{currentUser.name} ({currentUser.role === "authority" ? "Authority" : "Citizen"})</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Lightweight Account Profile Dropdown (Section 23) */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Identity Details */}
                    <div className="px-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            currentUser.role === "authority"
                              ? "bg-slate-900 text-white"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          {currentUser.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</h4>
                          <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                          <span
                            className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md mt-1 ${
                              currentUser.role === "authority"
                                ? "bg-slate-100 text-slate-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {currentUser.role === "authority" ? "Municipal Authority" : "Registered Citizen"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Role-Specific Stats Display (Section 23) */}
                    <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 text-[11px]">
                      {currentUser.role === "citizen" ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Locality:</span>
                            <span className="font-semibold text-slate-800">{currentUser.ward || "Indiranagar, Ward 112"}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span>My Reports:</span>
                            <span className="font-semibold text-blue-600 font-mono">{citizenMyReports}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Resolved Reports:</span>
                            <span className="font-semibold text-emerald-600 font-mono">{citizenResolvedReports}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Department:</span>
                            <span className="font-semibold text-slate-800">{currentUser.department || "Roads Department"}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Jurisdiction:</span>
                            <span className="font-semibold text-slate-800">{currentUser.ward || "Central Zone"}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Assigned Issues:</span>
                            <span className="font-semibold text-blue-600 font-mono">{authorityDeptIssues}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Portal Switcher */}
                    <div className="p-2 border-b border-slate-100 space-y-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          if (onOpenAuthPage) {
                            onOpenAuthPage(currentUser.role === "authority" ? "citizen" : "authority", "choose-role");
                          } else if (onOpenAuthModal) {
                            onOpenAuthModal();
                          }
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <UserRound className="w-3.5 h-3.5 text-slate-400" />
                        <span>Switch Portal / Log In as Another Role</span>
                      </button>
                    </div>

                    {/* Logout Button (Section 25) */}
                    <div className="p-2">
                      <button
                        id="navbar-logout-btn"
                        onClick={() => {
                          setIsProfileOpen(false);
                          if (onLogout) {
                            onLogout();
                          }
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="navbar-login-btn"
                onClick={() => {
                  if (onOpenAuthPage) {
                    onOpenAuthPage(undefined, "choose-role");
                  } else {
                    setActiveTab("login");
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Demo Guide */}
            <button
              id="demo-guide-btn"
              onClick={onOpenDemoGuide}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1 rounded-lg border border-blue-200/70 transition-colors cursor-pointer"
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
              className="text-xs font-medium text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 px-1.5 py-1 transition-colors cursor-pointer"
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
                  Civic Tech MVP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-0.5">
                Public Infrastructure Reporting &amp; Verification
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              id="nav-home-btn"
              onClick={() => setActiveTab("home")}
              className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === "home"
                  ? "bg-slate-100 text-slate-900 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Overview
            </button>

            <button
              id="nav-map-btn"
              onClick={() => setActiveTab("map")}
              className={`text-xs font-semibold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "map"
                  ? "bg-slate-100 text-slate-900 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Public Issue Map</span>
            </button>

            {/* Role-specific Nav Item */}
            {currentUser.role === "citizen" ? (
              <>
                <button
                  id="nav-citizen-dash-btn"
                  onClick={() => setActiveTab("citizen-dash")}
                  className={`text-xs font-semibold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === "citizen-dash"
                      ? "bg-slate-100 text-slate-900 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                  <span>My Reports</span>
                </button>

                {onOpenNearbyIssues && (
                  <button
                    id="nav-nearby-issues-btn"
                    onClick={onOpenNearbyIssues}
                    className="text-xs font-semibold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-slate-500" />
                    <span>Nearby Issues</span>
                  </button>
                )}
              </>
            ) : (
              <button
                id="nav-authority-dash-btn"
                onClick={() => setActiveTab("authority-dash")}
                className={`text-xs font-semibold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "authority-dash"
                    ? "bg-slate-100 text-slate-900 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span>Authority Control Center</span>
              </button>
            )}
          </nav>

          {/* Action CTAs: Notification Bell & Report Button */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              id="nav-notification-bell-btn"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Civic notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center font-mono animate-pulse">
                  {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Report an Issue CTA */}
            <button
              id="nav-report-issue-btn"
              onClick={() => setActiveTab("report")}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 active:scale-98 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Report an Issue</span>
              <span className="sm:hidden">Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Nav */}
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
        {currentUser.role === "citizen" ? (
          <button
            onClick={() => setActiveTab("citizen-dash")}
            className={`flex flex-col items-center py-1 px-2 rounded-md ${
              activeTab === "citizen-dash" ? "text-blue-600 font-bold bg-blue-50" : "text-slate-600"
            }`}
          >
            <span className="text-xs">Citizen</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveTab("authority-dash")}
            className={`flex flex-col items-center py-1 px-2 rounded-md ${
              activeTab === "authority-dash" ? "text-blue-600 font-bold bg-blue-50" : "text-slate-600"
            }`}
          >
            <span className="text-xs">Authority</span>
          </button>
        )}
      </div>
    </header>
  );
};

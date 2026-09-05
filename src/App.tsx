import React, { useState, useEffect } from "react";
import { Issue, User } from "./types";
import {
  getStoredIssues,
  getActiveUser,
  setActiveUser,
  resetDemoData,
  DEFAULT_CITIZEN_USER,
  DEFAULT_AUTHORITY_USER,
  recordCitizenVerification
} from "./services/storage";
import { Navbar } from "./components/Navbar";
import { LandingPage } from "./pages/LandingPage";
import { ReportIssuePage } from "./pages/ReportIssuePage";
import { PublicMapPage } from "./pages/PublicMapPage";
import { CitizenDashboard } from "./pages/CitizenDashboard";
import { AuthorityDashboard } from "./pages/AuthorityDashboard";
import { IssueDetailPage } from "./pages/IssueDetailPage";
import { ResolutionVerificationModal } from "./components/ResolutionVerificationModal";
import { DemoScenarioGuide } from "./components/DemoScenarioGuide";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "home" | "report" | "map" | "citizen-dash" | "authority-dash" | "issue-detail"
  >("home");
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [issues, setIssues] = useState<Issue[]>(getStoredIssues());
  const [currentUser, setCurrentUserState] = useState<User>(getActiveUser());
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState<boolean>(false);
  const [verifyingIssue, setVerifyingIssue] = useState<Issue | null>(null);

  // Sync state on storage updates
  useEffect(() => {
    const handleStorageChange = () => {
      setIssues(getStoredIssues());
    };
    const handleUserChange = () => {
      setCurrentUserState(getActiveUser());
    };

    window.addEventListener("fixmystreet_storage_change", handleStorageChange);
    window.addEventListener("fixmystreet_user_change", handleUserChange);

    return () => {
      window.removeEventListener("fixmystreet_storage_change", handleStorageChange);
      window.removeEventListener("fixmystreet_user_change", handleUserChange);
    };
  }, []);

  // Switch role helper
  const handleSwitchRole = (role: "citizen" | "authority") => {
    const newUser = role === "citizen" ? DEFAULT_CITIZEN_USER : DEFAULT_AUTHORITY_USER;
    setActiveUser(newUser);
    setCurrentUserState(newUser);
    if (role === "authority" && activeTab === "citizen-dash") {
      setActiveTab("authority-dash");
    } else if (role === "citizen" && activeTab === "authority-dash") {
      setActiveTab("citizen-dash");
    }
  };

  // Open specific issue detail
  const handleSelectIssue = (id: string) => {
    setSelectedIssueId(id);
    setActiveTab("issue-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Triggered when a new complaint is reported
  const handleReportSuccess = (newIssueId: string) => {
    setSelectedIssueId(newIssueId);
    setActiveTab("issue-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Find active selected issue
  const activeIssue = selectedIssueId
    ? issues.find((i) => i.id.toUpperCase() === selectedIssueId.toUpperCase()) || issues[0]
    : issues[0];

  // 21-Step Demo Scenario automated jump handler
  const handleDemoStepAction = (stepNum: number) => {
    if (stepNum === 1) {
      handleSwitchRole("citizen");
      setActiveTab("citizen-dash");
    } else if (stepNum >= 2 && stepNum <= 8) {
      handleSwitchRole("citizen");
      setActiveTab("report");
    } else if (stepNum >= 9 && stepNum <= 10) {
      handleSwitchRole("citizen");
      setSelectedIssueId("FM-1042");
      setActiveTab("issue-detail");
    } else if (stepNum === 11) {
      handleSwitchRole("authority");
      setActiveTab("authority-dash");
    } else if (stepNum >= 12 && stepNum <= 16) {
      handleSwitchRole("authority");
      setSelectedIssueId("FM-1042");
      setActiveTab("issue-detail");
    } else if (stepNum === 17) {
      handleSwitchRole("citizen");
      setActiveTab("citizen-dash");
    } else if (stepNum >= 18 && stepNum <= 20) {
      handleSwitchRole("citizen");
      const target = issues.find((i) => i.id === "FM-1004") || issues.find((i) => i.status === "RESOLVED");
      if (target) {
        setVerifyingIssue(target);
      } else {
        setSelectedIssueId("FM-1042");
        setActiveTab("issue-detail");
      }
    } else if (stepNum === 21) {
      setActiveTab("map");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#0f172a] font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation Header */}
      <Navbar
        id="app-navbar"
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onResetDemoData={resetDemoData}
        onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
      />

      {/* Main Screen Router */}
      <main className="flex-1">
        {activeTab === "home" && (
          <LandingPage
            id="landing-page"
            issues={issues}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onSelectIssue={handleSelectIssue}
          />
        )}

        {activeTab === "report" && (
          <ReportIssuePage
            id="report-page"
            onSuccess={handleReportSuccess}
            onCancel={() => setActiveTab("home")}
          />
        )}

        {activeTab === "map" && (
          <PublicMapPage
            id="public-map-page"
            issues={issues}
            onSelectIssue={handleSelectIssue}
          />
        )}

        {activeTab === "citizen-dash" && (
          <CitizenDashboard
            id="citizen-dashboard"
            issues={issues}
            onSelectIssue={handleSelectIssue}
            onOpenReport={() => setActiveTab("report")}
            onOpenVerificationModal={(issue) => setVerifyingIssue(issue)}
          />
        )}

        {activeTab === "authority-dash" && (
          <AuthorityDashboard
            id="authority-dashboard"
            issues={issues}
            onSelectIssue={handleSelectIssue}
            onUpdateStatus={() => setIssues(getStoredIssues())}
          />
        )}

        {activeTab === "issue-detail" && activeIssue && (
          <IssueDetailPage
            id="issue-detail-page"
            issue={activeIssue}
            currentUser={currentUser}
            onBack={() => {
              setActiveTab(currentUser.role === "authority" ? "authority-dash" : "citizen-dash");
            }}
            onIssueUpdated={(updated) => {
              setSelectedIssueId(updated.id);
              setIssues(getStoredIssues());
            }}
          />
        )}
      </main>

      {/* Citizen Verification Modal (Feature 4) */}
      {verifyingIssue && (
        <ResolutionVerificationModal
          id="verification-modal"
          isOpen={!!verifyingIssue}
          issue={verifyingIssue}
          onClose={() => setVerifyingIssue(null)}
          onVerify={(isFixed, comment) => {
            recordCitizenVerification(verifyingIssue.id, isFixed, comment);
            setIssues(getStoredIssues());
            setVerifyingIssue(null);
          }}
        />
      )}

      {/* 21-Step Demo Scenario Guide Drawer */}
      <DemoScenarioGuide
        id="demo-scenario-guide"
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onTriggerStepAction={handleDemoStepAction}
      />
    </div>
  );
}

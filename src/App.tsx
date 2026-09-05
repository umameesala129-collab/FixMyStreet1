import React, { useState, useEffect } from "react";
import { Issue, User, CivicNotification } from "./types";
import {
  getStoredIssues,
  getActiveUser,
  setActiveUser,
  resetDemoData,
  getStoredNotifications,
  markNotificationAsRead,
  DEFAULT_CITIZEN_USER,
  DEFAULT_AUTHORITY_USER,
  recordCitizenVerification,
  isUserAuthenticated,
  logoutUser
} from "./services/storage";
import { Navbar } from "./components/Navbar";
import { AuthModal } from "./components/AuthModal";
import { NotificationCenter } from "./components/NotificationCenter";
import { NearbyIssues } from "./components/NearbyIssues";
import { LandingPage } from "./pages/LandingPage";
import { ReportIssuePage } from "./pages/ReportIssuePage";
import { PublicMapPage } from "./pages/PublicMapPage";
import { CitizenDashboard } from "./pages/CitizenDashboard";
import { AuthorityDashboard } from "./pages/AuthorityDashboard";
import { IssueDetailPage } from "./pages/IssueDetailPage";
import { AuthPage, AuthView } from "./pages/AuthPage";
import { ResolutionVerificationModal } from "./components/ResolutionVerificationModal";
import { DemoScenarioGuide } from "./components/DemoScenarioGuide";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "home" | "report" | "map" | "citizen-dash" | "authority-dash" | "issue-detail" | "login"
  >("home");
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [issues, setIssues] = useState<Issue[]>(getStoredIssues());
  const [currentUser, setCurrentUserState] = useState<User>(getActiveUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isUserAuthenticated());
  const [notifications, setNotifications] = useState<CivicNotification[]>(getStoredNotifications());

  // Auth Page state
  const [authView, setAuthView] = useState<AuthView>("choose-role");
  const [authInitialRole, setAuthInitialRole] = useState<"citizen" | "authority" | undefined>(undefined);

  // Modals & Drawers state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isNearbyOpen, setIsNearbyOpen] = useState<boolean>(false);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState<boolean>(false);
  const [verifyingIssue, setVerifyingIssue] = useState<Issue | null>(null);

  // Sync state on storage & notification updates
  useEffect(() => {
    const handleStorageChange = () => {
      setIssues(getStoredIssues());
    };
    const handleUserChange = () => {
      setCurrentUserState(getActiveUser());
    };
    const handleNotificationChange = () => {
      setNotifications(getStoredNotifications());
    };
    const handleAuthChange = () => {
      setIsAuthenticated(isUserAuthenticated());
      setCurrentUserState(getActiveUser());
    };

    window.addEventListener("fixmystreet_storage_change", handleStorageChange);
    window.addEventListener("fixmystreet_user_change", handleUserChange);
    window.addEventListener("fixmystreet_notification_change", handleNotificationChange);
    window.addEventListener("fixmystreet_auth_change", handleAuthChange);

    return () => {
      window.removeEventListener("fixmystreet_storage_change", handleStorageChange);
      window.removeEventListener("fixmystreet_user_change", handleUserChange);
      window.removeEventListener("fixmystreet_notification_change", handleNotificationChange);
      window.removeEventListener("fixmystreet_auth_change", handleAuthChange);
    };
  }, []);

  // Open Full Auth Page (Section 1 & 24)
  const handleOpenAuthPage = (
    role?: "citizen" | "authority",
    view?: AuthView
  ) => {
    setAuthInitialRole(role);
    setAuthView(view || (role ? (role === "authority" ? "authority-login" : "citizen-login") : "choose-role"));
    setActiveTab("login");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle successful login or registration (Section 9)
  const handleAuthSuccess = (user: User) => {
    setActiveUser(user);
    setCurrentUserState(user);
    setIsAuthenticated(true);
    if (user.role === "authority") {
      setActiveTab("authority-dash");
    } else {
      setActiveTab("citizen-dash");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle User Logout (Section 25)
  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
    setActiveTab("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Role Selection from AuthModal
  const handleSelectRole = (role: "citizen" | "authority") => {
    const newUser = role === "citizen" ? DEFAULT_CITIZEN_USER : DEFAULT_AUTHORITY_USER;
    setActiveUser(newUser);
    setCurrentUserState(newUser);
    if (role === "authority") {
      setActiveTab("authority-dash");
    } else {
      setActiveTab("citizen-dash");
    }
  };

  // Open specific issue detail
  const handleSelectIssue = (id: string) => {
    setSelectedIssueId(id);
    setActiveTab("issue-detail");
    setIsNotificationsOpen(false);
    setIsNearbyOpen(false);
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

  // Unread notifications for current role
  const unreadCount = (Array.isArray(notifications) ? notifications : []).filter(
    (n) => n && !n.isRead && (n.recipientRole === "all" || n.recipientRole === currentUser?.role)
  ).length;

  // 21-Step Demo Scenario automated jump handler
  const handleDemoStepAction = (stepNum: number) => {
    if (stepNum === 1) {
      handleSelectRole("citizen");
      setActiveTab("citizen-dash");
    } else if (stepNum >= 2 && stepNum <= 8) {
      handleSelectRole("citizen");
      setActiveTab("report");
    } else if (stepNum >= 9 && stepNum <= 10) {
      handleSelectRole("citizen");
      setSelectedIssueId("FM-1042");
      setActiveTab("issue-detail");
    } else if (stepNum === 11) {
      handleSelectRole("authority");
      setActiveTab("authority-dash");
    } else if (stepNum >= 12 && stepNum <= 16) {
      handleSelectRole("authority");
      setSelectedIssueId("FM-1042");
      setActiveTab("issue-detail");
    } else if (stepNum === 17) {
      handleSelectRole("citizen");
      setActiveTab("citizen-dash");
    } else if (stepNum >= 18 && stepNum <= 20) {
      handleSelectRole("citizen");
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation Header - Hidden during full-screen auth page per Sections 2 & 12 */}
      {activeTab !== "login" && (
        <Navbar
          id="app-navbar"
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          currentUser={currentUser}
          isAuthenticated={isAuthenticated}
          issues={issues}
          unreadNotificationsCount={unreadCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenAuthPage={handleOpenAuthPage}
          onLogout={handleLogout}
          onOpenNearbyIssues={() => setIsNearbyOpen(true)}
          onResetDemoData={resetDemoData}
          onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
        />
      )}

      {/* Main Screen Router */}
      <main className="flex-1">
        {activeTab === "login" && (
          <AuthPage
            id="auth-portal-page"
            initialView={authView}
            initialRole={authInitialRole}
            onSuccess={handleAuthSuccess}
            onBackToHome={() => {
              setActiveTab("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {activeTab === "home" && (
          <LandingPage
            id="landing-page"
            issues={issues}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onSelectIssue={handleSelectIssue}
            onOpenAuthModal={(role) => handleSelectRole(role || "citizen")}
            onOpenAuthPage={handleOpenAuthPage}
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
            currentUser={currentUser}
            onSelectIssue={handleSelectIssue}
            onOpenReport={() => setActiveTab("report")}
            onOpenVerificationModal={(issue) => setVerifyingIssue(issue)}
            onOpenNearby={() => setIsNearbyOpen(true)}
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

      {/* Auth / Role Switch Modal */}
      <AuthModal
        id="auth-role-modal"
        isOpen={isAuthModalOpen}
        currentUser={currentUser}
        currentUserRole={currentUser.role}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={(user) => {
          setActiveUser(user);
          setCurrentUserState(user);
          if (user.role === "authority") {
            setActiveTab("authority-dash");
          } else {
            setActiveTab("citizen-dash");
          }
          setIsAuthModalOpen(false);
        }}
        onSelectRole={handleSelectRole}
      />

      {/* Notification Center Drawer */}
      <NotificationCenter
        id="notification-center-drawer"
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        currentUserRole={currentUser.role}
        onSelectIssue={handleSelectIssue}
      />

      {/* Nearby Issues Radar Modal */}
      {isNearbyOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <NearbyIssues
              issues={issues}
              onSelectIssue={handleSelectIssue}
              onClose={() => setIsNearbyOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Citizen Verification Modal */}
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

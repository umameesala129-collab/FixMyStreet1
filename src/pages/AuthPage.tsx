import React, { useState } from "react";
import { User, DepartmentType } from "../types";
import {
  authenticateUser,
  registerUserAccount,
  DEMO_CITIZEN_CREDENTIALS,
  DEMO_AUTHORITY_CREDENTIALS
} from "../services/storage";
import {
  MapPin,
  ArrowRight,
  ArrowLeft,
  User as UserIcon,
  UserRound,
  Building2,
  Landmark,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Shield,
  Compass,
  Layers,
  Sparkles,
  HelpCircle,
  X
} from "lucide-react";

export type AuthView = "choose-role" | "citizen-login" | "authority-login" | "citizen-register" | "authority-register";

interface AuthPageProps {
  initialView?: AuthView;
  initialRole?: "citizen" | "authority";
  onSuccess: (user: User) => void;
  onBackToHome: () => void;
  id?: string;
}

const AUTHORITY_DEPARTMENTS: { label: string; value: DepartmentType }[] = [
  { label: "Roads", value: "Roads Department" },
  { label: "Sanitation", value: "Sanitation Department" },
  { label: "Drainage", value: "Drainage Department" },
  { label: "Water", value: "Water Department" },
  { label: "Electrical", value: "Electrical Department" },
  { label: "Public Works", value: "Public Works Department" },
  { label: "General Maintenance", value: "General Maintenance" }
];

export const AuthPage: React.FC<AuthPageProps> = ({
  initialView = "choose-role",
  initialRole,
  onSuccess,
  onBackToHome,
  id = "auth-page"
}) => {
  // Determine starting view based on props
  const getStartingView = (): AuthView => {
    if (initialView && initialView !== "choose-role") return initialView as AuthView;
    if (initialRole === "authority") return "authority-login";
    if (initialRole === "citizen") return "citizen-login";
    return "choose-role";
  };

  const [currentView, setCurrentView] = useState<AuthView>(getStartingView);

  // Form Fields
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [locality, setLocality] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentType>("Roads Department");

  // UI States
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>("");
  const [forgotSent, setForgotSent] = useState<boolean>(false);

  // Validation Rules
  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const getEmailError = (): string | null => {
    if (!touched.email && !isSubmitting) return null;
    if (!email.trim()) return "Please enter your email address.";
    if (!isValidEmail(email)) return "Enter a valid email address.";
    return null;
  };

  const getPasswordError = (): string | null => {
    if (!touched.password && !isSubmitting) return null;
    if (!password) return "Please enter your password.";
    if (password.length < 8) return "Password must contain at least 8 characters.";
    return null;
  };

  const getConfirmPasswordError = (): string | null => {
    if (!touched.confirmPassword && !isSubmitting) return null;
    if (!confirmPassword) return "Please confirm your password.";
    if (confirmPassword !== password) return "Passwords do not match.";
    return null;
  };

  const getNameError = (): string | null => {
    if (!touched.fullName && !isSubmitting) return null;
    if (!fullName.trim()) return "Please enter your full name.";
    if (fullName.trim().length < 2) return "Name must be at least 2 characters.";
    return null;
  };

  const markAllTouched = (fields: string[]) => {
    const updated: Record<string, boolean> = { ...touched };
    fields.forEach((f) => (updated[f] = true));
    setTouched(updated);
  };

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setLocality("");
    setTouched({});
    setStatusMessage(null);
  };

  const switchView = (newView: AuthView) => {
    clearForm();
    setCurrentView(newView);
  };

  // Quick Demo Auto-fill Helper
  const fillDemoCredentials = (role: "citizen" | "authority") => {
    setStatusMessage(null);
    if (role === "citizen") {
      setEmail(DEMO_CITIZEN_CREDENTIALS.email);
      setPassword(DEMO_CITIZEN_CREDENTIALS.password);
      setTouched({ email: true, password: true });
    } else {
      setEmail(DEMO_AUTHORITY_CREDENTIALS.email);
      setPassword(DEMO_AUTHORITY_CREDENTIALS.password);
      setTouched({ email: true, password: true });
    }
  };

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent, role: "citizen" | "authority") => {
    e.preventDefault();
    markAllTouched(["email", "password"]);
    setStatusMessage(null);

    const emailErr = !email.trim() ? "Please enter your email address." : !isValidEmail(email) ? "Enter a valid email address." : null;
    const passErr = !password ? "Please enter your password." : password.length < 8 ? "Password must contain at least 8 characters." : null;

    if (emailErr || passErr) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ type: "info", text: "Signing you in..." });

    // Simulated short verification delay for realism
    setTimeout(() => {
      const result = authenticateUser(email, password, role);
      if (result.success && result.user) {
        setStatusMessage({
          type: "success",
          text: "Welcome back. Redirecting to your dashboard..."
        });
        setTimeout(() => {
          onSuccess(result.user!);
        }, 600);
      } else {
        setIsSubmitting(false);
        setStatusMessage({
          type: "error",
          text: result.error || "Email or password is incorrect."
        });
      }
    }, 450);
  };

  // Handle Registration submission
  const handleRegisterSubmit = (e: React.FormEvent, role: "citizen" | "authority") => {
    e.preventDefault();
    markAllTouched(["fullName", "email", "password", "confirmPassword"]);
    setStatusMessage(null);

    const nameErr = !fullName.trim() ? "Please enter your full name." : fullName.trim().length < 2 ? "Name must be at least 2 characters." : null;
    const emailErr = !email.trim() ? "Please enter your email address." : !isValidEmail(email) ? "Enter a valid email address." : null;
    const passErr = !password ? "Please enter your password." : password.length < 8 ? "Password must contain at least 8 characters." : null;
    const confirmErr = !confirmPassword ? "Please confirm your password." : confirmPassword !== password ? "Passwords do not match." : null;

    if (nameErr || emailErr || passErr || confirmErr) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ type: "info", text: "Creating your account..." });

    setTimeout(() => {
      const result = registerUserAccount({
        name: fullName,
        email,
        password,
        role,
        department: role === "authority" ? selectedDepartment : undefined,
        ward: locality.trim() || undefined
      });

      if (result.success && result.user) {
        setStatusMessage({
          type: "success",
          text: "Account created successfully."
        });
        setTimeout(() => {
          onSuccess(result.user!);
        }, 600);
      } else {
        setIsSubmitting(false);
        setStatusMessage({
          type: "error",
          text: result.error || "Unable to create your account. Please try again."
        });
      }
    }, 550);
  };

  return (
    <div id={id} className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header - Focused & uncluttered per Section 12 */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div
          onClick={onBackToHome}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:bg-blue-700 transition-colors">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-slate-900 tracking-tight font-display">
                FixMyStreet
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200/60">
                Civic Access
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block -mt-0.5">
              Public Infrastructure Portal
            </p>
          </div>
        </div>

        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* Main Two-Column Auth Viewport */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 items-stretch justify-center gap-6 lg:gap-10">
        {/* Left Side: FixMyStreet Brand & Subtle Civic-City Infrastructure Visual (Sections 2, 13, 14, 15) */}
        <div className="w-full lg:w-5/12 bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border border-slate-800 shadow-xl min-h-[360px] lg:min-h-[580px]">
          {/* Low-Contrast Subtle SVG Smart City Infrastructure Canvas */}
          <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
            <svg
              className="w-full h-full object-cover"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 600 800"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#60a5fa" strokeWidth="0.5" strokeOpacity="0.4" />
                </pattern>
                <linearGradient id="contour-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              <rect width="100%" height="100%" fill="url(#grid-pattern)" />

              {/* Road Network Patterns */}
              <path d="M-50 180 Q 250 140 650 220" fill="none" stroke="#93c5fd" strokeWidth="2.5" strokeDasharray="6,4" />
              <path d="M120 -50 Q 180 350 260 850" fill="none" stroke="#93c5fd" strokeWidth="3" />
              <path d="M420 -50 Q 380 400 480 850" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="8,6" />
              <path d="M-50 480 Q 300 420 650 560" fill="none" stroke="#60a5fa" strokeWidth="2.5" />
              <path d="M-50 680 Q 320 620 650 720" fill="none" stroke="#3b82f6" strokeWidth="1.5" />

              {/* Street Intersection Nodes */}
              <circle cx="150" cy="170" r="4" fill="#60a5fa" />
              <circle cx="210" cy="450" r="5" fill="#93c5fd" />
              <circle cx="430" cy="500" r="4" fill="#60a5fa" />
              <circle cx="400" cy="200" r="4" fill="#93c5fd" />

              {/* Geographic Contours */}
              <path d="M 50 300 C 150 280, 250 340, 350 310 C 450 280, 520 330, 600 320" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />
              <path d="M 50 340 C 180 320, 270 380, 380 350 C 470 320, 540 370, 600 360" fill="none" stroke="#38bdf8" strokeWidth="0.75" opacity="0.3" />

              {/* Subtle City Skyline Silhouette Base */}
              <path
                d="M 0 800 L 0 740 L 40 740 L 40 710 L 80 710 L 80 735 L 130 735 L 130 690 L 170 690 L 170 745 L 220 745 L 220 670 L 260 670 L 260 740 L 320 740 L 320 705 L 360 705 L 360 730 L 410 730 L 410 680 L 460 680 L 460 750 L 520 750 L 520 715 L 560 715 L 560 740 L 600 740 L 600 800 Z"
                fill="#1e293b"
                opacity="0.7"
              />
            </svg>
          </div>

          {/* Atmospheric Gradient Wash */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/50 to-slate-950/90 pointer-events-none" />

          {/* Top Branding Section */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/25 text-blue-300 text-[11px] font-semibold mb-6 backdrop-blur-xs">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Civic Technology Infrastructure</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-white">
              FIXMYSTREET
            </h1>
            <p className="text-blue-400 font-semibold text-base sm:text-lg mt-1 tracking-tight">
              Report. Track. Resolve.
            </p>
          </div>

          {/* Middle Supporting Message */}
          <div className="relative z-10 my-8">
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-sm">
              Make your neighborhood better by reporting civic issues and following them through resolution.
            </p>

            {/* Civic Value Highlights */}
            <div className="mt-6 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Public GPS-tagged transparency across municipal wards</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <span>Direct dispatch to responsible civic engineering crews</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span>Citizen-verified completion before tickets are officially closed</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust & Accountability Badge */}
          <div className="relative z-10 pt-6 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>FixMyStreet Open Civic Network</span>
            <span className="text-slate-500 font-mono">v2.4 &bull; Student MVP</span>
          </div>
        </div>

        {/* Right Side: Professional Authentication Card (Sections 2, 16) */}
        <div className="w-full lg:w-7/12 flex items-center justify-center">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-9 shadow-sm w-full max-w-lg transition-all">
            {/* View 1: Role Selection (Section 3) */}
            {currentView === "choose-role" && (
              <div>
                <div className="mb-6 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-slate-900 font-display tracking-tight">
                    Welcome to FixMyStreet
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Choose how you'd like to continue
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* CITIZEN CARD */}
                  <div className="border border-slate-200 hover:border-blue-400 rounded-2xl p-5 bg-white hover:bg-blue-50/20 transition-all group relative">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                        <UserRound className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-slate-900">Citizen</h3>
                          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            Public Portal
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Report local problems, track complaints, and verify resolutions.
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          <button
                            id="choose-continue-citizen-btn"
                            onClick={() => switchView("citizen-login")}
                            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                          >
                            <span>Continue as Citizen</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AUTHORITY CARD */}
                  <div className="border border-slate-200 hover:border-slate-400 rounded-2xl p-5 bg-white hover:bg-slate-50/50 transition-all group relative">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200 group-hover:scale-105 transition-transform">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-slate-900">Authority</h3>
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            Official Operations
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Manage reports, prioritize issues, and coordinate resolutions.
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          <button
                            id="choose-continue-authority-btn"
                            onClick={() => switchView("authority-login")}
                            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                          >
                            <span>Continue as Authority</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Info Footer */}
                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Need to browse first?</span>
                  <button
                    onClick={onBackToHome}
                    className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 cursor-pointer"
                  >
                    View Public Overview
                  </button>
                </div>
              </div>
            )}

            {/* View 2: Citizen Login (Section 4) */}
            {currentView === "citizen-login" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Citizen Access</span>
                    <h2 className="text-2xl font-bold text-slate-900 font-display tracking-tight">
                      Welcome back
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sign in to report and track civic issues.
                    </p>
                  </div>
                  <button
                    onClick={() => switchView("choose-role")}
                    className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer p-1"
                    title="Change portal"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change role</span>
                  </button>
                </div>

                {/* Presentation Demo Account Pill (Section 10) */}
                <div className="mb-5 p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-600">
                    <span className="font-bold text-blue-900 block">Demo account for presentation</span>
                    <code className="text-[10px] text-slate-500 font-mono">demo.citizen@example.com</code>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials("citizen")}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-white px-2.5 py-1 rounded-md border border-blue-200 shadow-2xs hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
                  >
                    Fill Demo
                  </button>
                </div>

                {/* Feedback status notification */}
                {statusMessage && (
                  <div
                    className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                      statusMessage.type === "error"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : statusMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {statusMessage.type === "error" ? (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    )}
                    <span>{statusMessage.text}</span>
                  </div>
                )}

                <form onSubmit={(e) => handleLoginSubmit(e, "citizen")} className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="citizen-login-email" className="block text-xs font-semibold text-slate-700 mb-1">
                      Email address
                    </label>
                    <input
                      id="citizen-login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched({ ...touched, email: true })}
                      placeholder="e.g. name@example.com"
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                        getEmailError()
                          ? "border-rose-400 focus:ring-rose-200"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                      }`}
                    />
                    {getEmailError() && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{getEmailError()}</p>
                    )}
                  </div>

                  {/* Password Field (Section 8) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="citizen-login-password" className="block text-xs font-semibold text-slate-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email);
                          setForgotSent(false);
                          setIsForgotModalOpen(true);
                        }}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="citizen-login-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setTouched({ ...touched, password: true })}
                        placeholder="Enter your account password"
                        className={`w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                          getPasswordError()
                            ? "border-rose-400 focus:ring-rose-200"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {getPasswordError() && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{getPasswordError()}</p>
                    )}
                  </div>

                  {/* Submit Button (Section 4, 18) */}
                  <div className="pt-2 space-y-2.5">
                    <button
                      id="citizen-login-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>{isSubmitting ? "Signing you in..." : "Sign In"}</span>
                    </button>

                    <button
                      id="citizen-login-create-account-btn"
                      type="button"
                      onClick={() => switchView("citizen-register")}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
                    >
                      Create Citizen Account
                    </button>
                  </div>
                </form>

                {/* Switch to Authority portal */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Are you a municipal official?</span>
                  <button
                    onClick={() => switchView("authority-login")}
                    className="font-semibold text-slate-800 hover:text-blue-600 cursor-pointer"
                  >
                    Authority Sign In
                  </button>
                </div>
              </div>
            )}

            {/* View 3: Authority Login (Section 5) */}
            {currentView === "authority-login" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Authority Control</span>
                    <h2 className="text-2xl font-bold text-slate-900 font-display tracking-tight">
                      Authority Sign In
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Access the civic issue management dashboard.
                    </p>
                  </div>
                  <button
                    onClick={() => switchView("choose-role")}
                    className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer p-1"
                    title="Change portal"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change role</span>
                  </button>
                </div>

                {/* Presentation Demo Account Pill (Section 10) */}
                <div className="mb-5 p-3 rounded-xl bg-slate-100/70 border border-slate-200 flex items-center justify-between">
                  <div className="text-[11px] text-slate-600">
                    <span className="font-bold text-slate-900 block">Demo account for presentation</span>
                    <code className="text-[10px] text-slate-500 font-mono">demo.authority@example.com</code>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials("authority")}
                    className="text-[11px] font-semibold text-slate-800 hover:text-slate-950 bg-white px-2.5 py-1 rounded-md border border-slate-300 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
                  >
                    Fill Demo
                  </button>
                </div>

                {/* Feedback status notification */}
                {statusMessage && (
                  <div
                    className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                      statusMessage.type === "error"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : statusMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {statusMessage.type === "error" ? (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    )}
                    <span>{statusMessage.text}</span>
                  </div>
                )}

                <form onSubmit={(e) => handleLoginSubmit(e, "authority")} className="space-y-4">
                  {/* Official Email */}
                  <div>
                    <label htmlFor="authority-login-email" className="block text-xs font-semibold text-slate-700 mb-1">
                      Official email
                    </label>
                    <input
                      id="authority-login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched({ ...touched, email: true })}
                      placeholder="e.g. officer@civic.gov.in"
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                        getEmailError()
                          ? "border-rose-400 focus:ring-rose-200"
                          : "border-slate-200 focus:border-slate-800 focus:ring-slate-100"
                      }`}
                    />
                    {getEmailError() && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{getEmailError()}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="authority-login-password" className="block text-xs font-semibold text-slate-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email);
                          setForgotSent(false);
                          setIsForgotModalOpen(true);
                        }}
                        className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="authority-login-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setTouched({ ...touched, password: true })}
                        placeholder="Enter your authority password"
                        className={`w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                          getPasswordError()
                            ? "border-rose-400 focus:ring-rose-200"
                            : "border-slate-200 focus:border-slate-800 focus:ring-slate-100"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {getPasswordError() && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{getPasswordError()}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 space-y-2.5">
                    <button
                      id="authority-login-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>{isSubmitting ? "Signing you in..." : "Sign In"}</span>
                    </button>

                    <button
                      id="authority-login-create-account-btn"
                      type="button"
                      onClick={() => switchView("authority-register")}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
                    >
                      Create Authority Account
                    </button>
                  </div>
                </form>

                {/* Below: Are you a citizen? (Section 5) */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Are you a citizen?</span>
                  <button
                    onClick={() => switchView("citizen-login")}
                    className="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Citizen Login
                  </button>
                </div>
              </div>
            )}

            {/* View 4: Citizen Registration (Section 6) */}
            {currentView === "citizen-register" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Citizen Registration</span>
                    <h2 className="text-2xl font-bold text-slate-900 font-display tracking-tight">
                      Create your FixMyStreet account
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Join neighbors in keeping public spaces safe and functional.
                    </p>
                  </div>
                  <button
                    onClick={() => switchView("citizen-login")}
                    className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer p-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Login</span>
                  </button>
                </div>

                {statusMessage && (
                  <div
                    className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                      statusMessage.type === "error"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : statusMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {statusMessage.type === "error" ? (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    )}
                    <span>{statusMessage.text}</span>
                  </div>
                )}

                <form onSubmit={(e) => handleRegisterSubmit(e, "citizen")} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="citizen-reg-name" className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      id="citizen-reg-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onBlur={() => setTouched({ ...touched, fullName: true })}
                      placeholder="e.g. John Doe"
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                        getNameError()
                          ? "border-rose-400 focus:ring-rose-200"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                      }`}
                    />
                    {getNameError() && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{getNameError()}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="citizen-reg-email" className="block text-xs font-semibold text-slate-700 mb-1">
                      Email address
                    </label>
                    <input
                      id="citizen-reg-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched({ ...touched, email: true })}
                      placeholder="e.g. name@example.com"
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                        getEmailError()
                          ? "border-rose-400 focus:ring-rose-200"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                      }`}
                    />
                    {getEmailError() && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{getEmailError()}</p>
                    )}
                  </div>

                  {/* Optional: Area / Locality */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="citizen-reg-locality" className="block text-xs font-semibold text-slate-700">
                        Area / Locality
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">Optional</span>
                    </div>
                    <input
                      id="citizen-reg-locality"
                      type="text"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder="e.g. Ward 112, Indiranagar"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="citizen-reg-password" className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="citizen-reg-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setTouched({ ...touched, password: true })}
                        placeholder="At least 8 characters"
                        className={`w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                          getPasswordError()
                            ? "border-rose-400 focus:ring-rose-200"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {getPasswordError() && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{getPasswordError()}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="citizen-reg-confirm" className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="citizen-reg-confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                        placeholder="Re-enter your password"
                        className={`w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                          getConfirmPasswordError()
                            ? "border-rose-400 focus:ring-rose-200"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {getConfirmPasswordError() && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{getConfirmPasswordError()}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      id="citizen-register-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>{isSubmitting ? "Creating your account..." : "Create Citizen Account"}</span>
                    </button>
                  </div>
                </form>

                {/* Switch to login */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Already have an account?</span>
                  <button
                    onClick={() => switchView("citizen-login")}
                    className="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}

            {/* View 5: Authority Registration (Section 6) */}
            {currentView === "authority-register" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Authority Access</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Demo Authority Account
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 font-display tracking-tight">
                      Create Authority Account
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      For testing municipal department dispatch workflows.
                    </p>
                  </div>
                  <button
                    onClick={() => switchView("authority-login")}
                    className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer p-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Login</span>
                  </button>
                </div>

                {statusMessage && (
                  <div
                    className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                      statusMessage.type === "error"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : statusMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {statusMessage.type === "error" ? (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    )}
                    <span>{statusMessage.text}</span>
                  </div>
                )}

                <form onSubmit={(e) => handleRegisterSubmit(e, "authority")} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="authority-reg-name" className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      id="authority-reg-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onBlur={() => setTouched({ ...touched, fullName: true })}
                      placeholder="e.g. Officer R. K. Verma"
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                        getNameError()
                          ? "border-rose-400 focus:ring-rose-200"
                          : "border-slate-200 focus:border-slate-800 focus:ring-slate-100"
                      }`}
                    />
                    {getNameError() && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{getNameError()}</p>
                    )}
                  </div>

                  {/* Official Email */}
                  <div>
                    <label htmlFor="authority-reg-email" className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Email
                    </label>
                    <input
                      id="authority-reg-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched({ ...touched, email: true })}
                      placeholder="e.g. officer@civic.gov.in"
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                        getEmailError()
                          ? "border-rose-400 focus:ring-rose-200"
                          : "border-slate-200 focus:border-slate-800 focus:ring-slate-100"
                      }`}
                    />
                    {getEmailError() && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{getEmailError()}</p>
                    )}
                  </div>

                  {/* Department Dropdown (Section 6) */}
                  <div>
                    <label htmlFor="authority-reg-department" className="block text-xs font-semibold text-slate-700 mb-1">
                      Department
                    </label>
                    <select
                      id="authority-reg-department"
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value as DepartmentType)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-100 transition-all cursor-pointer"
                    >
                      {AUTHORITY_DEPARTMENTS.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="authority-reg-password" className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="authority-reg-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setTouched({ ...touched, password: true })}
                        placeholder="At least 8 characters"
                        className={`w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                          getPasswordError()
                            ? "border-rose-400 focus:ring-rose-200"
                            : "border-slate-200 focus:border-slate-800 focus:ring-slate-100"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {getPasswordError() && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{getPasswordError()}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="authority-reg-confirm" className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="authority-reg-confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                        placeholder="Re-enter your password"
                        className={`w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                          getConfirmPasswordError()
                            ? "border-rose-400 focus:ring-rose-200"
                            : "border-slate-200 focus:border-slate-800 focus:ring-slate-100"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {getConfirmPasswordError() && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{getConfirmPasswordError()}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      id="authority-register-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>{isSubmitting ? "Creating your account..." : "Create Authority Account"}</span>
                    </button>
                  </div>
                </form>

                {/* Switch to login */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Already have an account?</span>
                  <button
                    onClick={() => switchView("authority-login")}
                    className="font-semibold text-slate-800 hover:text-blue-600 cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulated Password Recovery Modal (Section 4) */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Password Recovery</h3>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSent ? (
              <div className="py-3 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Reset instructions sent</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  A password reset link was dispatched to <strong className="text-slate-700">{forgotEmail || "your email"}</strong> (simulated demo flow).
                </p>
                <button
                  onClick={() => setIsForgotModalOpen(false)}
                  className="mt-5 w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Enter your registered email address. We will simulate sending a secure reset link to restore your FixMyStreet account.
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 mb-4"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (forgotEmail.trim()) {
                        setForgotSent(true);
                      }
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

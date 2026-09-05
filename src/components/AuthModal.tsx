import React, { useState } from "react";
import { User, DepartmentType } from "../types";
import { DEFAULT_CITIZEN_USER, DEFAULT_AUTHORITY_USER } from "../services/storage";
import { ALL_DEPARTMENTS } from "../utils/categoryUtils";
import {
  User as UserIcon,
  Shield,
  X,
  ArrowRight,
  CheckCircle2,
  Building2,
  MapPin,
  Lock,
  Mail,
  FileCheck
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User;
  currentUserRole?: "citizen" | "authority";
  onLogin?: (user: User) => void;
  onSelectRole?: (role: "citizen" | "authority") => void;
  initialRole?: "citizen" | "authority";
  id?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentUserRole,
  onLogin,
  onSelectRole,
  initialRole = "citizen",
  id
}) => {
  const [selectedRole, setSelectedRole] = useState<"citizen" | "authority">(currentUserRole || initialRole);
  const [authMode, setAuthMode] = useState<"choose" | "login" | "register">("choose");

  // Citizen Form state
  const [citizenName, setCitizenName] = useState(currentUser?.name || DEFAULT_CITIZEN_USER.name);
  const [citizenEmail, setCitizenEmail] = useState(currentUser?.email || DEFAULT_CITIZEN_USER.email);
  const [citizenWard, setCitizenWard] = useState(currentUser?.ward || "Ward 112, Indiranagar");

  // Authority Form state
  const [officerName, setOfficerName] = useState(DEFAULT_AUTHORITY_USER.name);
  const [officerEmail, setOfficerEmail] = useState(DEFAULT_AUTHORITY_USER.email);
  const [department, setDepartment] = useState<DepartmentType>(DEFAULT_AUTHORITY_USER.department || "Roads Department");
  const [badgeId, setBadgeId] = useState("BBMP-OFF-8821");

  if (!isOpen) return null;

  const handleSelectRole = (role: "citizen" | "authority") => {
    setSelectedRole(role);
    setAuthMode("login");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === "citizen") {
      const user: User = {
        id: `user-${Date.now()}`,
        name: citizenName || "Citizen User",
        email: citizenEmail || "citizen@bangalore.civic",
        role: "citizen",
        ward: citizenWard
      };
      if (onLogin) onLogin(user);
      if (onSelectRole) onSelectRole("citizen");
    } else {
      const user: User = {
        id: `auth-${Date.now()}`,
        name: officerName || "Municipal Officer",
        email: officerEmail || "officer@civic.gov.in",
        role: "authority",
        department,
        ward: "Bangalore Urban Zone"
      };
      if (onLogin) onLogin(user);
      if (onSelectRole) onSelectRole("authority");
    }
    onClose();
  };

  const handleQuickDemoLogin = (role: "citizen" | "authority") => {
    if (role === "citizen") {
      if (onLogin) onLogin(DEFAULT_CITIZEN_USER);
      if (onSelectRole) onSelectRole("citizen");
    } else {
      if (onLogin) onLogin(DEFAULT_AUTHORITY_USER);
      if (onSelectRole) onSelectRole("authority");
    }
    onClose();
  };

  return (
    <div
      id={id || "auth-modal"}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl w-full max-w-xl overflow-hidden relative">
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">FixMyStreet Access</h2>
              <p className="text-[11px] text-slate-500 font-medium">Official municipal civic engagement portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8">
          {authMode === "choose" ? (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight font-display">
                  Welcome to FixMyStreet
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  How would you like to continue? Select your access portal below to proceed.
                </p>
              </div>

              {/* Two Large Elegant Role Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Citizen Option */}
                <div
                  onClick={() => handleSelectRole("citizen")}
                  className="group p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-600 bg-white hover:bg-blue-50/30 transition-all cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <UserIcon className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 font-display mb-1">
                      Citizen Portal
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Report infrastructure hazards, track repair progress, and inspect completed works.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700 group-hover:text-blue-800">
                    <span>Enter as Citizen</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Authority Option */}
                <div
                  onClick={() => handleSelectRole("authority")}
                  className="group p-5 rounded-2xl border-2 border-slate-200 hover:border-slate-800 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <Shield className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 font-display mb-1">
                      Authority Portal
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Municipal command center for triaging priority complaints, assigning crews, and verifying resolutions.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-slate-950">
                    <span>Enter as Officer</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Quick One-Click Demo Access */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-400">Quick Testing Accounts:</span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleQuickDemoLogin("citizen")}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
                  >
                    Demo Citizen (Ananya)
                  </button>
                  <button
                    onClick={() => handleQuickDemoLogin("authority")}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
                  >
                    Demo Officer (Verma)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Top back selector */}
              <button
                onClick={() => setAuthMode("choose")}
                className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-4 font-semibold"
              >
                &larr; Switch Access Portal
              </button>

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">
                    {selectedRole === "citizen" ? "Citizen Authentication" : "Municipal Authority Login"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedRole === "citizen"
                      ? authMode === "register"
                        ? "Register for ward-level reporting & alerts"
                        : "Sign in with your verified phone or citizen email"
                      : "Official credentials for Bangalore civic operations"}
                  </p>
                </div>

                {selectedRole === "citizen" && (
                  <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        authMode === "login" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode("register")}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        authMode === "register" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                      }`}
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {selectedRole === "citizen" ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={citizenName}
                          onChange={(e) => setCitizenName(e.target.value)}
                          className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 shadow-2xs"
                          placeholder="e.g. Ananya Sharma"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          value={citizenEmail}
                          onChange={(e) => setCitizenEmail(e.target.value)}
                          className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 shadow-2xs"
                          placeholder="ananya.sharma@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Home Ward / Neighborhood
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={citizenWard}
                          onChange={(e) => setCitizenWard(e.target.value)}
                          className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 shadow-2xs"
                          placeholder="Ward 112, Indiranagar"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Officer Name
                      </label>
                      <div className="relative">
                        <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={officerName}
                          onChange={(e) => setOfficerName(e.target.value)}
                          className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 shadow-2xs"
                          placeholder="R. K. Verma"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Assigned Municipal Department
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value as DepartmentType)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 focus:border-blue-500 focus:outline-hidden shadow-2xs font-medium"
                      >
                        {ALL_DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Official Badge / Staff ID
                      </label>
                      <div className="relative">
                        <FileCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={badgeId}
                          onChange={(e) => setBadgeId(e.target.value)}
                          className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 shadow-2xs font-mono"
                          placeholder="BBMP-OFF-8821"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin(selectedRole)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                  >
                    Auto-fill Demo Credentials
                  </button>

                  <button
                    type="submit"
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
                      selectedRole === "citizen"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-slate-900 hover:bg-slate-800"
                    }`}
                  >
                    <span>Continue to {selectedRole === "citizen" ? "Citizen Portal" : "Authority Operations"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import { CivicCategory, DepartmentType, ComplaintStatus, PriorityLevel } from "../types";

export const CATEGORY_DEPARTMENT_MAP: Record<CivicCategory, DepartmentType> = {
  "Pothole": "Roads Department",
  "Damaged Road": "Roads Department",
  "Garbage": "Sanitation Department",
  "Garbage Overflow": "Sanitation Department",
  "Blocked Drain": "Drainage Department",
  "Water Leakage": "Water Department",
  "Broken Streetlight": "Electrical Department",
  "Damaged Sidewalk": "Public Works Department",
  "Damaged Public Infrastructure": "Public Works Department",
  "Other": "General Maintenance",
};

export const ALL_CATEGORIES: CivicCategory[] = [
  "Pothole",
  "Garbage",
  "Garbage Overflow",
  "Blocked Drain",
  "Water Leakage",
  "Broken Streetlight",
  "Damaged Road",
  "Damaged Sidewalk",
  "Damaged Public Infrastructure",
  "Other",
];

export const ALL_DEPARTMENTS: DepartmentType[] = [
  "Roads Department",
  "Sanitation Department",
  "Drainage Department",
  "Water Department",
  "Electrical Department",
  "Public Works Department",
  "General Maintenance",
];

export const ALL_STATUSES: ComplaintStatus[] = [
  "REPORTED",
  "VERIFIED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CITIZEN_VERIFIED",
  "VERIFICATION_FAILED",
];

export function getDefaultDepartmentForCategory(category: CivicCategory): DepartmentType {
  return CATEGORY_DEPARTMENT_MAP[category] || "General Maintenance";
}

export function formatStatusLabel(status: ComplaintStatus): string {
  switch (status) {
    case "REPORTED":
      return "Reported";
    case "VERIFIED":
      return "Verified";
    case "ASSIGNED":
      return "Assigned";
    case "IN_PROGRESS":
      return "In Progress";
    case "RESOLVED":
      return "Resolved";
    case "CITIZEN_VERIFIED":
      return "Citizen Verified";
    case "VERIFICATION_FAILED":
      return "Verification Failed";
    default:
      return status;
  }
}

export function getStatusBadgeColor(status: ComplaintStatus): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case "REPORTED":
      return {
        bg: "bg-slate-100",
        text: "text-slate-700",
        border: "border-slate-200",
        dot: "bg-slate-400"
      };
    case "VERIFIED":
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        dot: "bg-blue-500"
      };
    case "ASSIGNED":
      return {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        border: "border-indigo-200",
        dot: "bg-indigo-500"
      };
    case "IN_PROGRESS":
      return {
        bg: "bg-amber-50",
        text: "text-amber-800",
        border: "border-amber-200",
        dot: "bg-amber-500"
      };
    case "RESOLVED":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-800",
        border: "border-emerald-200",
        dot: "bg-emerald-500"
      };
    case "CITIZEN_VERIFIED":
      return {
        bg: "bg-teal-50",
        text: "text-teal-800",
        border: "border-teal-200",
        dot: "bg-teal-600"
      };
    case "VERIFICATION_FAILED":
      return {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        dot: "bg-rose-500"
      };
  }
}

export function getPriorityColor(level: PriorityLevel): {
  bg: string;
  text: string;
  border: string;
  ring: string;
  markerHex: string;
} {
  switch (level) {
    case "CRITICAL":
      return {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        ring: "ring-rose-500",
        markerHex: "#e11d48"
      };
    case "HIGH":
      return {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
        ring: "ring-orange-500",
        markerHex: "#ea580c"
      };
    case "MEDIUM":
      return {
        bg: "bg-amber-50",
        text: "text-amber-800",
        border: "border-amber-200",
        ring: "ring-amber-500",
        markerHex: "#d97706"
      };
    case "LOW":
      return {
        bg: "bg-slate-100",
        text: "text-slate-600",
        border: "border-slate-200",
        ring: "ring-slate-400",
        markerHex: "#64748b"
      };
  }
}

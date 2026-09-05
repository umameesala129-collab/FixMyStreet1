export type CivicCategory =
  | "Pothole"
  | "Garbage"
  | "Garbage Overflow"
  | "Blocked Drain"
  | "Water Leakage"
  | "Broken Streetlight"
  | "Damaged Road"
  | "Damaged Sidewalk"
  | "Damaged Public Infrastructure"
  | "Other";

export type DepartmentType =
  | "Roads Department"
  | "Sanitation Department"
  | "Drainage Department"
  | "Water Department"
  | "Electrical Department"
  | "Public Works Department"
  | "General Maintenance";

export type ComplaintStatus =
  | "REPORTED"
  | "VERIFIED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CITIZEN_VERIFIED"
  | "VERIFICATION_FAILED";

export type SeverityLevel = "Low" | "Medium" | "High" | "Critical";
export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface PriorityBreakdown {
  totalScore: number;
  level: PriorityLevel;
  severityScore: number; // 40% max
  reportsScore: number; // 25% max
  affectedScore: number; // 15% max
  locationScore: number; // 10% max
  ageScore: number; // 10% max
  factors: string[];
}

export interface ResolutionData {
  after_image: string;
  resolution_notes: string;
  resolved_by: string;
  resolved_at: string;
  citizen_verified?: boolean;
  verification_comment?: string;
  verified_at?: string;
}

export interface Issue {
  id: string; // e.g. FM-1024
  title: string;
  description: string;
  category: CivicCategory;
  latitude: number;
  longitude: number;
  address: string;
  image_path: string;
  ai_category?: CivicCategory;
  ai_confidence?: number;
  ai_reasoning?: string;
  severity: SeverityLevel;
  priority_score: number; // 0-100
  priority_level: PriorityLevel;
  priority_breakdown?: PriorityBreakdown;
  status: ComplaintStatus;
  department: DepartmentType;
  created_by: {
    id: string;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  related_reports_count: number;
  is_main_road?: boolean;
  is_near_school?: boolean;
  estimated_affected_people?: number;
  resolution?: ResolutionData;
  duplicate_of?: string;
  upvotes?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "citizen" | "authority";
  department?: DepartmentType;
  ward?: string;
}

export interface DuplicateMatch {
  issue: Issue;
  similarity_score: number; // 0-100%
  distance_meters: number;
  category_matched: boolean;
  text_similarity: number;
}

export interface AIAnalysisResult {
  category: CivicCategory;
  confidence: number;
  severity: SeverityLevel;
  reasoning?: string;
  source?: "gemini" | "local-heuristic" | "fallback";
}

export interface CivicNotification {
  id: string;
  recipientRole: "citizen" | "authority" | "all";
  recipientUserId?: string;
  issueId: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: "assigned" | "status_change" | "resolved" | "verification_needed" | "verified" | "reopened" | "critical_reported";
}

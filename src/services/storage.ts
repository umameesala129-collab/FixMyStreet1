import { Issue, ComplaintStatus, DepartmentType, ResolutionData, User } from "../types";
import { INITIAL_ISSUES } from "../data/seedData";

const STORAGE_KEY = "fixmystreet_issues_v1";
const USER_KEY = "fixmystreet_active_user_v1";

export const DEFAULT_CITIZEN_USER: User = {
  id: "user-1",
  name: "Ananya Sharma",
  email: "ananya.sharma@example.com",
  role: "citizen",
  ward: "Ward 112, Indiranagar"
};

export const DEFAULT_AUTHORITY_USER: User = {
  id: "auth-1",
  name: "R. K. Verma",
  email: "rk.verma@civic.gov.in",
  role: "authority",
  department: "Roads Department",
  ward: "Central Zone - Ward 110-115"
};

export function getStoredIssues(): Issue[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ISSUES));
      return INITIAL_ISSUES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ISSUES));
      return INITIAL_ISSUES;
    }
    return parsed;
  } catch (err) {
    console.warn("Error reading localStorage, using initial issues:", err);
    return INITIAL_ISSUES;
  }
}

export function saveAllIssues(issues: Issue[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
    window.dispatchEvent(new Event("fixmystreet_storage_change"));
  } catch (err) {
    console.error("Failed to save issues to localStorage:", err);
  }
}

export function getIssueById(id: string): Issue | undefined {
  const issues = getStoredIssues();
  return issues.find((item) => item.id.toUpperCase() === id.toUpperCase());
}

export function addIssue(newIssue: Issue): void {
  const issues = getStoredIssues();
  // Prepend new issue
  const updated = [newIssue, ...issues];
  saveAllIssues(updated);
}

export function updateIssue(id: string, updates: Partial<Issue>): Issue | undefined {
  const issues = getStoredIssues();
  let found: Issue | undefined;
  const updated = issues.map((item) => {
    if (item.id.toUpperCase() === id.toUpperCase()) {
      found = {
        ...item,
        ...updates,
        updated_at: new Date().toISOString()
      };
      return found;
    }
    return item;
  });

  if (found) {
    saveAllIssues(updated);
  }
  return found;
}

export function updateIssueStatus(
  id: string,
  newStatus: ComplaintStatus,
  department?: DepartmentType
): Issue | undefined {
  const updates: Partial<Issue> = { status: newStatus };
  if (department) {
    updates.department = department;
  }
  return updateIssue(id, updates);
}

export function recordResolution(id: string, resolution: ResolutionData): Issue | undefined {
  return updateIssue(id, {
    status: "RESOLVED",
    resolution: {
      ...resolution,
      citizen_verified: false
    }
  });
}

export function recordCitizenVerification(
  id: string,
  isFixed: boolean,
  comment?: string
): Issue | undefined {
  const issue = getIssueById(id);
  if (!issue) return undefined;

  if (isFixed) {
    return updateIssue(id, {
      status: "CITIZEN_VERIFIED",
      resolution: issue.resolution
        ? {
            ...issue.resolution,
            citizen_verified: true,
            verification_comment: comment || "Verified fixed by citizen.",
            verified_at: new Date().toISOString()
          }
        : undefined
    });
  } else {
    // Reopen complaint to IN_PROGRESS and status VERIFICATION_FAILED
    return updateIssue(id, {
      status: "VERIFICATION_FAILED",
      resolution: issue.resolution
        ? {
            ...issue.resolution,
            citizen_verified: false,
            verification_comment: comment || "Citizen reported problem still exists after inspection.",
            verified_at: new Date().toISOString()
          }
        : undefined
    });
  }
}

export function getActiveUser(): User {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      localStorage.setItem(USER_KEY, JSON.stringify(DEFAULT_CITIZEN_USER));
      return DEFAULT_CITIZEN_USER;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CITIZEN_USER;
  }
}

export function setActiveUser(user: User): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("fixmystreet_user_change"));
  } catch (err) {
    console.error("Failed to set active user:", err);
  }
}

export function resetDemoData(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ISSUES));
  window.dispatchEvent(new Event("fixmystreet_storage_change"));
}

export function generateNextId(): string {
  const issues = getStoredIssues();
  const maxNumber = issues.reduce((max, item) => {
    const match = item.id.match(/^FM-(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      return Math.max(max, isNaN(num) ? 0 : num);
    }
    return max;
  }, 1050);

  return `FM-${maxNumber + 1}`;
}

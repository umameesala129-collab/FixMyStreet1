import { Issue, ComplaintStatus, DepartmentType, ResolutionData, User, CivicNotification } from "../types";
import { INITIAL_ISSUES } from "../data/seedData";

const STORAGE_KEY = "fixmystreet_issues_v1";
const USER_KEY = "fixmystreet_active_user_v1";
const NOTIFICATIONS_KEY = "fixmystreet_notifications_v1";
const ACCOUNTS_KEY = "fixmystreet_accounts_v1";
const SESSION_KEY = "fixmystreet_session_v1";

export interface StoredAccount extends User {
  password?: string;
  createdAt: string;
}

export const DEMO_CITIZEN_CREDENTIALS = {
  email: "demo.citizen@example.com",
  password: "Password123"
};

export const DEMO_AUTHORITY_CREDENTIALS = {
  email: "demo.authority@example.com",
  password: "Password123"
};

export const DEFAULT_CITIZEN_USER: User = {
  id: "user-citizen-demo",
  name: "Ananya Sharma",
  email: "demo.citizen@example.com",
  role: "citizen",
  ward: "Ward 112, Indiranagar"
};

export const DEFAULT_AUTHORITY_USER: User = {
  id: "user-authority-demo",
  name: "R. K. Verma",
  email: "demo.authority@example.com",
  role: "authority",
  department: "Roads Department",
  ward: "Central Zone - Ward 110-115"
};

const INITIAL_ACCOUNTS: StoredAccount[] = [
  {
    ...DEFAULT_CITIZEN_USER,
    password: DEMO_CITIZEN_CREDENTIALS.password,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: "user-citizen-2",
    name: "Priya Nair",
    email: "ananya.sharma@example.com",
    role: "citizen",
    ward: "Ward 114, Domlur",
    password: "Password123",
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    ...DEFAULT_AUTHORITY_USER,
    password: DEMO_AUTHORITY_CREDENTIALS.password,
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString()
  },
  {
    id: "user-authority-2",
    name: "Dr. Arvind Patel",
    email: "rk.verma@civic.gov.in",
    role: "authority",
    department: "Sanitation Department",
    ward: "East Zone Operations",
    password: "Password123",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
  }
];

const INITIAL_NOTIFICATIONS: CivicNotification[] = [
  {
    id: "notif-1",
    recipientRole: "citizen",
    issueId: "FM-1042",
    title: "Complaint Assigned",
    message: "Your pothole report FM-1042 has been assigned to the Roads Department.",
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    isRead: false,
    type: "assigned"
  },
  {
    id: "notif-2",
    recipientRole: "citizen",
    issueId: "FM-1004",
    title: "Verification Requested",
    message: "FM-1004 has been marked as resolved. Please verify whether it was actually fixed.",
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    isRead: false,
    type: "verification_needed"
  },
  {
    id: "notif-3",
    recipientRole: "authority",
    issueId: "FM-1045",
    title: "Critical Drain Blockage",
    message: "High urgency stormwater blockage logged in Ward 115 with high flood risk.",
    timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
    isRead: false,
    type: "critical_reported"
  },
  {
    id: "notif-4",
    recipientRole: "citizen",
    issueId: "FM-1024",
    title: "Crews In Progress",
    message: "Field repair team deployed for pothole restoration on 100ft Road.",
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    isRead: true,
    type: "status_change"
  }
];

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
  const result = updateIssue(id, {
    status: "RESOLVED",
    resolution: {
      ...resolution,
      citizen_verified: false
    }
  });

  if (result) {
    addNotification({
      recipientRole: "citizen",
      issueId: id,
      title: "Issue Marked Resolved",
      message: `${id} (${result.category}) was resolved by ${resolution.resolved_by}. Please verify the fix.`,
      type: "verification_needed"
    });
  }
  return result;
}

export function recordCitizenVerification(
  id: string,
  isFixed: boolean,
  comment?: string
): Issue | undefined {
  const issue = getIssueById(id);
  if (!issue) return undefined;

  if (isFixed) {
    const updated = updateIssue(id, {
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

    if (updated) {
      addNotification({
        recipientRole: "authority",
        issueId: id,
        title: "Citizen Verified Fix",
        message: `Citizen confirmed that repair on ${id} (${issue.category}) was successfully completed.`,
        type: "verified"
      });
    }
    return updated;
  } else {
    // Reopen complaint to IN_PROGRESS and status VERIFICATION_FAILED
    const updated = updateIssue(id, {
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

    if (updated) {
      addNotification({
        recipientRole: "authority",
        issueId: id,
        title: "Verification Failed - Reopened",
        message: `Citizen reported problem still exists for ${id} (${issue.category}). Crew re-dispatch needed.`,
        type: "reopened"
      });
    }
    return updated;
  }
}

export function getStoredNotifications(role?: "citizen" | "authority"): CivicNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    if (!role) return parsed;
    return parsed.filter((n) => n && (n.recipientRole === role || n.recipientRole === "all"));
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function addNotification(
  notif: Omit<CivicNotification, "id" | "timestamp" | "isRead">
): void {
  try {
    const all = getStoredNotifications();
    const newNotif: CivicNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    const updated = [newNotif, ...all].slice(0, 50); // Keep latest 50
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("fixmystreet_notification_change"));
  } catch (err) {
    console.error("Failed to add notification:", err);
  }
}

export function markNotificationAsRead(id: string): void {
  try {
    const all = getStoredNotifications();
    const updated = all.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("fixmystreet_notification_change"));
  } catch (err) {
    console.error("Failed to mark notification as read:", err);
  }
}

export function markAllNotificationsAsRead(role?: "citizen" | "authority"): void {
  try {
    const all = getStoredNotifications();
    const updated = all.map((n) => {
      if (!role || n.recipientRole === role || n.recipientRole === "all") {
        return { ...n, isRead: true };
      }
      return n;
    });
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("fixmystreet_notification_change"));
  } catch (err) {
    console.error("Failed to mark all notifications as read:", err);
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
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
  window.dispatchEvent(new Event("fixmystreet_storage_change"));
  window.dispatchEvent(new Event("fixmystreet_notification_change"));
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

// -------------------------------------------------------------
// Authentication, Accounts & Session Management
// -------------------------------------------------------------

export function getStoredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(INITIAL_ACCOUNTS));
      return INITIAL_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(INITIAL_ACCOUNTS));
      return INITIAL_ACCOUNTS;
    }
    return parsed;
  } catch (err) {
    console.warn("Error reading stored accounts, falling back to initial accounts:", err);
    return INITIAL_ACCOUNTS;
  }
}

export function saveStoredAccounts(accounts: StoredAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error("Failed to save accounts to storage:", err);
  }
}

export function isUserAuthenticated(): boolean {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      const parsed = JSON.parse(session);
      return Boolean(parsed?.isAuthenticated);
    }
    // Default to true for presentation MVP so existing demo flows continue smoothly
    return true;
  } catch {
    return true;
  }
}

export function setSessionAuthenticated(isAuthenticated: boolean, userId?: string, role?: "citizen" | "authority"): void {
  try {
    if (isAuthenticated) {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          isAuthenticated: true,
          userId,
          role,
          authenticatedAt: new Date().toISOString()
        })
      );
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
    window.dispatchEvent(new Event("fixmystreet_auth_change"));
  } catch (err) {
    console.error("Failed to update auth session:", err);
  }
}

/**
 * Authenticate existing user by email, password and expected role
 */
export function authenticateUser(
  email: string,
  password: string,
  expectedRole: "citizen" | "authority"
): { success: boolean; error?: string; user?: User } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  const accounts = getStoredAccounts();
  const matched = accounts.find((acc) => acc.email.toLowerCase() === cleanEmail);

  // Demo fallback bypass for ease of student evaluation:
  if (!matched) {
    // If testing with the stated demo emails:
    if (
      (cleanEmail === DEMO_CITIZEN_CREDENTIALS.email && expectedRole === "citizen") ||
      (cleanEmail === DEMO_AUTHORITY_CREDENTIALS.email && expectedRole === "authority")
    ) {
      const fallbackUser = expectedRole === "citizen" ? DEFAULT_CITIZEN_USER : DEFAULT_AUTHORITY_USER;
      setActiveUser(fallbackUser);
      setSessionAuthenticated(true, fallbackUser.id, fallbackUser.role);
      return { success: true, user: fallbackUser };
    }
    return { success: false, error: "Email or password is incorrect." };
  }

  // Check role match
  if (matched.role !== expectedRole) {
    return {
      success: false,
      error: `This account is registered as a ${matched.role}. Please sign in via the ${matched.role} portal.`
    };
  }

  // Check password
  if (matched.password && matched.password !== cleanPassword) {
    return { success: false, error: "Email or password is incorrect." };
  }

  const sanitizedUser: User = {
    id: matched.id,
    name: matched.name,
    email: matched.email,
    role: matched.role,
    department: matched.department,
    ward: matched.ward
  };

  setActiveUser(sanitizedUser);
  setSessionAuthenticated(true, sanitizedUser.id, sanitizedUser.role);
  return { success: true, user: sanitizedUser };
}

/**
 * Register a new Citizen or Authority account
 */
export function registerUserAccount(data: {
  name: string;
  email: string;
  password: string;
  role: "citizen" | "authority";
  department?: DepartmentType;
  ward?: string;
}): { success: boolean; error?: string; user?: User } {
  try {
    const cleanEmail = data.email.trim().toLowerCase();
    const accounts = getStoredAccounts();

    // Check duplicate
    const exists = accounts.some((acc) => acc.email.toLowerCase() === cleanEmail);
    if (exists) {
      return {
        success: false,
        error: "An account with this email already exists."
      };
    }

    const newAccount: StoredAccount = {
      id: `${data.role}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: data.name.trim(),
      email: cleanEmail,
      password: data.password,
      role: data.role,
      department: data.department,
      ward: data.ward?.trim() || (data.role === "citizen" ? "Central Ward District" : "Municipal Division"),
      createdAt: new Date().toISOString()
    };

    const updated = [...accounts, newAccount];
    saveStoredAccounts(updated);

    const sanitizedUser: User = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      role: newAccount.role,
      department: newAccount.department,
      ward: newAccount.ward
    };

    setActiveUser(sanitizedUser);
    setSessionAuthenticated(true, sanitizedUser.id, sanitizedUser.role);

    // Add welcome notification
    addNotification({
      recipientRole: sanitizedUser.role,
      issueId: "FM-WELCOME",
      title: "Account Created",
      message: `Welcome to FixMyStreet, ${sanitizedUser.name}! Your ${sanitizedUser.role} portal is active.`,
      type: "status_change"
    });

    return { success: true, user: sanitizedUser };
  } catch (err) {
    console.error("Registration error:", err);
    return {
      success: false,
      error: "Unable to create your account. Please try again."
    };
  }
}

/**
 * Log out active user and reset session
 */
export function logoutUser(): void {
  try {
    setSessionAuthenticated(false);
    // Keep active user object with guest state or reset
    window.dispatchEvent(new Event("fixmystreet_auth_change"));
  } catch (err) {
    console.error("Failed to log out user:", err);
  }
}



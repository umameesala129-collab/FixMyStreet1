import { PriorityBreakdown, PriorityLevel, SeverityLevel } from "../types";

export interface PriorityParams {
  severity: SeverityLevel;
  relatedReportsCount: number;
  estimatedPeopleAffected?: number;
  isMainRoad?: boolean;
  isNearSchool?: boolean;
  createdAtIso?: string;
  daysOld?: number;
}

export function calculatePriorityScore(params: PriorityParams): PriorityBreakdown {
  const factors: string[] = [];

  // 1. Severity: Max 40 points
  let severityScore = 10;
  if (params.severity === "Critical") {
    severityScore = 40;
    factors.push("Critical infrastructure defect posing immediate hazard (+40 pts)");
  } else if (params.severity === "High") {
    severityScore = 30;
    factors.push("High severity defect impacting public safety (+30 pts)");
  } else if (params.severity === "Medium") {
    severityScore = 20;
    factors.push("Medium severity issue causing disruption (+20 pts)");
  } else {
    severityScore = 10;
    factors.push("Low severity minor maintenance item (+10 pts)");
  }

  // 2. Related Reports: Max 25 points
  let reportsScore = 5;
  const count = Math.max(1, params.relatedReportsCount || 1);
  if (count >= 6) {
    reportsScore = 25;
    factors.push(`6+ verified citizen reports (${count} reports) (+25 pts)`);
  } else if (count >= 4) {
    reportsScore = 20;
    factors.push(`Multiple citizen reports (${count} reports) (+20 pts)`);
  } else if (count >= 2) {
    reportsScore = 15;
    factors.push(`Repeated complaint (${count} reports) (+15 pts)`);
  } else {
    reportsScore = 5;
    factors.push("Single initial complaint report (+5 pts)");
  }

  // 3. Estimated People Affected: Max 15 points
  const affected = params.estimatedPeopleAffected ?? (params.isMainRoad ? 350 : 80);
  let affectedScore = 5;
  if (affected >= 200) {
    affectedScore = 15;
    factors.push(`High pedestrian/vehicle impact (~${affected}+ citizens affected) (+15 pts)`);
  } else if (affected >= 50) {
    affectedScore = 10;
    factors.push(`Moderate neighborhood impact (~${affected} citizens affected) (+10 pts)`);
  } else {
    affectedScore = 5;
    factors.push(`Localized lane impact (<50 citizens affected) (+5 pts)`);
  }

  // 4. Location Importance: Max 10 points
  let locationScore = 0;
  if (params.isMainRoad) {
    locationScore += 5;
    factors.push("Located on arterial/main road corridor (+5 pts)");
  }
  if (params.isNearSchool) {
    locationScore += 5;
    factors.push("Sensitive civic zone (near school/hospital) (+5 pts)");
  }
  if (locationScore === 0) {
    locationScore = 2; // minor road baseline
    factors.push("Residential street location (+2 pts)");
  }

  // 5. Issue Age: Max 10 points
  let days = params.daysOld;
  if (days === undefined && params.createdAtIso) {
    const diffMs = Math.max(0, Date.now() - new Date(params.createdAtIso).getTime());
    days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
  if (days === undefined) days = 0;

  let ageScore = 2;
  if (days >= 5) {
    ageScore = 10;
    factors.push(`Aging unattended complaint (${days} days pending) (+10 pts)`);
  } else if (days >= 3) {
    ageScore = 8;
    factors.push(`Overdue inspection (${days} days old) (+8 pts)`);
  } else if (days >= 1) {
    ageScore = 5;
    factors.push(`Reported ${days} day(s) ago (+5 pts)`);
  } else {
    ageScore = 2;
    factors.push("Newly filed report today (+2 pts)");
  }

  const rawTotal = severityScore + reportsScore + affectedScore + locationScore + ageScore;
  const totalScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

  let level: PriorityLevel = "LOW";
  if (totalScore >= 80) {
    level = "CRITICAL";
  } else if (totalScore >= 60) {
    level = "HIGH";
  } else if (totalScore >= 40) {
    level = "MEDIUM";
  } else {
    level = "LOW";
  }

  return {
    totalScore,
    level,
    severityScore,
    reportsScore,
    affectedScore,
    locationScore,
    ageScore,
    factors
  };
}

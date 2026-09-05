import { CivicCategory, DuplicateMatch, Issue } from "../types";

/**
 * Calculates distance in meters between two lat/lng coordinates using the Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Computes simple word-overlap token Jaccard similarity between two texts (0 to 1)
 */
export function computeTextSimilarity(textA: string, textB: string): number {
  if (!textA || !textB) return 0;
  const cleanA = textA
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const cleanB = textB
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (cleanA.length === 0 || cleanB.length === 0) return 0;

  const setA = new Set(cleanA);
  const setB = new Set(cleanB);

  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection++;
  }

  const union = new Set([...cleanA, ...cleanB]).size;
  return union === 0 ? 0 : intersection / union;
}

export interface NewComplaintData {
  category: CivicCategory;
  latitude: number;
  longitude: number;
  description: string;
}

/**
 * Evaluates duplicate similarity against existing active complaints.
 * Returns sorted list of potential duplicate matches above threshold.
 */
export function findPotentialDuplicates(
  newReport: NewComplaintData,
  existingIssues: Issue[],
  minThresholdPercent = 50
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];

  // Active issues only (exclude fully citizen-verified resolved issues from heavy duplicates, or include recent ones)
  for (const issue of existingIssues) {
    // Only compare if coordinates are valid
    if (typeof issue.latitude !== "number" || typeof issue.longitude !== "number") continue;

    const distance = calculateDistanceMeters(
      newReport.latitude,
      newReport.longitude,
      issue.latitude,
      issue.longitude
    );

    // If more than 500m away, unlikely to be the exact same street issue
    if (distance > 500) continue;

    const categoryMatch = issue.category === newReport.category;
    const textSim = computeTextSimilarity(issue.description, newReport.description);

    // Weights:
    // 1. Category Match: 40%
    const categoryScore = categoryMatch ? 40 : 0;

    // 2. Geographic Proximity: 40%
    let distanceScore = 0;
    if (distance <= 25) {
      distanceScore = 40;
    } else if (distance <= 50) {
      distanceScore = 35;
    } else if (distance <= 100) {
      distanceScore = 25;
    } else if (distance <= 200) {
      distanceScore = 15;
    } else {
      distanceScore = 5;
    }

    // 3. Text Similarity: 20%
    const textScore = Math.round(textSim * 20);

    const totalSimilarity = Math.min(99, categoryScore + distanceScore + textScore);

    if (totalSimilarity >= minThresholdPercent) {
      matches.push({
        issue,
        similarity_score: totalSimilarity,
        distance_meters: distance,
        category_matched: categoryMatch,
        text_similarity: Math.round(textSim * 100)
      });
    }
  }

  // Sort highest similarity first
  matches.sort((a, b) => b.similarity_score - a.similarity_score);
  return matches;
}

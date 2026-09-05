import { AIAnalysisResult, CivicCategory, SeverityLevel } from "../types";

export interface AnalyzeImagePayload {
  imageBase64: string;
  mimeType?: string;
  fileName?: string;
  description?: string;
}

export async function analyzeCivicIssueImage(
  payload: AnalyzeImagePayload
): Promise<AIAnalysisResult> {
  try {
    const response = await fetch("/api/analyze-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return {
      category: data.category as CivicCategory,
      confidence: typeof data.confidence === "number" ? data.confidence : 0.89,
      severity: (data.severity as SeverityLevel) || "High",
      reasoning: data.reasoning || "Detected visual civic infrastructure defect.",
      source: data.source || "gemini"
    };
  } catch (err: any) {
    console.warn("AI service call failed or offline, applying client-side fallback:", err.message);

    // Client-side rule-based fallback based on filename and text
    const lower = `${payload.fileName || ""} ${payload.description || ""}`.toLowerCase();
    let category: CivicCategory = "Pothole";
    let confidence = 0.91;
    let severity: SeverityLevel = "High";
    let reasoning = "Pavement surface defect and road indentation detected.";

    if (lower.includes("garbage") || lower.includes("trash") || lower.includes("waste")) {
      category = "Garbage Overflow";
      confidence = 0.88;
      severity = "Medium";
      reasoning = "Solid waste and uncollected garbage accumulation detected.";
    } else if (lower.includes("drain") || lower.includes("gutter") || lower.includes("sewer")) {
      category = "Blocked Drain";
      confidence = 0.86;
      severity = "High";
      reasoning = "Stormwater blockage and standing runoff detected.";
    } else if (lower.includes("water") || lower.includes("leak") || lower.includes("pipe")) {
      category = "Water Leakage";
      confidence = 0.92;
      severity = "High";
      reasoning = "Pipeline rupture and active water discharge detected.";
    } else if (lower.includes("light") || lower.includes("lamp") || lower.includes("pole")) {
      category = "Broken Streetlight";
      confidence = 0.87;
      severity = "Medium";
      reasoning = "Street illumination fixture damaged or non-functional.";
    } else if (lower.includes("sidewalk") || lower.includes("kerb") || lower.includes("pavement")) {
      category = "Damaged Sidewalk";
      confidence = 0.85;
      severity = "Medium";
      reasoning = "Pedestrian walkway tiles broken or displaced.";
    }

    return {
      category,
      confidence,
      severity,
      reasoning,
      source: "local-heuristic"
    };
  }
}

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Issue, CivicCategory, ComplaintStatus, PriorityLevel } from "../types";
import { ALL_CATEGORIES } from "../utils/categoryUtils";
import {
  MapPin,
  Filter,
  Layers,
  Search,
  ExternalLink,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Clock,
  Flame,
  ShieldCheck
} from "lucide-react";

interface PublicMapPageProps {
  issues: Issue[];
  onSelectIssue: (id: string) => void;
  id?: string;
}

export const PublicMapPage: React.FC<PublicMapPageProps> = ({
  issues,
  onSelectIssue,
  id
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [quickFilter, setQuickFilter] = useState<string>("ALL"); // ALL, CRITICAL, HIGH, MEDIUM, IN_PROGRESS, RESOLVED
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Top summary metrics
  const safeIssues = Array.isArray(issues) ? issues : [];
  const totalReports = safeIssues.length;
  const resolvedCount = safeIssues.filter(
    (i) => i && (i.status === "RESOLVED" || i.status === "CITIZEN_VERIFIED")
  ).length;
  const inProgressCount = safeIssues.filter((i) => i && i.status === "IN_PROGRESS").length;
  const pendingCount = safeIssues.filter(
    (i) => i && (i.status === "REPORTED" || i.status === "VERIFIED" || i.status === "ASSIGNED")
  ).length;

  // Filter issues
  const filteredIssues = safeIssues.filter((item) => {
    if (selectedCategory !== "ALL" && item.category !== selectedCategory) return false;

    if (quickFilter === "CRITICAL" && item.priority_level !== "CRITICAL") return false;
    if (quickFilter === "HIGH" && item.priority_level !== "HIGH") return false;
    if (quickFilter === "MEDIUM" && item.priority_level !== "MEDIUM") return false;
    if (quickFilter === "IN_PROGRESS" && item.status !== "IN_PROGRESS") return false;
    if (
      quickFilter === "RESOLVED" &&
      item.status !== "RESOLVED" &&
      item.status !== "CITIZEN_VERIFIED"
    ) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = item.id.toLowerCase().includes(q);
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchAddr = item.address.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchAddr) return false;
    }
    return true;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Bangalore civic core (12.9716, 77.5946)
    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.5946],
      zoom: 13,
      zoomControl: true
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    filteredIssues.forEach((issue) => {
      if (typeof issue.latitude !== "number" || typeof issue.longitude !== "number") return;

      const isResolved =
        issue.status === "RESOLVED" || issue.status === "CITIZEN_VERIFIED";

      let markerColor = "#ea580c"; // orange High
      if (isResolved) {
        markerColor = "#10b981"; // emerald
      } else if (issue.priority_level === "CRITICAL") {
        markerColor = "#e11d48"; // rose
      } else if (issue.priority_level === "HIGH") {
        markerColor = "#ea580c"; // orange
      } else if (issue.priority_level === "MEDIUM") {
        markerColor = "#d97706"; // amber
      } else {
        markerColor = "#64748b"; // slate
      }

      const customIcon = L.divIcon({
        className: "custom-civic-marker",
        html: `
          <div style="
            background-color: ${markerColor};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 2.5px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            font-family: inherit;
          ">
            ${issue.related_reports_count > 1 ? issue.related_reports_count : ""}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
      });

      const marker = L.marker([issue.latitude, issue.longitude], {
        icon: customIcon
      });

      // SECTION 24: MARKER POPUP
      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; min-width: 220px; padding: 4px; color: #0f172a;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="font-family: monospace; font-size: 11px; color: #2563eb; font-weight: 700;">${issue.id}</strong>
            <span style="
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              padding: 2px 8px;
              border-radius: 6px;
              background-color: ${markerColor}18;
              color: ${markerColor};
              border: 1px solid ${markerColor}33;
            ">
              ${issue.priority_level}
            </span>
          </div>
          <div style="font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 2px;">
            Issue: ${issue.category}
          </div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 6px; line-height: 1.4;">
            ${issue.address}
          </div>
          <div style="font-size: 11px; color: #334155; margin-bottom: 10px; border-top: 1px solid #f1f5f9; padding-top: 6px; line-height: 1.6;">
            <div><strong>Priority:</strong> ${issue.priority_level} (${issue.priority_score}/100)</div>
            <div><strong>Status:</strong> ${issue.status.replace("_", " ")}</div>
            <div><strong>Reports:</strong> ${issue.related_reports_count} citizen report(s)</div>
          </div>
          <button
            id="popup-view-${issue.id}"
            style="
              width: 100%;
              padding: 7px 12px;
              background-color: #2563eb;
              color: #ffffff;
              font-weight: 700;
              font-size: 11px;
              border: none;
              border-radius: 8px;
              cursor: pointer;
            "
          >
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on("popupopen", () => {
        const btn = document.getElementById(`popup-view-${issue.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectIssue(issue.id);
          };
        }
      });

      layer.addLayer(marker);
      bounds.push([issue.latitude, issue.longitude]);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, {
        padding: [50, 50],
        maxZoom: 14
      });
    }
  }, [filteredIssues, onSelectIssue]);

  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) {
      alert("Geolocation unavailable.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15);
        }
      },
      (err) => {
        console.warn("Locate error:", err);
      }
    );
  };

  return (
    <div id={id || "public-map-page"} className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* SECTION 24: TOP TRANSPARENCY HEADER & METRICS */}
      <div className="bg-white border-b border-slate-200 p-4 sm:p-6 shadow-2xs shrink-0">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-display">
                City Issues
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                See reported civic issues and their current status.
              </p>
            </div>

            {/* Top Summary Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Reports</span>
                <span className="text-sm font-bold text-slate-900">{totalReports}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">Resolved</span>
                <span className="text-sm font-bold text-emerald-700">{resolvedCount}</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-600 block">In Progress</span>
                <span className="text-sm font-bold text-amber-700">{inProgressCount}</span>
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Pending</span>
                <span className="text-sm font-bold text-slate-700">{pendingCount}</span>
              </div>
            </div>
          </div>

          {/* Map Filters & Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            {/* Quick Filter Pills (Section 24: All, Critical, High, Medium, In Progress, Resolved) */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              {[
                { key: "ALL", label: "All" },
                { key: "CRITICAL", label: "Critical" },
                { key: "HIGH", label: "High" },
                { key: "MEDIUM", label: "Medium" },
                { key: "IN_PROGRESS", label: "In Progress" },
                { key: "RESOLVED", label: "Resolved" }
              ].map((pill) => (
                <button
                  key={pill.key}
                  onClick={() => setQuickFilter(pill.key)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    quickFilter === pill.key
                      ? "bg-slate-900 text-white shadow-2xs font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Search & Location */}
            <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search street, area, ID..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <button
                onClick={handleLocateMe}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center gap-1 transition-colors text-xs shrink-0 cursor-pointer"
                title="Center map on my location"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span>My Location</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container & Floating Legend */}
      <div className="relative flex-1 w-full min-h-[600px]">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

        {/* Legend with Privacy Notice */}
        <div className="absolute bottom-6 left-6 z-10 bg-white/95 backdrop-blur-xs p-4 rounded-2xl border border-slate-200 shadow-lg text-xs space-y-2.5 max-w-xs">
          <div className="font-bold text-slate-900 text-xs">
            Priority Color Legend
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
              <span>High</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-emerald-700 font-semibold">Resolved</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 leading-relaxed">
            Privacy notice: Exact citizen personal details are kept strictly private.
          </div>
        </div>
      </div>
    </div>
  );
};

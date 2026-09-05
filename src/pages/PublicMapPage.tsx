import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Issue, CivicCategory, ComplaintStatus, PriorityLevel } from "../types";
import { ALL_CATEGORIES, ALL_STATUSES } from "../utils/categoryUtils";
import {
  MapPin,
  Filter,
  Layers,
  Search,
  ExternalLink,
  Navigation,
  CheckCircle2,
  AlertCircle
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
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter issues
  const filteredIssues = issues.filter((item) => {
    if (selectedCategory !== "ALL" && item.category !== selectedCategory) return false;
    if (selectedStatus !== "ALL" && item.status !== selectedStatus) return false;
    if (selectedPriority !== "ALL" && item.priority_level !== selectedPriority) return false;
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

    // Clean OpenStreetMap layer
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

      // Custom Leaflet DivIcon
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

      // Custom popup HTML (Strict Privacy Rule: No citizen personal details)
      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; min-width: 220px; padding: 6px 4px; color: #0f172a;">
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
          <div style="font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 3px;">
            ${issue.category}
          </div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 8px; line-height: 1.4;">
            ${issue.address}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 10px; border-top: 1px solid #f1f5f9; padding-top: 6px; line-height: 1.6;">
            <div><strong>Status:</strong> ${issue.status.replace("_", " ")}</div>
            <div><strong>Reports:</strong> ${issue.related_reports_count} verified neighbor(s)</div>
            <div><strong>Reported:</strong> ${new Date(issue.created_at).toLocaleDateString()}</div>
          </div>
          <button
            id="popup-view-${issue.id}"
            style="
              width: 100%;
              padding: 8px 12px;
              background-color: #2563eb;
              color: #ffffff;
              font-weight: 600;
              font-size: 11px;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              transition: background 0.2s;
            "
          >
            Inspect Complaint Details
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
        mapInstanceRef.current?.flyTo([latitude, longitude], 15);
      },
      () => {
        alert("Could not access your location.");
      }
    );
  };

  return (
    <div id={id} className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Filter Bar */}
      <div className="bg-white border-b border-slate-200 p-4 shadow-2xs shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 font-display">Interactive Public Map</h1>
              <p className="text-xs text-slate-500">
                OpenStreetMap &bull; Showing {filteredIssues.length} active civic issues
              </p>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Search */}
            <div className="relative flex-1 sm:w-52">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search street, area, ID..."
                className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 shadow-2xs"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs py-2 px-3 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:border-blue-500 focus:outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs py-2 px-3 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:border-blue-500 focus:outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.replace("_", " ")}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs py-2 px-3 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:border-blue-500 focus:outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical (80-100)</option>
              <option value="HIGH">High (60-79)</option>
              <option value="MEDIUM">Medium (40-59)</option>
              <option value="LOW">Low (0-39)</option>
            </select>

            {/* Locate Me */}
            <button
              onClick={handleLocateMe}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold rounded-xl flex items-center gap-1.5 transition-colors text-xs cursor-pointer"
              title="Center map on my location"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span>My Location</span>
            </button>
          </div>
        </div>
      </div>

      {/* Map Container & Legend */}
      <div className="relative flex-1 w-full min-h-[600px]">
        {/* Leaflet DOM Anchor */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

        {/* Floating Map Legend */}
        <div className="absolute bottom-6 left-6 z-10 bg-white/95 backdrop-blur-xs p-4 rounded-2xl border border-slate-200 shadow-lg text-xs space-y-2.5 max-w-xs">
          <div className="font-bold text-slate-900 text-xs">
            Priority Color Legend
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
              <span>Critical (80-100)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
              <span>High (60-79)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
              <span>Medium (40-59)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-400 shrink-0" />
              <span>Low (0-39)</span>
            </div>
            <div className="flex items-center gap-2 col-span-2 pt-1 border-t border-slate-100">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-emerald-700 font-semibold">Resolved &amp; Verified</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 leading-relaxed">
            Privacy notice: Exact personal citizen details are withheld from public view.
          </div>
        </div>
      </div>
    </div>
  );
};

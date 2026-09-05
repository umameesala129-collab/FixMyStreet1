import React, { useState } from "react";
import { Issue } from "../types";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { calculateDistanceMeters } from "../utils/duplicateDetector";
import {
  MapPin,
  Compass,
  Navigation,
  ExternalLink,
  ChevronRight,
  Filter,
  PlusCircle,
  AlertCircle
} from "lucide-react";

interface NearbyIssuesProps {
  issues: Issue[];
  onSelectIssue: (id: string) => void;
  onOpenMap: (highlightId?: string) => void;
  onOpenReport: () => void;
  userCoords?: { lat: number; lng: number };
  id?: string;
}

export const NearbyIssues: React.FC<NearbyIssuesProps> = ({
  issues = [],
  onSelectIssue,
  onOpenMap,
  onOpenReport,
  userCoords = { lat: 12.9719, lng: 77.6412 }, // Indiranagar base
  id
}) => {
  const [maxRadiusMeters, setMaxRadiusMeters] = useState<number>(1500);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const safeIssues = Array.isArray(issues) ? issues : [];

  // Calculate distance for each issue relative to reference coordinates
  const itemsWithDistance = safeIssues
    .filter((issue) => issue && typeof issue.latitude === "number" && typeof issue.longitude === "number")
    .map((issue) => {
      const dist = calculateDistanceMeters(
        userCoords.lat,
        userCoords.lng,
        issue.latitude,
        issue.longitude
      );
      return { ...issue, distanceMeters: Math.round(dist) };
    })
    .filter((issue) => {
      if (issue.distanceMeters > maxRadiusMeters) return false;
      if (categoryFilter !== "ALL" && issue.category !== categoryFilter) return false;
      return true;
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  return (
    <div id={id || "nearby-issues-view"} className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Proximity Radar</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Civic Issues Near You
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active reports within your immediate neighborhood. Checking this list helps avoid duplicate submissions.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Radius selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setMaxRadiusMeters(500)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                maxRadiusMeters === 500 ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              500 m
            </button>
            <button
              onClick={() => setMaxRadiusMeters(1000)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                maxRadiusMeters === 1000 ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              1.0 km
            </button>
            <button
              onClick={() => setMaxRadiusMeters(2500)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                maxRadiusMeters === 2500 ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              2.5 km
            </button>
          </div>

          <button
            onClick={onOpenReport}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report New</span>
          </button>
        </div>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {itemsWithDistance.map((issue) => (
          <div
            key={issue.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Photo & Distance Tag */}
              <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                <img
                  src={issue.image_path}
                  alt={issue.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2.5 left-2.5 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                  <Navigation className="w-3 h-3 text-blue-400" />
                  <span>
                    {issue.distanceMeters < 1000
                      ? `${issue.distanceMeters} m away`
                      : `${(issue.distanceMeters / 1000).toFixed(1)} km away`}
                  </span>
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <StatusBadge status={issue.status} size="sm" />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600">
                    {issue.id}
                  </span>
                  <PriorityBadge
                    score={issue.priority_score}
                    level={issue.priority_level}
                    size="sm"
                  />
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {issue.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {issue.description}
                </p>

                <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{issue.address}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => onOpenMap(issue.id)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>View on Map</span>
              </button>

              <button
                onClick={() => onSelectIssue(issue.id)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <span>View Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {itemsWithDistance.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              No Issues Found Within {maxRadiusMeters} meters
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your neighborhood appears clear in this radius, or you may expand the search distance to check adjacent sectors.
            </p>
            <button
              onClick={() => setMaxRadiusMeters(2500)}
              className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors inline-block"
            >
              Expand Search to 2.5 km
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

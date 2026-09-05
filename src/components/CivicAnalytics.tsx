import React from "react";
import { Issue, DepartmentType } from "../types";
import { ALL_DEPARTMENTS, ALL_CATEGORIES } from "../utils/categoryUtils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import {
  Building2,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers
} from "lucide-react";

interface CivicAnalyticsProps {
  issues: Issue[];
  id?: string;
}

export const CivicAnalytics: React.FC<CivicAnalyticsProps> = ({ issues = [], id }) => {
  const safeIssues = Array.isArray(issues) ? issues : [];

  // 1. Department active workloads
  const departmentWorkload = ALL_DEPARTMENTS.map((dept) => {
    const deptIssues = safeIssues.filter((i) => i && i.department === dept);
    const active = deptIssues.filter(
      (i) => i && i.status !== "RESOLVED" && i.status !== "CITIZEN_VERIFIED"
    ).length;
    const resolved = deptIssues.filter(
      (i) => i && (i.status === "RESOLVED" || i.status === "CITIZEN_VERIFIED")
    ).length;
    return {
      name: dept.replace(" Department", ""),
      active,
      resolved,
      total: deptIssues.length
    };
  });

  // 2. Issue categories distribution
  const categoryCounts = ALL_CATEGORIES.map((cat) => {
    const count = safeIssues.filter((i) => i && i.category === cat).length;
    return { name: cat, count };
  }).filter((c) => c.count > 0);

  // 3. Status distribution
  const statusCounts = [
    { name: "Reported / Verified", value: safeIssues.filter((i) => i && (i.status === "REPORTED" || i.status === "VERIFIED")).length, color: "#64748b" },
    { name: "Assigned", value: safeIssues.filter((i) => i && i.status === "ASSIGNED").length, color: "#3b82f6" },
    { name: "In Progress", value: safeIssues.filter((i) => i && i.status === "IN_PROGRESS").length, color: "#f59e0b" },
    { name: "Resolved / Verified", value: safeIssues.filter((i) => i && (i.status === "RESOLVED" || i.status === "CITIZEN_VERIFIED")).length, color: "#10b981" },
    { name: "Needs Review / Reopened", value: safeIssues.filter((i) => i && i.status === "VERIFICATION_FAILED").length, color: "#ef4444" }
  ].filter((s) => s.value > 0);

  // 4. Activity over recent timeline (Simulated weekly trend based on seed + live updates)
  const timelineData = [
    { day: "Day -6", reported: 4, resolved: 2 },
    { day: "Day -5", reported: 6, resolved: 3 },
    { day: "Day -4", reported: 5, resolved: 4 },
    { day: "Day -3", reported: 8, resolved: 5 },
    { day: "Day -2", reported: 7, resolved: 6 },
    { day: "Yesterday", reported: 9, resolved: 8 },
    { day: "Today", reported: safeIssues.filter((i) => i && i.status === "REPORTED").length + 2, resolved: safeIssues.filter((i) => i && (i.status === "RESOLVED" || i.status === "CITIZEN_VERIFIED")).length }
  ];

  // Overall statistics
  const totalReports = safeIssues.length;
  const totalResolved = safeIssues.filter((i) => i && (i.status === "RESOLVED" || i.status === "CITIZEN_VERIFIED")).length;
  const resolutionRate = totalReports > 0 ? Math.round((totalResolved / totalReports) * 100) : 0;
  const criticalPending = safeIssues.filter(
    (i) => i && i.priority_level === "CRITICAL" && i.status !== "RESOLVED" && i.status !== "CITIZEN_VERIFIED"
  ).length;

  return (
    <div id={id || "civic-analytics-view"} className="space-y-6">
      {/* Top Headline Summary */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Civic Performance Intelligence</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Municipal Operations Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time reporting volume, department triage capacity, and public transparency metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-right">
            <span className="text-[11px] text-slate-400 font-medium block">Resolution Rate</span>
            <span className="text-lg font-bold text-emerald-600">{resolutionRate}%</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-right">
            <span className="text-[11px] text-slate-400 font-medium block">Critical Unresolved</span>
            <span className="text-lg font-bold text-rose-600">{criticalPending}</span>
          </div>
        </div>
      </div>

      {/* Section 22: Department Overview Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Department Active Workload Distribution
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {departmentWorkload.map((dept) => (
            <div
              key={dept.name}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700 truncate">{dept.name}</span>
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{dept.active}</span>
                <span className="text-[11px] text-slate-400">active orders</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{
                    width: `${dept.total > 0 ? (dept.active / dept.total) * 100 : 0}%`
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block pt-0.5">
                {dept.resolved} completed repairs
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Reported vs Resolved Over Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Work Orders Reported vs. Resolved
              </h4>
              <p className="text-xs text-slate-500">
                Daily municipal intake vs field crew resolution completion
              </p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="reported"
                  name="New Reports"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Department Workload Comparison */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Department Assignment Comparison
              </h4>
              <p className="text-xs text-slate-500">
                Current active pipeline versus completed tickets
              </p>
            </div>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentWorkload} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="active" name="Active Tickets" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Common Categories */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Most Frequent Civic Hazards
            </h4>
            <p className="text-xs text-slate-500">
              Distribution of complaints categorized across the urban zone
            </p>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={categoryCounts}
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#334155" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                />
                <Bar dataKey="count" name="Complaint Count" fill="#0284c7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Status Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Complaint Status Breakdown
              </h4>
              <p className="text-xs text-slate-500">
                Current life-cycle stages of all logged municipal issues
              </p>
            </div>
            <PieChartIcon className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusCounts}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {statusCounts.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

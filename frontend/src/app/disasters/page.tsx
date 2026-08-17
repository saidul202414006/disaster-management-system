"use client";

import { useState } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { getDisasters } from "@/services/api";

type Disaster = {
  DISASTER_NAME: string;
  DISASTER_TYPE: string;
  DIVISION: string;
  DISTRICT: string;
  START_DATE: string;
  END_DATE: string | null;
  DURATION_DAYS: number | null;
};

const TYPE_ICONS: Record<string, string> = {
  Flood: "flood",
  Cyclone: "cyclone",
  Hurricane: "cyclone",
  Earthquake: "earthquake",
  Wildfire: "local_fire_department",
  Industrial: "factory",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-BD", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric" });
}

export default function DisastersPage() {
  const { data, loading, error, refetch } = useApi<Disaster[]>(getDisasters as any);
  const disasters = data ?? [];

  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Resolved">("All");
  const [search, setSearch] = useState("");

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-cobalt">
        <span className="material-symbols-outlined icon-thick text-[48px] animate-spin">progress_activity</span>
        <p className="font-bold">Loading disasters...</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="bg-white border border-red-200 rounded-[2rem] p-8 text-center shadow-sm">
        <span className="material-symbols-outlined icon-thick text-red-500 text-[48px]">error</span>
        <h2 className="font-display text-2xl text-black mt-4">Load Failed</h2>
        <p className="text-gray-600 font-medium mt-2">{error}</p>
        <button onClick={refetch} className="mt-4 px-4 py-2 bg-cobalt text-white rounded-xl font-bold">Retry</button>
      </div>
    </div>
  );

  const types = Array.from(new Set(disasters.map((d) => d.DISASTER_TYPE).filter(Boolean)));

  const filtered = disasters.filter((d) => {
    const matchType = typeFilter === "All" || d.DISASTER_TYPE === typeFilter;
    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && !d.END_DATE) ||
      (statusFilter === "Resolved" && !!d.END_DATE);
    const matchSearch =
      search === "" ||
      d.DISASTER_NAME.toLowerCase().includes(search.toLowerCase()) ||
      d.DIVISION.toLowerCase().includes(search.toLowerCase()) ||
      d.DISTRICT.toLowerCase().includes(search.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const activeCount = disasters.filter((d) => !d.END_DATE).length;
  const resolvedCount = disasters.filter((d) => !!d.END_DATE).length;

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col gap-4">
      {/* Header */}
      <div className="bg-azure rounded-[2rem] p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 shadow-sm border border-blue-200">
        <div>
          <h2 className="font-display text-4xl text-black uppercase tracking-tight">Disaster Events</h2>
          <p className="font-bold text-black/70 mt-2 text-lg">
            <span className="text-red-500 bg-red-100 px-2 py-1 rounded-lg text-sm mr-2">{activeCount} active</span>
            <span className="text-gray-600 bg-white px-2 py-1 rounded-lg text-sm mr-2">{resolvedCount} resolved</span>
            {disasters.length} total events
          </p>
        </div>
        <Link href="/disasters/new" className="flex items-center justify-center gap-2 px-5 py-3 bg-cobalt hover:bg-cobalt-dark rounded-xl text-white font-bold text-sm transition-colors shadow-sm">
          <span className="material-symbols-outlined icon-thick text-[18px]">add_alert</span>
          New Incident
        </Link>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-[2rem] p-6 flex justify-between items-center shadow-sm">
          <div>
            <div className="font-mono text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Disasters</div>
            <div className="font-display text-4xl text-black leading-none">{disasters.length}</div>
          </div>
          <span className="material-symbols-outlined icon-thick text-[32px] text-gray-400">crisis_alert</span>
        </div>
        <div className="bg-red-500 border border-red-600 rounded-[2rem] p-6 flex justify-between items-center shadow-sm">
          <div>
            <div className="font-mono text-xs font-bold text-red-100 uppercase tracking-wider mb-1">Active Now</div>
            <div className="font-display text-4xl text-white leading-none">{activeCount}</div>
          </div>
          <span className="material-symbols-outlined icon-thick text-[32px] text-red-200 animate-pulse">warning</span>
        </div>
        <div className="bg-green-500 border border-green-600 rounded-[2rem] p-6 flex justify-between items-center shadow-sm">
          <div>
            <div className="font-mono text-xs font-bold text-green-100 uppercase tracking-wider mb-1">Resolved</div>
            <div className="font-display text-4xl text-white leading-none">{resolvedCount}</div>
          </div>
          <span className="material-symbols-outlined icon-thick text-[32px] text-green-200">check_circle</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-[2rem] p-6 flex flex-col lg:flex-row gap-4 items-end shadow-sm">
        {/* Search */}
        <div className="flex-1 w-full relative">
          <label className="block text-xs font-mono text-gray-500 uppercase font-bold tracking-wider mb-2">
            Search Events
          </label>
          <div className="relative">
            <span className="material-symbols-outlined icon-thick absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search disasters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-cobalt focus:ring-2 focus:ring-azure rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-black placeholder:text-gray-400 outline-none transition-all"
            />
          </div>
        </div>

        {/* Status filter */}
        <div>
          <label className="block text-xs font-mono text-gray-500 uppercase font-bold tracking-wider mb-2">Status</label>
          <div className="flex gap-2">
            {(["All", "Active", "Resolved"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors border ${
                  statusFilter === s
                    ? s === "Active" ? "bg-red-500 text-white border-red-500 shadow-sm" : s === "Resolved" ? "bg-green-500 text-white border-green-500 shadow-sm" : "bg-cobalt border-cobalt text-white shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Type filter */}
        <div className="w-full lg:w-48">
          <label className="block text-xs font-mono text-gray-500 uppercase font-bold tracking-wider mb-2">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 focus:border-cobalt focus:ring-2 focus:ring-azure rounded-xl px-4 py-3 text-sm font-medium text-black outline-none transition-all"
          >
            <option value="All">All Types</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] flex flex-col shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                {["Disaster Name", "Type", "Division", "District", "Start Date", "End Date", "Duration", "Status"].map((h) => (
                  <th key={h} className="p-4 font-mono text-xs text-gray-500 uppercase tracking-wider font-bold bg-azure border-b border-gray-200 first:rounded-tl-xl last:rounded-tr-xl">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-black">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500 font-bold">
                    {disasters.length === 0 ? "No disaster events recorded yet." : "No disasters match your filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((d) => {
                  const isActive = !d.END_DATE;
                  const icon = TYPE_ICONS[d.DISASTER_TYPE] ?? "warning";
                  return (
                    <tr key={d.DISASTER_NAME} className="hover:bg-azure transition-colors group border-b border-gray-100 last:border-none">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`material-symbols-outlined icon-thick text-[18px] ${isActive ? "text-red-500" : "text-gray-400"}`}
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            {icon}
                          </span>
                          <span className="font-bold text-cobalt">{d.DISASTER_NAME}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-100 text-cobalt font-bold text-xs uppercase tracking-wide">
                          {d.DISASTER_TYPE}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{d.DIVISION}</td>
                      <td className="p-4 text-gray-600">{d.DISTRICT}</td>
                      <td className="p-4 font-mono text-gray-600">
                        {formatDate(d.START_DATE)}
                      </td>
                      <td className="p-4 font-mono font-bold">
                        {d.END_DATE ? <span className="text-gray-600">{formatDate(d.END_DATE)}</span> : <span className="text-red-500">Ongoing</span>}
                      </td>
                      <td className="p-4 font-mono font-bold text-gray-600">
                        {d.DURATION_DAYS != null ? `${d.DURATION_DAYS} days` : "—"}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wide ${isActive ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-red-500 animate-pulse" : "bg-green-500"}`} />
                          {isActive ? "Active" : "Resolved"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

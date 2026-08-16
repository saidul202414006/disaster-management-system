"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";
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

  if (loading) return <LoadingState message="Loading disaster events..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

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
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Disaster Events</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            <span className="text-emergency-red font-semibold">{activeCount} active</span>
            {" · "}
            <span className="text-on-surface-variant">{resolvedCount} resolved</span>
            {" · "}
            {disasters.length} total events
          </p>
        </div>
        <Link href="/disasters/new">
          <Button
            variant="primary"
            icon={<span className="material-symbols-outlined text-[18px]">add_alert</span>}
          >
            New Incident
          </Button>
        </Link>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Disasters", value: disasters.length, icon: "crisis_alert", color: "" },
          { label: "Active Now", value: activeCount, icon: "warning", color: "text-emergency-red" },
          { label: "Resolved", value: resolvedCount, icon: "check_circle", color: "text-stable-emerald" },
        ].map((item) => (
          <div key={item.label} className="bg-slate-surface border border-outline-variant rounded-lg p-4">
            <div className="flex items-center justify-between text-on-surface-variant mb-2">
              <span className="text-label-caps font-label-caps">{item.label}</span>
              <span className={`material-symbols-outlined text-[20px] ${item.color || "text-on-surface-variant"}`}>{item.icon}</span>
            </div>
            <div className={`text-display-kpi font-display-kpi text-on-surface ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">search</span>
          <input
            type="text"
            placeholder="Search disasters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-surface-dim border border-outline-variant focus:border-primary rounded-lg pl-8 pr-3 py-1.5 text-body-md font-body-md text-on-surface outline-none transition-colors w-52"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-2">
          {(["All", "Active", "Resolved"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-label-caps font-label-caps transition-colors ${
                statusFilter === s
                  ? s === "Active" ? "bg-emergency-red text-white" : s === "Resolved" ? "bg-stable-emerald text-white" : "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-1.5 text-body-md font-body-md text-on-surface outline-none transition-colors"
        >
          <option value="All">All Types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Result count */}
        <span className="text-label-caps font-label-caps text-on-surface-variant ml-auto">
          {filtered.length} of {disasters.length} shown
        </span>
      </div>

      {/* Table */}
      <div className="bg-slate-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-surface-container-low">
            <TableRow>
              <TableHead>Disaster Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <EmptyState
                message={disasters.length === 0 ? "No disaster events recorded yet." : "No disasters match your filters."}
                icon="crisis_alert"
              />
            ) : (
              filtered.map((d) => {
                const isActive = !d.END_DATE;
                const icon = TYPE_ICONS[d.DISASTER_TYPE] ?? "warning";
                return (
                  <TableRow key={d.DISASTER_NAME} className="hover:bg-surface-container-high transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`material-symbols-outlined text-[16px] ${isActive ? "text-emergency-red" : "text-on-surface-variant"}`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {icon}
                        </span>
                        <span className="font-medium text-on-surface">{d.DISASTER_NAME}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="warning">{d.DISASTER_TYPE}</Badge>
                    </TableCell>
                    <TableCell className="text-on-surface-variant">{d.DIVISION}</TableCell>
                    <TableCell className="text-on-surface-variant">{d.DISTRICT}</TableCell>
                    <TableCell className="font-data-mono text-data-mono text-on-surface-variant">
                      {formatDate(d.START_DATE)}
                    </TableCell>
                    <TableCell className="font-data-mono text-data-mono text-on-surface-variant">
                      {d.END_DATE ? formatDate(d.END_DATE) : <span className="text-emergency-red">Ongoing</span>}
                    </TableCell>
                    <TableCell className="font-data-mono text-data-mono text-on-surface-variant">
                      {d.DURATION_DAYS != null ? `${d.DURATION_DAYS} days` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isActive ? "danger" : "success"}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emergency-red animate-pulse" : "bg-stable-emerald"}`} />
                        {isActive ? "Active" : "Resolved"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

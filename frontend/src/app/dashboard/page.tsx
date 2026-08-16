"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getDashboardData } from "@/services/api";

// Quick actions are static UI config, not from DB
const QUICK_ACTIONS = [
  { id: 1, title: "Register Victim", icon: "person_add", iconColor: "text-command-blue", href: "/victims" },
  { id: 2, title: "New Incident", icon: "add_alert", iconColor: "text-emergency-red", href: "/disasters/new" },
  { id: 3, title: "Deploy Personnel", icon: "badge", iconColor: "text-stable-emerald", href: "/personnel" },
  { id: 4, title: "Public View", icon: "public", iconColor: "text-warning-amber", href: "/view/dashboard" },
];

type DashboardData = {
  kpis: {
    TOTAL_DISASTERS: number;
    ACTIVE_DISASTERS: number;
    TOTAL_VICTIMS: number;
    MISSING_VICTIMS: number;
    TOTAL_SHELTERS: number;
    TOTAL_PERSONNEL: number;
    TOTAL_WAREHOUSES: number;
    TOTAL_VEHICLES: number;
    AVAILABLE_VEHICLES: number;
    TOTAL_DONATIONS: number;
    TOTAL_DISTRIBUTIONS: number;
  };
  recent_disasters: Array<{
    DISASTER_NAME: string;
    DISASTER_TYPE: string;
    DIVISION: string;
    DISTRICT: string;
    START_DATE: string;
    END_DATE: string | null;
    DURATION_DAYS: number | null;
  }>;
  shelter_stats: Array<{
    SHELTER_ID: string;
    SHELTER_NAME: string;
    CAPACITY: number;
    CURRENT_OCCUPANCY: number;
    AVAILABLE_CAPACITY: number;
  }>;
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function handleLogout() {
    localStorage.removeItem("dms_token");
    localStorage.removeItem("dms_user");
    router.push("/admin/login");
  }

  useEffect(() => {
    getDashboardData()
      .then((res) => setData(res as unknown as DashboardData))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-on-surface-variant">
          <span className="material-symbols-outlined text-[48px] animate-spin text-primary">
            progress_activity
          </span>
          <p className="text-body-md font-body-md">Loading operational data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-slate-surface border border-emergency-red/30 rounded-lg p-8 max-w-md text-center">
          <span className="material-symbols-outlined text-emergency-red text-[48px]">error</span>
          <h2 className="text-headline-md font-headline-md text-on-surface mt-4">Backend Unreachable</h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-2">
            Cannot connect to the backend server. Make sure the backend is running on port 5000.
          </p>
          <p className="text-data-mono font-data-mono text-emergency-red/80 mt-4 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis;

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col gap-4 p-4 lg:p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface font-bold">Operations Dashboard</h1>
          <p className="text-label-caps font-label-caps text-on-surface-variant mt-0.5">Disaster Management System — Bangladesh</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/view/dashboard" target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-label-caps font-label-caps">
            <span className="material-symbols-outlined text-[16px] text-warning-amber">public</span>
            Public View
          </a>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:text-emergency-red hover:border-emergency-red/30 hover:bg-emergency-red/5 transition-colors text-label-caps font-label-caps">
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Logout
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Active Disasters */}
        <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
          <div className="absolute inset-0 bg-emergency-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-label-caps font-label-caps uppercase">Active Disasters</span>
            <span className="material-symbols-outlined text-[20px] text-emergency-red animate-pulse">warning</span>
          </div>
          <div className="text-display-kpi font-display-kpi text-on-surface mt-2">
            {kpis?.ACTIVE_DISASTERS ?? 0}
          </div>
          <div className="text-label-caps font-label-caps text-on-surface-variant mt-1">
            of {kpis?.TOTAL_DISASTERS ?? 0} total
          </div>
        </Card>

        {/* Total Victims */}
        <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-label-caps font-label-caps uppercase">Total Victims</span>
            <span className="material-symbols-outlined text-[20px]">personal_injury</span>
          </div>
          <div className="text-display-kpi font-display-kpi text-on-surface mt-2">
            {kpis?.TOTAL_VICTIMS?.toLocaleString() ?? 0}
          </div>
          <div className="text-label-caps font-label-caps text-emergency-red mt-1">
            {kpis?.MISSING_VICTIMS ?? 0} missing
          </div>
        </Card>

        {/* Total Shelters */}
        <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-label-caps font-label-caps uppercase">Shelters</span>
            <span className="material-symbols-outlined text-[20px]">night_shelter</span>
          </div>
          <div className="text-display-kpi font-display-kpi text-on-surface mt-2">
            {kpis?.TOTAL_SHELTERS ?? 0}
          </div>
          <div className="text-label-caps font-label-caps text-on-surface-variant mt-1">Total registered</div>
        </Card>

        {/* Personnel */}
        <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-label-caps font-label-caps uppercase">Personnel</span>
            <span className="material-symbols-outlined text-[20px]">badge</span>
          </div>
          <div className="text-display-kpi font-display-kpi text-on-surface mt-2">
            {kpis?.TOTAL_PERSONNEL ?? 0}
          </div>
          <div className="text-label-caps font-label-caps text-on-surface-variant mt-1">Registered staff</div>
        </Card>

        {/* Warehouses */}
        <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-label-caps font-label-caps uppercase">Warehouses</span>
            <span className="material-symbols-outlined text-[20px]">warehouse</span>
          </div>
          <div className="text-display-kpi font-display-kpi text-on-surface mt-2">
            {kpis?.TOTAL_WAREHOUSES ?? 0}
          </div>
          <div className="text-label-caps font-label-caps text-stable-emerald mt-1">
            {kpis?.TOTAL_DONATIONS ?? 0} donations stored
          </div>
        </Card>

        {/* Vehicles */}
        <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-label-caps font-label-caps uppercase">Vehicles</span>
            <span className="material-symbols-outlined text-[20px]">directions_car</span>
          </div>
          <div className="text-display-kpi font-display-kpi text-on-surface mt-2">
            {kpis?.TOTAL_VEHICLES ?? 0}
          </div>
          <div className="text-label-caps font-label-caps text-stable-emerald mt-1">
            {kpis?.AVAILABLE_VEHICLES ?? 0} available
          </div>
        </Card>

        {/* Quick Actions — span full width on last row */}
        <Card className="col-span-2 md:col-span-3 lg:col-span-8 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="text-label-caps font-label-caps text-on-surface-variant mb-3">Quick Actions</div>
          <div className="flex flex-wrap gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                className="flex items-center gap-3 px-4 py-2 rounded-lg border border-outline-variant hover:bg-surface-container-high hover:border-primary/30 transition-all"
              >
                <span className={`material-symbols-outlined text-[18px] ${action.iconColor}`}>
                  {action.icon}
                </span>
                <span className="text-body-md font-body-md text-on-surface">{action.title}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Recent Disasters Table */}
        <div className="col-span-12 lg:col-span-7 bg-slate-surface border border-outline-variant rounded-lg overflow-hidden">
          <div className="p-4 border-b border-outline-variant flex justify-between items-center">
            <h2 className="text-headline-md font-headline-md text-on-surface">Recent Disasters</h2>
            <Link href="/disasters/new" className="text-primary text-label-caps font-label-caps hover:underline">
              + New Incident
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  {["Name", "Type", "Division", "District", "Duration"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-label-caps font-label-caps text-on-surface-variant">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {data?.recent_disasters?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant text-body-md font-body-md">
                      No disasters recorded yet.
                    </td>
                  </tr>
                ) : (
                  data?.recent_disasters?.map((d) => (
                    <tr key={d.DISASTER_NAME} className="hover:bg-surface-container-high transition-colors">
                      <td className="px-4 py-3 text-data-mono font-data-mono text-primary">{d.DISASTER_NAME}</td>
                      <td className="px-4 py-3">
                        <Badge variant="warning">{d.DISASTER_TYPE}</Badge>
                      </td>
                      <td className="px-4 py-3 text-body-md font-body-md">{d.DIVISION}</td>
                      <td className="px-4 py-3 text-body-md font-body-md">{d.DISTRICT}</td>
                      <td className="px-4 py-3 text-data-mono font-data-mono text-on-surface-variant">
                        {d.DURATION_DAYS != null ? `${d.DURATION_DAYS} days` : "Ongoing"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shelter Capacity Panel */}
        <div className="col-span-12 lg:col-span-5 bg-slate-surface border border-outline-variant rounded-lg overflow-hidden">
          <div className="p-4 border-b border-outline-variant flex justify-between items-center">
            <h2 className="text-headline-md font-headline-md text-on-surface">Shelter Occupancy</h2>
            <Link href="/shelters" className="text-primary text-label-caps font-label-caps hover:underline">
              View All
            </Link>
          </div>
          <div className="p-4 flex flex-col gap-4">
            {data?.shelter_stats?.length === 0 ? (
              <p className="text-on-surface-variant text-body-md font-body-md text-center py-4">
                No shelters registered yet.
              </p>
            ) : (
              data?.shelter_stats?.map((s) => {
                const pct = s.CAPACITY > 0 ? Math.round((s.CURRENT_OCCUPANCY / s.CAPACITY) * 100) : 0;
                const barColor =
                  pct >= 90 ? "bg-emergency-red" : pct >= 70 ? "bg-warning-amber" : "bg-stable-emerald";
                return (
                  <div key={s.SHELTER_ID}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-body-md font-body-md text-on-surface">{s.SHELTER_NAME}</span>
                      <span className="text-data-mono font-data-mono text-on-surface-variant text-sm">
                        {s.CURRENT_OCCUPANCY} / {s.CAPACITY}
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                      <div
                        className={`${barColor} h-full rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-right text-label-caps font-label-caps text-on-surface-variant mt-0.5">
                      {pct}% occupancy
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

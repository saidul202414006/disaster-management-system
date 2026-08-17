"use client";

import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { getVehicles, createVehicle } from "@/services/api";

type Vehicle = {
  VEHICLE_ID: string;
  VEHICLE_TYPE: string;
  REGISTRATION_NO: string;
  CAPACITY: number;
  AVAILABILITY_STATUS: string;
};

const EMPTY = { vehicle_id: "", vehicle_type: "", registration_no: "", capacity: "", availability_status: "Available" };

export default function VehiclesPage() {
  const { data, loading, error, refetch } = useApi<Vehicle[]>(getVehicles as any);
  const vehicles = data ?? [];

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [typeFilter, setTypeFilter] = useState("All");

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-cobalt">
        <span className="material-symbols-outlined icon-thick text-[48px] animate-spin">progress_activity</span>
        <p className="font-bold">Loading fleet data...</p>
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

  const available = vehicles.filter((v) => v.AVAILABILITY_STATUS?.toLowerCase() === "available").length;
  const types = Array.from(new Set(vehicles.map((v) => v.VEHICLE_TYPE).filter(Boolean)));
  const filtered = typeFilter === "All" ? vehicles : vehicles.filter((v) => v.VEHICLE_TYPE === typeFilter);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function handleSubmit() {
    if (!form.vehicle_id || !form.vehicle_type || !form.registration_no) {
      setSubmitError("ID, Type and Registration No. are required.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createVehicle({ ...form, capacity: form.capacity ? Number(form.capacity) : null });
      setSubmitSuccess(true);
      refetch();
      setTimeout(() => { setShowForm(false); setSubmitSuccess(false); setForm(EMPTY); }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to register vehicle.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6 p-2 md:p-4">
        {/* Header */}
        <div className="bg-azure rounded-[2rem] p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 shadow-sm border border-blue-200">
          <div>
            <h1 className="font-display text-4xl text-black uppercase tracking-tight">Fleet Management</h1>
            <p className="font-bold text-black/70 mt-2 text-lg">
              <span className="text-green-600 bg-white px-2 py-1 rounded-lg text-sm mr-2">{available} available</span>
              {vehicles.length} total vehicles
            </p>
          </div>
          <button
            onClick={() => { setShowForm(true); setSubmitError(null); setSubmitSuccess(false); }}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-cobalt hover:bg-cobalt-dark rounded-xl text-white font-bold text-sm transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined icon-thick text-[18px]">directions_car</span>
            Register Vehicle
          </button>
        </div>

        {/* Type Filter */}
        {types.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-[2rem] p-4 flex flex-wrap gap-2 shadow-sm">
            {["All", ...types].map((t) => {
              const isActive = typeFilter === t;
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-5 py-3 rounded-xl font-bold text-sm transition-all border ${
                    isActive
                      ? "bg-cobalt text-white border-cobalt shadow-sm"
                      : "bg-white text-gray-600 border-transparent hover:bg-gray-50"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm flex flex-col min-h-[400px]">
          <div className="overflow-x-auto p-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  {["Vehicle ID", "Type", "Registration No.", "Capacity", "Status"].map((h) => (
                    <th key={h} className="p-4 font-mono text-xs text-gray-500 uppercase tracking-wider font-bold bg-azure border-b border-gray-200 first:rounded-tl-xl last:rounded-tr-xl">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-black">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <span className="material-symbols-outlined icon-thick text-[48px] text-gray-300">directions_car</span>
                      <p className="font-bold text-gray-500 mt-4">No vehicles match your filter.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((v) => {
                    const statusColor =
                      v.AVAILABILITY_STATUS?.toLowerCase() === "available" ? "bg-green-100 text-green-700"
                      : v.AVAILABILITY_STATUS?.toLowerCase() === "in use" ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-700";
                      
                    return (
                      <tr key={v.VEHICLE_ID} className="hover:bg-azure transition-colors border-b border-gray-100 last:border-none">
                        <td className="p-4 font-bold text-cobalt">{v.VEHICLE_ID}</td>
                        <td className="p-4 font-bold">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined icon-thick text-[18px] text-gray-400">directions_car</span>
                            {v.VEHICLE_TYPE}
                          </div>
                        </td>
                        <td className="p-4 font-mono text-gray-600">{v.REGISTRATION_NO}</td>
                        <td className="p-4 text-gray-600 font-bold">{v.CAPACITY?.toLocaleString() || "—"}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wide ${statusColor}`}>
                            {v.AVAILABILITY_STATUS}
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

      {/* ─── Add Vehicle Drawer ─── */}
      {showForm && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity" onClick={() => setShowForm(false)} />}
      <div className={`fixed inset-y-0 right-0 w-[480px] max-w-[90vw] bg-white border-l border-gray-200 shadow-2xl z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] flex flex-col ${showForm ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-azure shrink-0">
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-blue-100 transition-colors text-cobalt" onClick={() => setShowForm(false)}>
              <span className="material-symbols-outlined icon-thick">close</span>
            </button>
            <h3 className="font-display text-xl text-black">Register Vehicle</h3>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700 shadow-sm">
              <span className="material-symbols-outlined icon-thick">check_circle</span>
              <span className="font-bold text-sm">Vehicle registered successfully!</span>
            </div>
          )}
          {submitError && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm font-bold shadow-sm">{submitError}</div>}

          <div className="grid grid-cols-1 gap-4">
            {[
              { key: "vehicle_id", label: "Vehicle ID *", placeholder: "e.g., VH-001" },
              { key: "registration_no", label: "Registration No. *", placeholder: "e.g., DHK-1234" },
              { key: "capacity", label: "Capacity", placeholder: "e.g., 5000 (kg or units)", type: "number" },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="block font-mono text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
                <input
                  type={type || "text"}
                  placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-cobalt focus:ring-2 focus:ring-azure rounded-xl px-4 py-3 text-sm font-medium text-black placeholder:text-gray-400 outline-none transition-all"
                />
              </div>
            ))}
            
            <div>
              <label className="block font-mono text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Vehicle Type *</label>
              <select value={form.vehicle_type} onChange={(e) => set("vehicle_type", e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-cobalt focus:ring-2 focus:ring-azure rounded-xl px-4 py-3 text-sm font-medium text-black outline-none transition-all">
                <option value="">-- Select Type --</option>
                {["Truck", "Van", "Ambulance", "Helicopter", "Boat", "Motorcycle", "Other"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block font-mono text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
              <select value={form.availability_status} onChange={(e) => set("availability_status", e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-cobalt focus:ring-2 focus:ring-azure rounded-xl px-4 py-3 text-sm font-medium text-black outline-none transition-all">
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex shrink-0">
          <button 
            onClick={handleSubmit} 
            disabled={submitting} 
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-cobalt hover:bg-cobalt-dark text-white transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting ? <span className="material-symbols-outlined icon-thick animate-spin">progress_activity</span> : <span className="material-symbols-outlined icon-thick">save</span>}
            {submitting ? "Saving..." : "Register Vehicle"}
          </button>
        </div>
      </div>
    </>
  );
}

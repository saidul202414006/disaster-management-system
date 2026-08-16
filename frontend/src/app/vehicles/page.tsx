"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";
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

  if (loading) return <LoadingState message="Loading fleet data..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

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
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Fleet Management</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            <span className="text-stable-emerald font-semibold">{available} available</span> / {vehicles.length} total vehicles
          </p>
        </div>
        <Button
          variant="primary"
          icon={<span className="material-symbols-outlined text-[18px]">add</span>}
          onClick={() => { setShowForm(true); setSubmitError(null); setSubmitSuccess(false); }}
        >
          Register Vehicle
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-slate-surface border border-primary/30 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-headline-md font-headline-md text-on-surface">Register New Vehicle</h2>
            <button onClick={() => setShowForm(false)} className="text-on-surface-variant hover:text-on-surface p-1 rounded">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          {submitSuccess && (
            <div className="mb-4 bg-stable-emerald/10 border border-stable-emerald/40 rounded-lg p-3 flex items-center gap-2 text-stable-emerald text-body-md font-body-md">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Vehicle registered!
            </div>
          )}
          {submitError && <div className="mb-4 bg-emergency-red/10 border border-emergency-red/30 rounded-lg p-3 text-emergency-red text-body-md font-body-md">{submitError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "vehicle_id", label: "Vehicle ID *", placeholder: "e.g., VH-001" },
              { key: "registration_no", label: "Registration No. *", placeholder: "e.g., DHK-1234" },
              { key: "capacity", label: "Capacity", placeholder: "e.g., 5000 (kg or units)" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">{label}</label>
                <input
                  type={key === "capacity" ? "number" : "text"}
                  placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors"
                />
              </div>
            ))}
            <div>
              <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">Vehicle Type *</label>
              <select value={form.vehicle_type} onChange={(e) => set("vehicle_type", e.target.value)}
                className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors">
                <option value="">-- Select Type --</option>
                {["Truck", "Van", "Ambulance", "Helicopter", "Boat", "Motorcycle", "Other"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">Status</label>
              <select value={form.availability_status} onChange={(e) => set("availability_status", e.target.value)}
                className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors">
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={submitting}
              icon={submitting ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">save</span>}>
              {submitting ? "Saving..." : "Register Vehicle"}
            </Button>
          </div>
        </div>
      )}

      {/* Type Filter */}
      {types.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {["All", ...types].map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-full text-label-caps font-label-caps transition-colors ${
                typeFilter === t ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}>{t}</button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-surface-container-low">
            <TableRow>
              <TableHead>Vehicle ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Registration No.</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <EmptyState message={vehicles.length === 0 ? "No vehicles registered yet." : "No vehicles match filter."} icon="directions_car" />
            ) : (
              filtered.map((v) => {
                const statusColor =
                  v.AVAILABILITY_STATUS?.toLowerCase() === "available" ? "success"
                  : v.AVAILABILITY_STATUS?.toLowerCase() === "in use" ? "warning"
                  : "danger";
                return (
                  <TableRow key={v.VEHICLE_ID} className="hover:bg-surface-container-high transition-colors">
                    <TableCell className="font-data-mono text-data-mono text-primary">{v.VEHICLE_ID}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">directions_car</span>
                        <span className="text-on-surface">{v.VEHICLE_TYPE}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-data-mono text-data-mono text-on-surface-variant">{v.REGISTRATION_NO}</TableCell>
                    <TableCell className="text-on-surface-variant">{v.CAPACITY?.toLocaleString() || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={statusColor as any}>{v.AVAILABILITY_STATUS}</Badge>
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

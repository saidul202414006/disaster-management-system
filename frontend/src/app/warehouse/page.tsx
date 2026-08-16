"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingState, ErrorState, EmptyCard } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { getWarehouses, createWarehouse } from "@/services/api";
import { Card } from "@/components/ui/Card";

type Warehouse = {
  WAREHOUSE_ID: string;
  WAREHOUSE_NAME: string;
  LOCATION: string;
  CAPACITY: number;
  MANAGER_NAME: string;
  STATUS: string;
  TOTAL_DONATIONS_STORED: number;
  TOTAL_DONATION_VALUE: number;
};

const EMPTY = {
  warehouse_id: "", warehouse_name: "", location: "",
  capacity: "", manager_name: "", status: "Active",
};

export default function WarehousePage() {
  const { data, loading, error, refetch } = useApi<Warehouse[]>(getWarehouses as any);
  const warehouses = data ?? [];

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (loading) return <LoadingState message="Loading warehouse data..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const totalValue = warehouses.reduce((s, w) => s + (w.TOTAL_DONATION_VALUE || 0), 0);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function handleSubmit() {
    if (!form.warehouse_id || !form.warehouse_name || !form.location || !form.capacity) {
      setSubmitError("ID, Name, Location and Capacity are required.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createWarehouse({ ...form, capacity: Number(form.capacity) });
      setSubmitSuccess(true);
      refetch();
      setTimeout(() => { setShowForm(false); setSubmitSuccess(false); setForm(EMPTY); }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to create warehouse.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Warehouse Management</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            {warehouses.length} distribution points · Total value: ৳{totalValue.toLocaleString()}
          </p>
        </div>
        <Button
          variant="primary"
          icon={<span className="material-symbols-outlined text-[18px]">add</span>}
          onClick={() => { setShowForm(true); setSubmitError(null); setSubmitSuccess(false); }}
        >
          New Warehouse
        </Button>
      </div>

      {/* Inline Add Form */}
      {showForm && (
        <div className="bg-slate-surface border border-primary/30 rounded-xl p-5 shadow-lg animate-fade-down">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-headline-md font-headline-md text-on-surface">Register New Warehouse</h2>
            <button onClick={() => setShowForm(false)} className="text-on-surface-variant hover:text-on-surface p-1 rounded">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          {submitSuccess && (
            <div className="mb-4 bg-stable-emerald/10 border border-stable-emerald/40 rounded-lg p-3 flex items-center gap-2 text-stable-emerald text-body-md font-body-md">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Warehouse registered successfully!
            </div>
          )}
          {submitError && (
            <div className="mb-4 bg-emergency-red/10 border border-emergency-red/30 rounded-lg p-3 text-emergency-red text-body-md font-body-md">
              {submitError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "warehouse_id", label: "Warehouse ID *", placeholder: "e.g., WH-001" },
              { key: "warehouse_name", label: "Warehouse Name *", placeholder: "e.g., Dhaka Central Depot" },
              { key: "location", label: "Location *", placeholder: "e.g., Mirpur, Dhaka" },
              { key: "capacity", label: "Capacity *", placeholder: "Storage units (number)" },
              { key: "manager_name", label: "Manager Name", placeholder: "Full name" },
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
              <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors"
              >
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting}
              icon={submitting
                ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                : <span className="material-symbols-outlined text-[18px]">save</span>
              }
            >
              {submitting ? "Saving..." : "Register Warehouse"}
            </Button>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      {warehouses.length === 0 ? (
        <div className="bg-slate-surface border border-outline-variant rounded-lg">
          <EmptyCard message="No warehouses registered yet. Click 'New Warehouse' to add one." icon="warehouse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {warehouses.map((wh) => {
            const statusVariant =
              wh.STATUS?.toUpperCase() === "ACTIVE" ? "success"
              : wh.STATUS?.toUpperCase() === "MAINTENANCE" ? "danger"
              : "warning";
            const indicatorColor =
              statusVariant === "success" ? "bg-stable-emerald"
              : statusVariant === "danger" ? "bg-emergency-red"
              : "bg-warning-amber";

            return (
              <div
                key={wh.WAREHOUSE_ID}
                className="bg-slate-surface border border-outline-variant rounded-lg p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary-container group relative overflow-hidden flex flex-col"
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${indicatorColor} rounded-l-lg`} />
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-headline-md font-headline-md text-on-surface">{wh.WAREHOUSE_NAME}</h3>
                    <p className="text-body-md font-body-md text-on-surface-variant flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {wh.LOCATION}
                    </p>
                  </div>
                  <Badge variant={statusVariant as any}>
                    <span className="material-symbols-outlined text-[12px]">
                      {statusVariant === "success" ? "check_circle" : statusVariant === "danger" ? "build" : "warning"}
                    </span>
                    {wh.STATUS}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Capacity", value: wh.CAPACITY?.toLocaleString() },
                    { label: "Donations Stored", value: wh.TOTAL_DONATIONS_STORED ?? 0 },
                    { label: "Total Value", value: `৳${(wh.TOTAL_DONATION_VALUE ?? 0).toLocaleString()}`, color: "text-stable-emerald" },
                    { label: "Manager", value: wh.MANAGER_NAME || "—" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-surface-container-low rounded p-3">
                      <div className="text-label-caps font-label-caps text-on-surface-variant mb-1">{label}</div>
                      <div className={`text-data-mono font-data-mono text-on-surface ${color || ""}`}>{value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-outline-variant flex justify-between items-center">
                  <span className="text-data-mono font-data-mono text-on-surface-variant text-[11px] bg-surface-container px-2 py-1 rounded">
                    {wh.WAREHOUSE_ID}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

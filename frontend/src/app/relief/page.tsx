"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { getDistributions, createDistribution, getWarehouses, getPersonnel, getVehicles } from "@/services/api";

type Distribution = {
  DISTRIBUTION_ID: string;
  DISTRIBUTION_DATE: string;
  QUANTITY: number;
  WAREHOUSE_ID: string;
  WAREHOUSE_NAME: string;
  PERSON_ID: string;
  PERSONNEL_NAME: string;
  VEHICLE_ID: string;
  VEHICLE_TYPE: string;
  REGISTRATION_NO: string;
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-BD", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric" });
}

export default function ReliefPage() {
  const { data, loading, error, refetch } = useApi<Distribution[]>(getDistributions as any);
  const { data: warehouses } = useApi<{ WAREHOUSE_ID: string; WAREHOUSE_NAME: string }[]>(getWarehouses as any);
  const { data: personnel } = useApi<{ PERSON_ID: string; NAME: string }[]>(getPersonnel as any);
  const { data: vehicles } = useApi<{ VEHICLE_ID: string; VEHICLE_TYPE: string; REGISTRATION_NO: string }[]>(getVehicles as any);

  const distributions = data ?? [];

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form, setForm] = useState({
    distribution_id: "", warehouse_id: "", person_id: "",
    distribution_date: new Date().toISOString().split("T")[0],
    quantity: "", vehicle_id: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (loading) return <LoadingState message="Loading relief distribution data..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const totalQty = distributions.reduce((sum, d) => sum + (d.QUANTITY ?? 0), 0);

  const setField = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const openAdd = () => {
    setForm({ distribution_id: "", warehouse_id: "", person_id: "", distribution_date: new Date().toISOString().split("T")[0], quantity: "", vehicle_id: "" });
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsDrawerOpen(true);
  };

  async function handleSubmit() {
    if (!form.distribution_id || !form.warehouse_id || !form.person_id || !form.quantity) {
      setSubmitError("Distribution ID, Warehouse, Personnel, and Quantity are required.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createDistribution({
        distribution_id: form.distribution_id,
        warehouse_id: form.warehouse_id,
        person_id: form.person_id,
        distribution_date: form.distribution_date,
        quantity: parseInt(form.quantity),
        vehicle_id: form.vehicle_id || null,
      });
      setSubmitSuccess(true);
      refetch();
      setTimeout(() => setIsDrawerOpen(false), 1500);
    } catch (err: any) {
      setSubmitError(err.message ?? "Failed to create distribution");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Relief Distribution</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            {distributions.length} distribution records — Total quantity: {totalQty.toLocaleString()}
          </p>
        </div>
        <Button
          variant="primary"
          icon={<span className="material-symbols-outlined text-[18px]">local_shipping</span>}
          onClick={openAdd}
        >
          New Distribution
        </Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Distributions", value: distributions.length, icon: "local_shipping" },
          { label: "Total Quantity", value: totalQty.toLocaleString(), icon: "inventory" },
          { label: "With Vehicle", value: distributions.filter((d) => d.VEHICLE_ID).length, icon: "directions_car" },
        ].map((item) => (
          <div key={item.label} className="bg-slate-surface border border-outline-variant rounded-lg p-4">
            <div className="flex items-center justify-between text-on-surface-variant mb-2">
              <span className="text-label-caps font-label-caps">{item.label}</span>
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            </div>
            <div className="text-display-kpi font-display-kpi text-on-surface">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Distribution Table */}
      <div className="bg-slate-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline-variant flex items-center justify-between">
          <h2 className="text-headline-md font-headline-md text-on-surface">Distribution Log</h2>
          <span className="text-label-caps font-label-caps text-on-surface-variant">
            WAREHOUSE ↔ PERSONNEL (Aggregation Relationship)
          </span>
        </div>
        <Table>
          <TableHeader className="bg-surface-container-low">
            <TableRow>
              <TableHead>Dist. ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Personnel</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Vehicle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {distributions.length === 0 ? (
              <EmptyState message="No distribution records yet." icon="local_shipping" />
            ) : (
              distributions.map((d) => (
                <TableRow key={d.DISTRIBUTION_ID} className="hover:bg-surface-container-high transition-colors">
                  <TableCell className="font-data-mono text-data-mono text-primary">{d.DISTRIBUTION_ID}</TableCell>
                  <TableCell className="font-data-mono text-data-mono text-on-surface-variant">{formatDate(d.DISTRIBUTION_DATE)}</TableCell>
                  <TableCell>
                    <div className="text-on-surface font-medium">{d.WAREHOUSE_NAME || d.WAREHOUSE_ID}</div>
                    <div className="text-[11px] text-on-surface-variant font-data-mono">{d.WAREHOUSE_ID}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-on-surface">{d.PERSONNEL_NAME || d.PERSON_ID}</div>
                    <div className="text-[11px] text-on-surface-variant font-data-mono">{d.PERSON_ID}</div>
                  </TableCell>
                  <TableCell className="font-data-mono text-data-mono text-on-surface">{d.QUANTITY?.toLocaleString()}</TableCell>
                  <TableCell>
                    {d.VEHICLE_ID ? (
                      <div>
                        <div className="text-on-surface-variant text-sm">{d.VEHICLE_TYPE}</div>
                        <div className="text-[11px] font-data-mono text-on-surface-variant">{d.REGISTRATION_NO}</div>
                      </div>
                    ) : (
                      <span className="text-on-surface-variant/50 text-sm">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ─── Add Distribution Drawer ─── */}
      {isDrawerOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsDrawerOpen(false)} />}
      <div className={`fixed inset-y-0 right-0 w-[440px] max-w-[90vw] bg-surface border-l border-outline-variant shadow-2xl z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] flex flex-col ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center p-4 border-b border-outline-variant bg-surface-container-low shrink-0">
          <div className="flex items-center gap-3">
            <button className="p-1.5 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant" onClick={() => setIsDrawerOpen(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-headline-md font-headline-md text-on-surface font-semibold">New Distribution Record</h3>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {submitSuccess && (
            <div className="bg-stable-emerald/10 border border-stable-emerald/40 rounded-lg p-4 flex items-center gap-3 text-stable-emerald">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-body-md font-body-md">Distribution created successfully!</span>
            </div>
          )}
          {submitError && <div className="bg-emergency-red/10 border border-emergency-red/30 rounded-lg p-3 text-emergency-red text-body-md font-body-md">{submitError}</div>}

          <div>
            <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">Distribution ID *</label>
            <input type="text" placeholder="e.g., DIST-004" value={form.distribution_id} onChange={(e) => setField("distribution_id", e.target.value)}
              className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">Warehouse *</label>
            <select value={form.warehouse_id} onChange={(e) => setField("warehouse_id", e.target.value)}
              className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors">
              <option value="">-- Select Warehouse --</option>
              {(warehouses ?? []).map((w: any) => <option key={w.WAREHOUSE_ID} value={w.WAREHOUSE_ID}>{w.WAREHOUSE_NAME} ({w.WAREHOUSE_ID})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">Personnel *</label>
            <select value={form.person_id} onChange={(e) => setField("person_id", e.target.value)}
              className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors">
              <option value="">-- Select Personnel --</option>
              {(personnel ?? []).map((p: any) => <option key={p.PERSON_ID} value={p.PERSON_ID}>{p.NAME} ({p.PERSON_ID})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">Distribution Date</label>
            <input type="date" value={form.distribution_date} onChange={(e) => setField("distribution_date", e.target.value)}
              className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">Quantity *</label>
            <input type="number" placeholder="e.g., 500" value={form.quantity} onChange={(e) => setField("quantity", e.target.value)}
              className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">Vehicle (optional)</label>
            <select value={form.vehicle_id} onChange={(e) => setField("vehicle_id", e.target.value)}
              className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors">
              <option value="">-- None --</option>
              {(vehicles ?? []).map((v: any) => <option key={v.VEHICLE_ID} value={v.VEHICLE_ID}>{v.VEHICLE_TYPE} — {v.REGISTRATION_NO}</option>)}
            </select>
          </div>
        </div>
        <div className="p-4 border-t border-outline-variant shrink-0">
          <Button variant="primary" onClick={handleSubmit} disabled={submitting} className="w-full justify-center">
            {submitting ? "Saving..." : "Create Distribution"}
          </Button>
        </div>
      </div>
    </div>
  );
}

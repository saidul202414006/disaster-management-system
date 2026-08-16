"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { getDonations, createDonation, getWarehouses } from "@/services/api";

type Donation = {
  DONATION_ID: string;
  DONOR_NAME: string;
  DONOR_ID: string;
  CONTACT_INFO: string;
  DONATION_TYPE: string;
  AMOUNT_OR_VALUE: number;
  DONATION_DATE: string;
  WAREHOUSE_ID: string;
  WAREHOUSE_NAME: string;
};

type Warehouse = { WAREHOUSE_ID: string; WAREHOUSE_NAME: string; };

const EMPTY = {
  donation_id: "", donor_name: "", donor_id: "", contact_info: "",
  donation_type: "Cash", amount_or_value: "", donation_date: "", warehouse_id: "",
};

export default function DonationsPage() {
  const { data, loading, error, refetch } = useApi<Donation[]>(getDonations as any);
  const { data: warehouses } = useApi<Warehouse[]>(getWarehouses as any);
  const donations = data ?? [];

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");

  if (loading) return <LoadingState message="Loading donations..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const totalValue = donations.reduce((sum, d) => sum + (d.AMOUNT_OR_VALUE ?? 0), 0);
  const donationTypes = Array.from(new Set(donations.map((d) => d.DONATION_TYPE).filter(Boolean)));

  const filtered = donations.filter((d) => {
    const matchType = typeFilter === "All" || d.DONATION_TYPE === typeFilter;
    const matchSearch =
      search === "" ||
      d.DONOR_NAME.toLowerCase().includes(search.toLowerCase()) ||
      d.DONATION_ID.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function handleSubmit() {
    if (!form.donation_id || !form.donor_name || !form.donation_type || !form.warehouse_id) {
      setSubmitError("ID, Donor Name, Type and Warehouse are required.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createDonation({
        ...form,
        amount_or_value: form.amount_or_value ? Number(form.amount_or_value) : null,
        donation_date: form.donation_date || null,
      });
      setSubmitSuccess(true);
      refetch();
      setTimeout(() => { setShowForm(false); setSubmitSuccess(false); setForm(EMPTY); }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to record donation.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Donations</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            {donations.length} records — Total value: <span className="text-stable-emerald font-semibold">৳{totalValue.toLocaleString()}</span>
          </p>
        </div>
        <Button variant="primary"
          icon={<span className="material-symbols-outlined text-[18px]">volunteer_activism</span>}
          onClick={() => { setShowForm(true); setSubmitError(null); setSubmitSuccess(false); }}>
          Record Donation
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-slate-surface border border-primary/30 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-headline-md font-headline-md text-on-surface">Record New Donation</h2>
            <button onClick={() => setShowForm(false)} className="text-on-surface-variant hover:text-on-surface p-1 rounded">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          {submitSuccess && (
            <div className="mb-4 bg-stable-emerald/10 border border-stable-emerald/40 rounded-lg p-3 flex items-center gap-2 text-stable-emerald text-body-md font-body-md">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Donation recorded!
            </div>
          )}
          {submitError && <div className="mb-4 bg-emergency-red/10 border border-emergency-red/30 rounded-lg p-3 text-emergency-red text-body-md font-body-md">{submitError}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "donation_id", label: "Donation ID *", placeholder: "e.g., DON-001" },
              { key: "donor_name", label: "Donor Name *", placeholder: "Full name or Organization" },
              { key: "donor_id", label: "Donor ID", placeholder: "NID or reference" },
              { key: "contact_info", label: "Contact Info", placeholder: "Phone or email" },
              { key: "amount_or_value", label: "Amount / Value (৳)", placeholder: "e.g., 50000" },
              { key: "donation_date", label: "Donation Date", placeholder: "", type: "date" },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">{label}</label>
                <input
                  type={type || (key === "amount_or_value" ? "number" : "text")}
                  placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors"
                />
              </div>
            ))}
            <div>
              <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">Donation Type *</label>
              <select value={form.donation_type} onChange={(e) => set("donation_type", e.target.value)}
                className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors">
                {["Cash", "Food", "Medicine", "Clothing", "Equipment", "Other"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">Warehouse *</label>
              <select value={form.warehouse_id} onChange={(e) => set("warehouse_id", e.target.value)}
                className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors">
                <option value="">-- Select Warehouse --</option>
                {(warehouses ?? []).map((w: any) => (
                  <option key={w.WAREHOUSE_ID} value={w.WAREHOUSE_ID}>{w.WAREHOUSE_NAME}</option>
                ))}
              </select>
              {(!warehouses || warehouses.length === 0) && (
                <p className="text-label-caps font-label-caps text-warning-amber mt-1">No warehouses found — add one first.</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={submitting}
              icon={submitting ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">save</span>}>
              {submitting ? "Saving..." : "Record Donation"}
            </Button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Donations", value: donations.length, icon: "volunteer_activism", color: "" },
          { label: "Cash", value: donations.filter((d) => d.DONATION_TYPE?.toLowerCase() === "cash").length, icon: "payments", color: "" },
          { label: "In-Kind", value: donations.filter((d) => d.DONATION_TYPE?.toLowerCase() !== "cash").length, icon: "inventory", color: "" },
          { label: "Total Value", value: `৳${totalValue.toLocaleString()}`, icon: "attach_money", color: "text-stable-emerald" },
        ].map((item) => (
          <div key={item.label} className="bg-slate-surface border border-outline-variant rounded-lg p-4">
            <div className="flex items-center justify-between text-on-surface-variant mb-2">
              <span className="text-label-caps font-label-caps">{item.label}</span>
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            </div>
            <div className={`text-display-kpi font-display-kpi text-on-surface ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">search</span>
          <input type="text" placeholder="Search donor..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-surface-dim border border-outline-variant focus:border-primary rounded-lg pl-8 pr-3 py-1.5 text-body-md font-body-md text-on-surface outline-none transition-colors w-48"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", ...donationTypes].map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-full text-label-caps font-label-caps transition-colors ${typeFilter === t ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-surface-container-low">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Donor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount / Value</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Warehouse</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <EmptyState message={donations.length === 0 ? "No donations recorded yet." : "No donations match your filters."} icon="volunteer_activism" />
            ) : (
              filtered.map((d) => (
                <TableRow key={d.DONATION_ID} className="hover:bg-surface-container-high transition-colors">
                  <TableCell className="font-data-mono text-data-mono text-primary">{d.DONATION_ID}</TableCell>
                  <TableCell>
                    <div className="font-medium text-on-surface">{d.DONOR_NAME}</div>
                    {d.CONTACT_INFO && <div className="text-[11px] text-on-surface-variant">{d.CONTACT_INFO}</div>}
                  </TableCell>
                  <TableCell><Badge variant="info">{d.DONATION_TYPE}</Badge></TableCell>
                  <TableCell className="font-data-mono text-data-mono text-stable-emerald">
                    {d.AMOUNT_OR_VALUE != null ? `৳${Number(d.AMOUNT_OR_VALUE).toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell className="text-on-surface-variant">
                    {d.DONATION_DATE ? new Date(d.DONATION_DATE).toLocaleDateString("en-BD", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </TableCell>
                  <TableCell className="text-on-surface-variant">{d.WAREHOUSE_NAME}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

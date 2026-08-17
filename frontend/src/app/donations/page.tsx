"use client";

import { useState } from "react";
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

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-cobalt">
        <span className="material-symbols-outlined icon-thick text-[48px] animate-spin">progress_activity</span>
        <p className="font-bold">Loading donations...</p>
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
    <>
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6 p-2 md:p-4">
        {/* Header */}
        <div className="bg-azure rounded-[2rem] p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 shadow-sm border border-blue-200">
          <div>
            <h1 className="font-display text-4xl text-black uppercase tracking-tight">Donations Registry</h1>
            <p className="font-bold text-black/70 mt-2 text-lg">
              {donations.length} records · Total value: <span className="text-green-600">৳{totalValue.toLocaleString()}</span>
            </p>
          </div>
          <button
            onClick={() => { setShowForm(true); setSubmitError(null); setSubmitSuccess(false); }}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-cobalt hover:bg-cobalt-dark rounded-xl text-white font-bold text-sm transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined icon-thick text-[18px]">volunteer_activism</span>
            Record Donation
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { label: "Total Donations", value: donations.length, icon: "volunteer_activism", color: "text-black" },
            { label: "Cash Contributions", value: donations.filter((d) => d.DONATION_TYPE?.toLowerCase() === "cash").length, icon: "payments", color: "text-green-600" },
            { label: "In-Kind Items", value: donations.filter((d) => d.DONATION_TYPE?.toLowerCase() !== "cash").length, icon: "inventory_2", color: "text-cobalt" },
            { label: "Total Value", value: `৳${totalValue.toLocaleString()}`, icon: "account_balance", color: "text-green-600" },
          ].map((item) => (
            <div key={item.label} className="bg-white border border-gray-200 rounded-[2rem] p-6 flex justify-between items-center shadow-sm">
              <div>
                <div className="font-mono text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{item.label}</div>
                <div className={`font-display text-3xl leading-none ${item.color}`}>{item.value}</div>
              </div>
              <span className="material-symbols-outlined icon-thick text-[32px] text-gray-300">{item.icon}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-[2rem] p-6 flex flex-col lg:flex-row gap-4 items-end shadow-sm">
          {/* Search */}
          <div className="flex-1 w-full relative">
            <label className="block text-xs font-mono text-gray-500 uppercase font-bold tracking-wider mb-2">
              Search Donors
            </label>
            <div className="relative">
              <span className="material-symbols-outlined icon-thick absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search donor name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-cobalt focus:ring-2 focus:ring-azure rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-black placeholder:text-gray-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="w-full lg:w-auto">
            <label className="block text-xs font-mono text-gray-500 uppercase font-bold tracking-wider mb-2">Filter Type</label>
            <div className="flex gap-2 flex-wrap">
              {["All", ...donationTypes].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                    typeFilter === t
                      ? "bg-cobalt text-white border-cobalt shadow-sm"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm flex flex-col min-h-[400px]">
          <div className="overflow-x-auto p-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  {["ID", "Donor", "Type", "Amount / Value", "Date", "Warehouse"].map((h) => (
                    <th key={h} className="p-4 font-mono text-xs text-gray-500 uppercase tracking-wider font-bold bg-azure border-b border-gray-200 first:rounded-tl-xl last:rounded-tr-xl">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-black">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <span className="material-symbols-outlined icon-thick text-[48px] text-gray-300">volunteer_activism</span>
                      <p className="font-bold text-gray-500 mt-4">No donations match your filters.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => (
                    <tr key={d.DONATION_ID} className="hover:bg-azure transition-colors border-b border-gray-100 last:border-none">
                      <td className="p-4 font-bold text-cobalt">{d.DONATION_ID}</td>
                      <td className="p-4">
                        <div className="font-bold">{d.DONOR_NAME}</div>
                        {d.CONTACT_INFO && <div className="font-mono text-xs text-gray-500 mt-0.5">{d.CONTACT_INFO}</div>}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-100 text-cobalt font-bold text-xs uppercase tracking-wide">
                          {d.DONATION_TYPE}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-green-600">
                        {d.AMOUNT_OR_VALUE != null ? `৳${Number(d.AMOUNT_OR_VALUE).toLocaleString()}` : "—"}
                      </td>
                      <td className="p-4 font-mono font-bold text-gray-600">
                        {d.DONATION_DATE ? new Date(d.DONATION_DATE).toLocaleDateString("en-BD", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="p-4 text-gray-600">{d.WAREHOUSE_NAME}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── Add Donation Drawer ─── */}
      {showForm && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity" onClick={() => setShowForm(false)} />}
      <div className={`fixed inset-y-0 right-0 w-[480px] max-w-[90vw] bg-white border-l border-gray-200 shadow-2xl z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] flex flex-col ${showForm ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-azure shrink-0">
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-blue-100 transition-colors text-cobalt" onClick={() => setShowForm(false)}>
              <span className="material-symbols-outlined icon-thick">close</span>
            </button>
            <h3 className="font-display text-xl text-black">Record Donation</h3>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700 shadow-sm">
              <span className="material-symbols-outlined icon-thick">check_circle</span>
              <span className="font-bold text-sm">Donation recorded successfully!</span>
            </div>
          )}
          {submitError && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm font-bold shadow-sm">{submitError}</div>}

          {[
            { key: "donation_id", label: "Donation ID *", placeholder: "e.g., DON-001" },
            { key: "donor_name", label: "Donor Name *", placeholder: "Full name or Organization" },
            { key: "donor_id", label: "Donor ID", placeholder: "NID or reference" },
            { key: "contact_info", label: "Contact Info", placeholder: "Phone or email" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block font-mono text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
              <input
                type="text"
                placeholder={placeholder}
                value={(form as any)[key]}
                onChange={(e) => set(key, e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-cobalt focus:ring-2 focus:ring-azure rounded-xl px-4 py-3 text-sm font-medium text-black placeholder:text-gray-400 outline-none transition-all"
              />
            </div>
          ))}

          <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex flex-col gap-4">
            <div>
              <label className="block font-mono text-xs font-bold text-green-700 uppercase tracking-wider mb-2">Amount / Value (৳)</label>
              <input
                type="number"
                placeholder="e.g., 50000"
                value={form.amount_or_value}
                onChange={(e) => set("amount_or_value", e.target.value)}
                className="w-full bg-white border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-3 text-sm font-medium text-black placeholder:text-gray-400 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block font-mono text-xs font-bold text-green-700 uppercase tracking-wider mb-2">Donation Type *</label>
              <select value={form.donation_type} onChange={(e) => set("donation_type", e.target.value)}
                className="w-full bg-white border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-3 text-sm font-medium text-black outline-none transition-all">
                {["Cash", "Food", "Medicine", "Clothing", "Equipment", "Other"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Donation Date</label>
              <input
                type="date"
                value={form.donation_date}
                onChange={(e) => set("donation_date", e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-cobalt focus:ring-2 focus:ring-azure rounded-xl px-4 py-3 text-sm font-medium text-black outline-none transition-all"
              />
            </div>
            <div>
              <label className="block font-mono text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Warehouse *</label>
              <select value={form.warehouse_id} onChange={(e) => set("warehouse_id", e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-cobalt focus:ring-2 focus:ring-azure rounded-xl px-4 py-3 text-sm font-medium text-black outline-none transition-all">
                <option value="">-- Select Warehouse --</option>
                {(warehouses ?? []).map((w: any) => (
                  <option key={w.WAREHOUSE_ID} value={w.WAREHOUSE_ID}>{w.WAREHOUSE_NAME}</option>
                ))}
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
            {submitting ? "Saving..." : "Record Donation"}
          </button>
        </div>
      </div>
    </>
  );
}

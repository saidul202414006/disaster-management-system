"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingState, ErrorState, EmptyCard } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { getShelters, createShelter, getDisasters } from "@/services/api";

type Shelter = {
  SHELTER_ID: string;
  SHELTER_NAME: string;
  CURRENT_STATUS: string;
  CONTACT_PERSON_NAME: string;
  CONTACT_PERSON_PHONE: string;
  ADDRESS_LINE: string;
  LONGITUDE: string;
  LATITUDE: string;
  CAPACITY: number;
  DISASTER_NAME: string;
  DIVISION: string;
  DISTRICT: string;
  CURRENT_OCCUPANCY: number;
  AVAILABLE_CAPACITY: number;
};

export default function SheltersPage() {
  const { data, loading, error, refetch } = useApi<Shelter[]>(getShelters as any);
  const { data: disasters } = useApi<{ DISASTER_NAME: string }[]>(getDisasters as any);
  const shelters = data ?? [];

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form, setForm] = useState({
    shelter_id: "", shelter_name: "", capacity: "", current_status: "Open",
    contact_person_name: "", contact_person_phone: "",
    address_line: "", latitude: "", longitude: "", disaster_name: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ─── Real working filters ───
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [divisionFilter, setDivisionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  if (loading) return <LoadingState message="Loading shelter data..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  async function handleAddShelter() {
    if (!form.shelter_id || !form.shelter_name || !form.capacity) {
      setSubmitError("Shelter ID, Name, and Capacity are required.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createShelter({
        ...form,
        capacity: parseInt(form.capacity),
        disaster_name: form.disaster_name || null,
        latitude: form.latitude || null,
        longitude: form.longitude || null,
      });
      setSubmitSuccess(true);
      refetch();
      setTimeout(() => setIsDrawerOpen(false), 1500);
    } catch (err: any) {
      setSubmitError(err.message ?? "Failed to add shelter");
    } finally {
      setSubmitting(false);
    }
  }

  const setField = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  // Derive unique values from actual data
  const allStatuses = Array.from(new Set(shelters.map((s) => s.CURRENT_STATUS).filter(Boolean)));
  const allDivisions = Array.from(new Set(shelters.map((s) => s.DIVISION).filter(Boolean)));

  // Apply filters
  const filtered = shelters.filter((s) => {
    const matchesStatus = statusFilters.size === 0 || statusFilters.has(s.CURRENT_STATUS);
    const matchesDivision = divisionFilter === "all" || s.DIVISION === divisionFilter;
    const matchesSearch =
      searchQuery === "" ||
      s.SHELTER_NAME.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.DISTRICT || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.SHELTER_ID || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesDivision && matchesSearch;
  });

  const toggleStatus = (status: string) => {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  // Summary from filtered results
  const totalCapacity = filtered.reduce((sum, s) => sum + (s.CAPACITY || 0), 0);
  const totalOccupied = filtered.reduce((sum, s) => sum + (s.CURRENT_OCCUPANCY || 0), 0);
  const totalAvailable = filtered.reduce((sum, s) => sum + (s.AVAILABLE_CAPACITY || 0), 0);

  return (
    <>
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col md:flex-row gap-6 h-[calc(100vh-48px)]">
      {/* Left Filter Sidebar */}
      <aside className="w-full md:w-[240px] shrink-0 flex flex-col gap-4">
        {/* Search */}
        <div className="bg-slate-surface border border-outline-variant rounded-lg p-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search shelters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-dim border border-outline-variant text-on-surface rounded pl-8 pr-3 py-1.5 text-body-md font-body-md focus:ring-2 focus:ring-primary-container focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-slate-surface border border-outline-variant rounded-lg p-4">
          <h2 className="text-body-lg font-body-lg text-on-surface mb-4 pb-2 border-b border-outline-variant flex items-center justify-between">
            Filters
            {(statusFilters.size > 0 || divisionFilter !== "all" || searchQuery) && (
              <button
                onClick={() => { setStatusFilters(new Set()); setDivisionFilter("all"); setSearchQuery(""); }}
                className="text-label-caps font-label-caps text-primary hover:underline"
              >
                Clear
              </button>
            )}
          </h2>

          {/* Status Filter — real data-driven */}
          <div className="mb-4">
            <h3 className="text-label-caps font-label-caps text-on-surface-variant mb-2">Status</h3>
            {allStatuses.length === 0 ? (
              <p className="text-label-caps font-label-caps text-on-surface-variant">No shelters yet</p>
            ) : (
              allStatuses.map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer mb-2 group" onClick={() => toggleStatus(s)}>
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      statusFilters.has(s)
                        ? "border-primary bg-primary"
                        : "border-outline-variant group-hover:border-primary"
                    }`}
                  >
                    {statusFilters.has(s) && (
                      <span className="material-symbols-outlined text-on-primary text-[12px]">check</span>
                    )}
                  </div>
                  <span className="text-body-md font-body-md text-on-surface-variant group-hover:text-on-surface">
                    {s}
                  </span>
                  <span className="ml-auto text-data-mono font-data-mono text-[11px] text-on-surface-variant">
                    {shelters.filter((sh) => sh.CURRENT_STATUS === s).length}
                  </span>
                </label>
              ))
            )}
          </div>

          {/* Division Filter — real data-driven */}
          <div>
            <h3 className="text-label-caps font-label-caps text-on-surface-variant mb-2">Division</h3>
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="w-full bg-surface-dim border-2 border-outline-variant text-on-surface rounded py-2 px-3 text-body-md font-body-md focus:border-primary focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Divisions</option>
              {allDivisions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary KPIs — from filtered results */}
        <div className="bg-slate-surface border border-outline-variant rounded-lg p-4">
          <h2 className="text-label-caps font-label-caps text-on-surface-variant mb-3">
            Summary {filtered.length !== shelters.length && `(${filtered.length} filtered)`}
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { label: "Shelters shown", value: filtered.length, color: "" },
              { label: "Total Capacity", value: totalCapacity.toLocaleString(), color: "" },
              { label: "Occupied", value: totalOccupied.toLocaleString(), color: "text-emergency-red" },
              { label: "Available", value: totalAvailable.toLocaleString(), color: "text-stable-emerald" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between">
                <span className="text-body-md font-body-md text-on-surface-variant">{label}</span>
                <span className={`text-data-mono font-data-mono text-on-surface ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-headline-lg font-headline-lg text-on-surface">Shelter Management</h1>
            <p className="text-body-md font-body-md text-on-surface-variant mt-1">
              {filtered.length} of {shelters.length} facilities
              {statusFilters.size > 0 && ` · ${Array.from(statusFilters).join(", ")}`}
              {divisionFilter !== "all" && ` · ${divisionFilter}`}
            </p>
          </div>
          <Button
            variant="primary"
            icon={<span className="material-symbols-outlined text-[18px]">add_location_alt</span>}
            onClick={() => { setForm({ shelter_id: "", shelter_name: "", capacity: "", current_status: "Open", contact_person_name: "", contact_person_phone: "", address_line: "", latitude: "", longitude: "", disaster_name: "" }); setSubmitError(null); setSubmitSuccess(false); setIsDrawerOpen(true); }}
          >
            New Registration
          </Button>
        </div>

        {/* Cards Grid */}
        {filtered.length === 0 ? (
          <div className="bg-slate-surface border border-outline-variant rounded-lg">
            <EmptyCard
              message={shelters.length === 0 ? "No shelters registered yet." : "No shelters match your filters."}
              icon="night_shelter"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((shelter) => {
              const pct = shelter.CAPACITY > 0
                ? Math.round((shelter.CURRENT_OCCUPANCY / shelter.CAPACITY) * 100)
                : 0;
              const isFull = pct >= 100;
              const barColor = pct >= 90 ? "bg-emergency-red" : pct >= 70 ? "bg-warning-amber" : "bg-primary-container";

              return (
                <div
                  key={shelter.SHELTER_ID}
                  className={`bg-slate-surface border border-outline-variant rounded-lg p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group relative overflow-hidden flex flex-col h-full ${
                    isFull ? "hover:border-error" : "hover:border-primary-container"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-headline-md font-headline-md text-on-surface truncate">
                          {shelter.SHELTER_NAME}
                        </h3>
                        <span className="text-data-mono font-data-mono text-on-surface-variant text-[11px] bg-surface-container px-1.5 py-0.5 rounded">
                          {shelter.SHELTER_ID}
                        </span>
                      </div>
                      <p className="text-body-md font-body-md text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {shelter.ADDRESS_LINE || `${shelter.DISTRICT}, ${shelter.DIVISION}`}
                      </p>
                    </div>
                    <Badge variant={isFull ? "danger" : "success"} className="shrink-0">
                      <div className={`w-1.5 h-1.5 rounded-full ${isFull ? "bg-emergency-red" : "bg-stable-emerald animate-pulse"}`} />
                      {shelter.CURRENT_STATUS}
                    </Badge>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-auto mb-4">
                    <div className="flex justify-between text-body-md font-body-md mb-2">
                      <span className="text-on-surface-variant">Occupancy</span>
                      <span className="font-data-mono text-data-mono text-on-surface">
                        <span className={isFull ? "text-emergency-red" : "text-primary"}>
                          {shelter.CURRENT_OCCUPANCY}
                        </span>{" "}
                        / {shelter.CAPACITY}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-700`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <div className="text-right text-label-caps font-label-caps text-on-surface-variant mt-1">
                      {pct}% — {shelter.AVAILABLE_CAPACITY} available
                    </div>
                  </div>

                  <div className="pt-4 border-t border-outline-variant flex justify-between items-center text-body-md font-body-md text-on-surface-variant">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">person</span>
                      {shelter.CONTACT_PERSON_NAME || "—"}
                    </div>
                    <div className="flex items-center gap-2 font-data-mono text-data-mono">
                      <span className="material-symbols-outlined text-[16px]">phone</span>
                      {shelter.CONTACT_PERSON_PHONE || "—"}
                    </div>
                  </div>

                  {shelter.DISASTER_NAME && (
                    <div className="mt-3 pt-3 border-t border-outline-variant/50">
                      <span className="text-label-caps font-label-caps text-on-surface-variant">Disaster: </span>
                      <span className="text-label-caps font-label-caps text-warning-amber">{shelter.DISASTER_NAME}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>

    {/* ─── Add Shelter Drawer ─── */}
    {isDrawerOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsDrawerOpen(false)} />}
    <div className={`fixed inset-y-0 right-0 w-[440px] max-w-[90vw] bg-surface border-l border-outline-variant shadow-2xl z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] flex flex-col ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex justify-between items-center p-4 border-b border-outline-variant bg-surface-container-low shrink-0">
        <div className="flex items-center gap-3">
          <button className="p-1.5 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant" onClick={() => setIsDrawerOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
          <h3 className="text-headline-md font-headline-md text-on-surface font-semibold">Register New Shelter</h3>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {submitSuccess && (
          <div className="bg-stable-emerald/10 border border-stable-emerald/40 rounded-lg p-4 flex items-center gap-3 text-stable-emerald">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="text-body-md font-body-md">Shelter registered successfully!</span>
          </div>
        )}
        {submitError && <div className="bg-emergency-red/10 border border-emergency-red/30 rounded-lg p-3 text-emergency-red text-body-md font-body-md">{submitError}</div>}
        {[
          { key: "shelter_id", label: "Shelter ID *", placeholder: "e.g., S-005" },
          { key: "shelter_name", label: "Shelter Name *", placeholder: "e.g., Dhaka School Camp" },
          { key: "capacity", label: "Capacity *", placeholder: "e.g., 500", type: "number" },
          { key: "contact_person_name", label: "Contact Person", placeholder: "Name" },
          { key: "contact_person_phone", label: "Contact Phone", placeholder: "01711000001" },
          { key: "address_line", label: "Address", placeholder: "Full address" },
          { key: "latitude", label: "Latitude (for map)", placeholder: "e.g., 23.8103" },
          { key: "longitude", label: "Longitude (for map)", placeholder: "e.g., 90.4125" },
        ].map(({ key, label, placeholder, type }) => (
          <div key={key}>
            <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">{label}</label>
            <input type={type ?? "text"} placeholder={placeholder} value={(form as any)[key]} onChange={(e) => setField(key, e.target.value)}
              className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors" />
          </div>
        ))}
        <div>
          <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">Status</label>
          <select value={form.current_status} onChange={(e) => setField("current_status", e.target.value)}
            className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors">
            <option>Open</option><option>Full</option><option>Closed</option>
          </select>
        </div>
        <div>
          <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">Linked Disaster</label>
          <select value={form.disaster_name} onChange={(e) => setField("disaster_name", e.target.value)}
            className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors">
            <option value="">-- None --</option>
            {(disasters ?? []).map((d: any) => <option key={d.DISASTER_NAME} value={d.DISASTER_NAME}>{d.DISASTER_NAME}</option>)}
          </select>
        </div>
      </div>
      <div className="p-4 border-t border-outline-variant shrink-0">
        <Button variant="primary" onClick={handleAddShelter} disabled={submitting} className="w-full justify-center">
          {submitting ? "Saving..." : "Register Shelter"}
        </Button>
      </div>
    </div>
    </>
  );
}

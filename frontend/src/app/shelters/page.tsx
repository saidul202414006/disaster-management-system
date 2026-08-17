"use client";

import { useState } from "react";
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

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-cobalt">
        <span className="material-symbols-outlined icon-thick text-[48px] animate-spin">progress_activity</span>
        <p className="font-bold">Loading shelter data...</p>
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
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row gap-6 items-start">
        {/* Left Filter Sidebar */}
        <aside className="w-full md:w-72 shrink-0 flex flex-col gap-4 sticky top-[104px]">
          {/* Search */}
          <div className="bg-white border border-gray-200 rounded-[2rem] p-6 shadow-sm">
            <div className="relative">
              <span className="material-symbols-outlined icon-thick absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search shelters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-black font-medium rounded-xl pl-11 pr-4 py-3 text-sm focus:border-cobalt focus:ring-2 focus:ring-azure focus:outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-[2rem] p-6 shadow-sm">
            <h2 className="font-display text-xl text-black mb-4 pb-4 border-b border-gray-100 flex items-center justify-between">
              Filters
              {(statusFilters.size > 0 || divisionFilter !== "all" || searchQuery) && (
                <button
                  onClick={() => { setStatusFilters(new Set()); setDivisionFilter("all"); setSearchQuery(""); }}
                  className="font-mono text-xs font-bold text-cobalt uppercase tracking-wider hover:underline"
                >
                  Clear
                </button>
              )}
            </h2>

            {/* Status Filter */}
            <div className="mb-6">
              <h3 className="font-mono text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Status</h3>
              {allStatuses.length === 0 ? (
                <p className="text-sm font-bold text-gray-400">No shelters yet</p>
              ) : (
                allStatuses.map((s) => (
                  <label key={s} className="flex items-center gap-3 cursor-pointer mb-3 group" onClick={() => toggleStatus(s)}>
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        statusFilters.has(s)
                          ? "border-cobalt bg-cobalt text-white"
                          : "border-gray-300 bg-white group-hover:border-cobalt"
                      }`}
                    >
                      {statusFilters.has(s) && (
                        <span className="material-symbols-outlined icon-thick text-[14px]">check</span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-black transition-colors">
                      {s}
                    </span>
                    <span className="ml-auto font-mono text-xs font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                      {shelters.filter((sh) => sh.CURRENT_STATUS === s).length}
                    </span>
                  </label>
                ))
              )}
            </div>

            {/* Division Filter */}
            <div>
              <h3 className="font-mono text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Division</h3>
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-black rounded-xl py-3 px-4 text-sm font-bold focus:border-cobalt focus:ring-2 focus:ring-azure focus:outline-none transition-all cursor-pointer"
              >
                <option value="all">All Divisions</option>
                {allDivisions.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary KPIs */}
          <div className="bg-white border border-gray-200 rounded-[2rem] p-6 shadow-sm">
            <h2 className="font-mono text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 pb-4 border-b border-gray-100">
              Summary {filtered.length !== shelters.length && <span className="text-cobalt">({filtered.length} filtered)</span>}
            </h2>
            <div className="flex flex-col gap-4">
              {[
                { label: "Shelters shown", value: filtered.length, color: "text-black" },
                { label: "Total Capacity", value: totalCapacity.toLocaleString(), color: "text-cobalt" },
                { label: "Occupied", value: totalOccupied.toLocaleString(), color: "text-red-600" },
                { label: "Available", value: totalAvailable.toLocaleString(), color: "text-green-600" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-600">{label}</span>
                  <span className={`font-mono font-bold text-sm bg-gray-50 px-2 py-1 rounded-md border border-gray-100 ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1 flex flex-col min-w-0 gap-6">
          <div className="bg-azure rounded-[2rem] p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 shadow-sm border border-blue-200">
            <div>
              <h1 className="font-display text-4xl text-black uppercase tracking-tight">Shelter Management</h1>
              <p className="font-bold text-black/70 mt-2 text-lg">
                {filtered.length} of {shelters.length} facilities
                {statusFilters.size > 0 && <span className="text-cobalt bg-white px-2 py-1 rounded-lg text-sm ml-2">Filtered: {Array.from(statusFilters).join(", ")}</span>}
                {divisionFilter !== "all" && <span className="text-cobalt bg-white px-2 py-1 rounded-lg text-sm ml-2">{divisionFilter}</span>}
              </p>
            </div>
            <button
              onClick={() => { setForm({ shelter_id: "", shelter_name: "", capacity: "", current_status: "Open", contact_person_name: "", contact_person_phone: "", address_line: "", latitude: "", longitude: "", disaster_name: "" }); setSubmitError(null); setSubmitSuccess(false); setIsDrawerOpen(true); }}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-cobalt hover:bg-cobalt-dark rounded-xl text-white font-bold text-sm transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined icon-thick text-[18px]">add_location_alt</span>
              New Registration
            </button>
          </div>

          {/* Cards Grid */}
          {filtered.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-[2rem] p-12 text-center shadow-sm">
              <span className="material-symbols-outlined icon-thick text-gray-300 text-[64px]">night_shelter</span>
              <h3 className="font-display text-2xl text-black mt-4">No shelters found</h3>
              <p className="text-gray-500 font-bold mt-2">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filtered.map((shelter) => {
                const pct = shelter.CAPACITY > 0
                  ? Math.round((shelter.CURRENT_OCCUPANCY / shelter.CAPACITY) * 100)
                  : 0;
                const isFull = pct >= 100;
                const barColor = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-cobalt";

                return (
                  <div
                    key={shelter.SHELTER_ID}
                    className="bg-white border border-gray-200 rounded-[2rem] p-6 transition-all duration-300 hover:shadow-md hover:border-blue-300 flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="pr-4">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-display text-xl text-black truncate max-w-[200px] sm:max-w-[300px]">
                            {shelter.SHELTER_NAME}
                          </h3>
                          <span className="font-mono text-xs font-bold text-cobalt bg-blue-50 px-2 py-1 rounded-md shrink-0">
                            {shelter.SHELTER_ID}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-500 flex items-center gap-1.5">
                          <span className="material-symbols-outlined icon-thick text-[16px] text-gray-400">location_on</span>
                          {shelter.ADDRESS_LINE || `${shelter.DISTRICT}, ${shelter.DIVISION}`}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wide shrink-0 ${
                        isFull ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isFull ? "bg-red-500" : "bg-green-500 animate-pulse"}`} />
                        {shelter.CURRENT_STATUS}
                      </span>
                    </div>

                    {/* Capacity Bar */}
                    <div className="mt-auto mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-end mb-3">
                        <span className="font-mono text-xs font-bold text-gray-500 uppercase tracking-wider">Occupancy</span>
                        <span className="font-mono font-bold">
                          <span className={isFull ? "text-red-600" : "text-black text-lg"}>
                            {shelter.CURRENT_OCCUPANCY}
                          </span>
                          <span className="text-gray-400 mx-1">/</span>
                          <span className="text-gray-600">{shelter.CAPACITY}</span>
                        </span>
                      </div>
                      <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} rounded-full transition-all duration-700`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <div className="text-right font-bold text-[10px] uppercase tracking-wider text-gray-500 mt-2">
                        {pct}% full — <span className={isFull ? "text-red-500" : "text-green-600"}>{shelter.AVAILABLE_CAPACITY} available</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm font-bold text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined icon-thick text-[16px] text-gray-400">person</span>
                        {shelter.CONTACT_PERSON_NAME || "—"}
                      </div>
                      <div className="flex items-center gap-2 font-mono bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                        <span className="material-symbols-outlined icon-thick text-[16px] text-gray-400">phone</span>
                        {shelter.CONTACT_PERSON_PHONE || "—"}
                      </div>
                    </div>

                    {shelter.DISASTER_NAME && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-gray-500 uppercase tracking-wider">Disaster:</span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-yellow-100 text-yellow-800 font-bold text-xs uppercase tracking-wide border border-yellow-200">
                          {shelter.DISASTER_NAME}
                        </span>
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
      {isDrawerOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsDrawerOpen(false)} />}
      <div className={`fixed inset-y-0 right-0 w-[440px] max-w-[90vw] bg-white border-l border-gray-200 shadow-2xl z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] flex flex-col ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-azure shrink-0">
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-blue-100 transition-colors text-cobalt" onClick={() => setIsDrawerOpen(false)}>
              <span className="material-symbols-outlined icon-thick">close</span>
            </button>
            <h3 className="font-display text-xl text-black">Register Shelter</h3>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700 shadow-sm">
              <span className="material-symbols-outlined icon-thick">check_circle</span>
              <span className="font-bold text-sm">Shelter registered successfully!</span>
            </div>
          )}
          {submitError && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm font-bold shadow-sm">{submitError}</div>}
          
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
              <label className="block font-mono text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
              <input type={type ?? "text"} placeholder={placeholder} value={(form as any)[key]} onChange={(e) => setField(key, e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-cobalt focus:ring-2 focus:ring-azure rounded-xl px-4 py-3 text-sm font-medium text-black placeholder:text-gray-400 outline-none transition-all" />
            </div>
          ))}
          
          <div>
            <label className="block font-mono text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
            <select value={form.current_status} onChange={(e) => setField("current_status", e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-cobalt focus:ring-2 focus:ring-azure rounded-xl px-4 py-3 text-sm font-medium text-black outline-none transition-all">
              <option>Open</option><option>Full</option><option>Closed</option>
            </select>
          </div>
          
          <div>
            <label className="block font-mono text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Linked Disaster</label>
            <select value={form.disaster_name} onChange={(e) => setField("disaster_name", e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-cobalt focus:ring-2 focus:ring-azure rounded-xl px-4 py-3 text-sm font-medium text-black outline-none transition-all">
              <option value="">-- None --</option>
              {(disasters ?? []).map((d: any) => <option key={d.DISASTER_NAME} value={d.DISASTER_NAME}>{d.DISASTER_NAME}</option>)}
            </select>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex shrink-0">
          <button 
            onClick={handleAddShelter} 
            disabled={submitting} 
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-cobalt hover:bg-cobalt-dark text-white transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting ? <span className="material-symbols-outlined icon-thick animate-spin">progress_activity</span> : <span className="material-symbols-outlined icon-thick">save</span>}
            {submitting ? "Saving..." : "Register Shelter"}
          </button>
        </div>
      </div>
    </>
  );
}

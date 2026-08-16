"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { getVictims, createVictim, getDisasters, getVictim } from "@/services/api";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-BD", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type Victim = {
  VICTIM_ID: string;
  HOUSEHOLD_HEAD_NAME: string;
  GENDER: string;
  NID_NUMBER: string;
  REPORTED_DATE: string;
  LAST_KNOWN_LOCATION: string;
  MISSING_PERSON: string;
  SPECIAL_NEEDS: string;
  DISASTER_NAME: string;
  DISASTER_TYPE: string;
  DIVISION: string;
};

type Disaster = {
  DISASTER_NAME: string;
  DISASTER_TYPE: string;
  DIVISION: string;
  DISTRICT: string;
};

type VictimDetail = {
  VICTIM_ID: string;
  HOUSEHOLD_HEAD_NAME: string;
  GENDER: string;
  NID_NUMBER: string;
  REPORTED_DATE: string;
  LAST_KNOWN_LOCATION: string;
  MISSING_PERSON: string;
  SPECIAL_NEEDS: string;
  DISASTER_NAME: string;
  DIVISION: string;
  phones: string[];
  family_members: Array<{ MEMBER_SEQ_NO: number; NAME: string }>;
};

type DrawerMode = "view" | "add";

const EMPTY_FORM = {
  victim_id: "",
  household_head_name: "",
  gender: "",
  nid_number: "",
  reported_date: "",
  last_known_location: "",
  missing_person: "N",
  special_needs: "",
  disaster_name: "",
  phones: "",
  family_members: "",
};

export default function VictimsPage() {
  const { data, loading, error, refetch } = useApi<Victim[]>(getVictims as any);
  const { data: disasters } = useApi<Disaster[]>(getDisasters as any);
  const [victimDetail, setVictimDetail] = useState<VictimDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [selected, setSelected] = useState<Victim | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("view");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [missingFilter, setMissingFilter] = useState<"all" | "Y" | "N">("all");

  // Form state for Add Victim
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const victims = data ?? [];
  const filtered = victims.filter((v) => {
    const matchSearch =
      v.VICTIM_ID?.toLowerCase().includes(search.toLowerCase()) ||
      v.HOUSEHOLD_HEAD_NAME?.toLowerCase().includes(search.toLowerCase()) ||
      (v.NID_NUMBER || "").toLowerCase().includes(search.toLowerCase());
    const matchMissing = missingFilter === "all" || v.MISSING_PERSON === missingFilter;
    return matchSearch && matchMissing;
  });

  if (loading) return <LoadingState message="Loading victim registry..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const missingCount = victims.filter((v) => v.MISSING_PERSON === "Y").length;

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setSubmitError(null);
    setSubmitSuccess(false);
    setDrawerMode("add");
    setIsDrawerOpen(true);
  };

  const openView = (v: Victim) => {
    setSelected(v);
    setDrawerMode("view");
    setIsDrawerOpen(true);
    setVictimDetail(null);
    setDetailLoading(true);
    getVictim(v.VICTIM_ID)
      .then((detail: any) => setVictimDetail(detail))
      .catch(() => setVictimDetail(null))
      .finally(() => setDetailLoading(false));
  };


  const setField = (k: string, val: string) => setForm((p) => ({ ...p, [k]: val }));

  async function handleSubmit() {
    if (!form.victim_id || !form.household_head_name || !form.disaster_name) {
      setSubmitError("Victim ID, Name, and Disaster are required.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createVictim({
        ...form,
        phones: form.phones ? form.phones.split(",").map((p) => p.trim()).filter(Boolean) : [],
        family_members: form.family_members
          ? form.family_members.split(",").map((m) => m.trim()).filter(Boolean)
          : [],
        end_date: null,
      } as any);
      setSubmitSuccess(true);
      refetch();
      setTimeout(() => {
        setIsDrawerOpen(false);
        setSubmitSuccess(false);
      }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to register victim.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-headline-lg font-headline-lg text-on-surface">Victim Registry</h1>
            <p className="text-body-md font-body-md text-on-surface-variant mt-1">
              {victims.length} records
              {missingCount > 0 && (
                <span className="ml-2 text-emergency-red font-semibold">· {missingCount} missing</span>
              )}
            </p>
          </div>
          <Button
            variant="primary"
            icon={<span className="material-symbols-outlined text-[18px]">person_add</span>}
            onClick={openAdd}
          >
            Add New Victim
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-surface border border-outline-variant rounded-xl p-4 flex flex-col lg:flex-row gap-3 items-end shadow-sm">
          {/* Search */}
          <div className="flex-1 w-full relative">
            <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">
              Search ID / Name / NID
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                className="w-full bg-surface-dim border-2 border-transparent focus:border-primary rounded-lg pl-10 pr-3 py-2 text-body-md font-body-md text-on-surface placeholder:text-outline outline-none transition-colors"
                placeholder="e.g., VCT-001 or John..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Missing Person filter */}
          <div>
            <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">Status</label>
            <div className="flex gap-2">
              {[
                { val: "all", label: "All" },
                { val: "Y", label: "Missing" },
                { val: "N", label: "Located" },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setMissingFilter(val as any)}
                  className={`px-3 py-2 rounded text-label-caps font-label-caps transition-colors ${
                    missingFilter === val
                      ? val === "Y"
                        ? "bg-emergency-red text-white"
                        : val === "N"
                        ? "bg-stable-emerald/20 text-stable-emerald border border-stable-emerald/40"
                        : "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Result count */}
          <div className="text-label-caps font-label-caps text-on-surface-variant whitespace-nowrap py-2">
            Showing {filtered.length} / {victims.length}
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-surface border border-outline-variant rounded-xl overflow-hidden flex-1 flex flex-col shadow-sm">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-surface-container-low shadow-sm">
              <TableRow>
                <TableHead>Victim ID</TableHead>
                <TableHead>Household Head</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>NID Number</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Disaster</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <EmptyState
                  message={victims.length === 0 ? "No victims registered yet. Click 'Add New Victim' to begin." : "No victims match your search."}
                  icon="person_search"
                />
              ) : (
                filtered.map((victim) => (
                  <TableRow
                    key={victim.VICTIM_ID}
                    className="cursor-pointer hover:bg-surface-container-high transition-colors"
                    onClick={() => openView(victim)}
                  >
                    <TableCell className="font-data-mono text-data-mono text-primary">
                      {victim.VICTIM_ID}
                    </TableCell>
                    <TableCell className="font-medium text-on-surface">
                      {victim.HOUSEHOLD_HEAD_NAME}
                    </TableCell>
                    <TableCell className="text-on-surface-variant">{victim.GENDER || "—"}</TableCell>
                    <TableCell className="font-data-mono text-data-mono text-on-surface-variant">
                      {victim.NID_NUMBER || "Pending"}
                    </TableCell>
                    <TableCell className="text-on-surface-variant">
                      {victim.REPORTED_DATE ? new Date(victim.REPORTED_DATE).toLocaleDateString("en-BD", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </TableCell>
                    <TableCell>
                      {victim.MISSING_PERSON === "Y" ? (
                        <Badge variant="danger">
                          <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>person_off</span>
                          Missing
                        </Badge>
                      ) : (
                        <Badge variant="success">
                          <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>person_check</span>
                          Located
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="warning">{victim.DISASTER_NAME}</Badge>
                    </TableCell>
                    <TableCell className="text-on-surface-variant">
                      {victim.LAST_KNOWN_LOCATION || "Unknown"}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        className="p-1.5 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
                        title="View Details"
                        onClick={(e) => { e.stopPropagation(); openView(victim); }}
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ─── Slide-out Drawer ─── */}
      <div
        className={`fixed inset-y-0 right-0 w-[480px] max-w-[90vw] bg-surface border-l border-outline-variant shadow-2xl z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] flex flex-col ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex justify-between items-center p-4 border-b border-outline-variant bg-surface-container-low shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="p-1.5 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
              onClick={() => setIsDrawerOpen(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-headline-md font-headline-md text-on-surface font-semibold">
              {drawerMode === "add" ? "Register New Victim" : "Victim Profile"}
            </h3>
          </div>
          {drawerMode === "view" && selected && (
            <Badge variant={selected.MISSING_PERSON === "Y" ? "danger" : "success"}>
              {selected.MISSING_PERSON === "Y" ? "Missing" : "Located"}
            </Badge>
          )}
        </div>

        {/* ── VIEW MODE ── */}
        {drawerMode === "view" && selected && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            <div>
              <h2 className="text-[22px] font-bold text-on-surface">{selected.HOUSEHOLD_HEAD_NAME}</h2>
              <p className="text-data-mono font-data-mono text-primary mt-1">{selected.VICTIM_ID}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Gender", value: selected.GENDER || "—" },
                { label: "NID Number", value: selected.NID_NUMBER || "Pending" },
                { label: "Status", value: selected.MISSING_PERSON === "Y" ? "⚠ Missing" : "✓ Located" },
                { label: "Special Needs", value: selected.SPECIAL_NEEDS || "None" },
                { label: "Last Location", value: selected.LAST_KNOWN_LOCATION || "Unknown" },
                { label: "Disaster", value: selected.DISASTER_NAME },
                { label: "Division", value: selected.DIVISION || "—" },
                { label: "Reported", value: formatDate(selected.REPORTED_DATE) },
              ].map((item) => (
                <div key={item.label} className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/50">
                  <div className="text-label-caps font-label-caps text-on-surface-variant mb-1">{item.label}</div>
                  <div className="font-medium text-on-surface">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Phone Numbers — VICTIM_PHONE multivalued attribute */}
            <div className="bg-surface-container-low rounded-lg border border-outline-variant/50 overflow-hidden">
              <div className="px-4 py-3 border-b border-outline-variant/50 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-command-blue">phone</span>
                <span className="text-label-caps font-label-caps text-on-surface-variant">Contact Phones (VICTIM_PHONE table)</span>
              </div>
              {detailLoading ? (
                <div className="px-4 py-3 text-label-caps font-label-caps text-on-surface-variant">Loading...</div>
              ) : victimDetail?.phones && victimDetail.phones.length > 0 ? (
                <div className="divide-y divide-outline-variant/30">
                  {victimDetail.phones.map((ph, i) => (
                    <div key={i} className="px-4 py-2 font-data-mono text-data-mono text-on-surface">{ph}</div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-label-caps font-label-caps text-on-surface-variant/60">No phone numbers registered</div>
              )}
            </div>

            {/* Family Members — FAMILY_MEMBER weak entity */}
            <div className="bg-surface-container-low rounded-lg border border-outline-variant/50 overflow-hidden">
              <div className="px-4 py-3 border-b border-outline-variant/50 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-warning-amber">group</span>
                <span className="text-label-caps font-label-caps text-on-surface-variant">Family Members (FAMILY_MEMBER weak entity)</span>
              </div>
              {detailLoading ? (
                <div className="px-4 py-3 text-label-caps font-label-caps text-on-surface-variant">Loading...</div>
              ) : victimDetail?.family_members && victimDetail.family_members.length > 0 ? (
                <div className="divide-y divide-outline-variant/30">
                  {victimDetail.family_members.map((fm) => (
                    <div key={fm.MEMBER_SEQ_NO} className="px-4 py-2 flex items-center gap-2">
                      <span className="text-label-caps font-label-caps text-on-surface-variant w-6">#{fm.MEMBER_SEQ_NO}</span>
                      <span className="text-body-md font-body-md text-on-surface">{fm.NAME}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-label-caps font-label-caps text-on-surface-variant/60">No family members registered</div>
              )}
            </div>
          </div>
        )}

        {/* ── ADD MODE ── */}
        {drawerMode === "add" && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {submitSuccess && (
              <div className="bg-stable-emerald/10 border border-stable-emerald/40 rounded-lg p-4 flex items-center gap-3 text-stable-emerald">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="text-body-md font-body-md">Victim registered successfully!</span>
              </div>
            )}
            {submitError && (
              <div className="bg-emergency-red/10 border border-emergency-red/30 rounded-lg p-3 text-emergency-red text-body-md font-body-md">
                {submitError}
              </div>
            )}

            {/* Form Fields */}
            {[
              { key: "victim_id", label: "Victim ID *", placeholder: "e.g., VCT-001", type: "text" },
              { key: "household_head_name", label: "Household Head Name *", placeholder: "Full name", type: "text" },
              { key: "nid_number", label: "NID Number", placeholder: "National ID (unique)", type: "text" },
              { key: "last_known_location", label: "Last Known Location", placeholder: "e.g., Mirpur, Dhaka", type: "text" },
              { key: "reported_date", label: "Reported Date", placeholder: "", type: "date" },
              { key: "phones", label: "Phone Numbers (comma-separated)", placeholder: "e.g., 01711000001, 01711000002", type: "text" },
              { key: "family_members", label: "Family Member Names (comma-separated)", placeholder: "e.g., Jane Doe, John Jr.", type: "text" },
              { key: "special_needs", label: "Special Needs", placeholder: "Medical, disability, etc.", type: "text" },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={(e) => setField(key, e.target.value)}
                  className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors"
                />
              </div>
            ))}

            {/* Gender */}
            <div>
              <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setField("gender", e.target.value)}
                className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors"
              >
                <option value="">-- Select --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Missing Person */}
            <div>
              <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">Missing Person?</label>
              <div className="flex gap-3">
                {[{ val: "N", label: "No — Located" }, { val: "Y", label: "Yes — Missing" }].map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setField("missing_person", val)}
                    className={`flex-1 py-2 rounded text-label-caps font-label-caps border transition-colors ${
                      form.missing_person === val
                        ? val === "Y"
                          ? "bg-emergency-red text-white border-emergency-red"
                          : "bg-stable-emerald/20 text-stable-emerald border-stable-emerald"
                        : "border-outline-variant text-on-surface-variant hover:border-primary"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Disaster Select */}
            <div>
              <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">Disaster Event *</label>
              <select
                value={form.disaster_name}
                onChange={(e) => setField("disaster_name", e.target.value)}
                className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors"
              >
                <option value="">-- Select Disaster --</option>
                {(disasters ?? []).map((d: any) => (
                  <option key={d.DISASTER_NAME} value={d.DISASTER_NAME}>
                    {d.DISASTER_NAME} ({d.DISASTER_TYPE})
                  </option>
                ))}
              </select>
              {(!disasters || disasters.length === 0) && (
                <p className="text-label-caps font-label-caps text-warning-amber mt-1">
                  No disaster events yet — create one first.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Drawer Footer */}
        <div className="p-4 border-t border-outline-variant bg-surface-container flex justify-end gap-3 shrink-0">
          <Button variant="ghost" onClick={() => setIsDrawerOpen(false)}>
            Cancel
          </Button>
          {drawerMode === "add" && (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting}
              icon={
                submitting
                  ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  : <span className="material-symbols-outlined text-[18px]">save</span>
              }
            >
              {submitting ? "Saving..." : "Register Victim"}
            </Button>
          )}
        </div>
      </div>

      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
    </>
  );
}

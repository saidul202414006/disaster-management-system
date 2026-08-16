"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { getPersonnel, createPersonnel } from "@/services/api";

type PersonnelRecord = {
  PERSON_ID: string;
  NAME: string;
  PHONE: string;
  DESIGNATION: string;
  BASE_LOCATION: string;
  SUPERVISOR_ID: string;
  SUPERVISOR_NAME: string;
  PERSONNEL_TYPE: string;
  VOLUNTEER_TEAM: string;
  MEDICAL_SPECIALIZATION: string;
};

const EMPTY_FORM = {
  person_id: "",
  name: "",
  phone: "",
  designation: "",
  base_location: "",
  supervisor_id: "",
  type: "base" as "base" | "volunteer" | "medical",
  team: "",
  specialization: "",
  since_date: "",
};

const TYPE_BADGE: Record<string, "neutral" | "success" | "info"> = {
  Personnel: "neutral",
  Volunteer: "success",
  "Medical Staff": "info",
};

export default function PersonnelPage() {
  const { data, loading, error, refetch } = useApi<PersonnelRecord[]>(getPersonnel as any);
  const [filter, setFilter] = useState<"All" | "Personnel" | "Volunteer" | "Medical Staff">("All");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const personnel = data ?? [];
  const filtered = filter === "All" ? personnel : personnel.filter((p) => p.PERSONNEL_TYPE === filter);

  const setField = (k: string, val: string) => setForm((p) => ({ ...p, [k]: val }));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsDrawerOpen(true);
  };

  async function handleSubmit() {
    if (!form.person_id || !form.name) {
      setSubmitError("Person ID and Name are required.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createPersonnel({
        person_id: form.person_id,
        name: form.name,
        phone: form.phone || null,
        designation: form.designation || null,
        base_location: form.base_location || null,
        supervisor_id: form.supervisor_id || null,
        type: form.type,
        team: form.type === "volunteer" ? form.team || null : null,
        specialization: form.type === "medical" ? form.specialization || null : null,
        since_date: form.type === "medical" && form.since_date ? form.since_date : null,
      });
      setSubmitSuccess(true);
      refetch();
      setTimeout(() => setIsDrawerOpen(false), 1500);
    } catch (err: any) {
      setSubmitError(err.message ?? "Failed to add personnel");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState message="Loading personnel records..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Personnel</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            {personnel.length} total — includes Volunteers and Medical Staff (ISA Specialization)
          </p>
        </div>
        <Button
          variant="primary"
          icon={<span className="material-symbols-outlined text-[18px]">person_add</span>}
          onClick={openAdd}
        >
          Add Personnel
        </Button>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["All", "Personnel", "Volunteer", "Medical Staff"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-full text-label-caps font-label-caps transition-colors ${
              filter === tab
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            {tab} ({tab === "All" ? personnel.length : personnel.filter((p) => p.PERSONNEL_TYPE === tab).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-surface-container-low">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Designation / Specialization</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Base Location</TableHead>
              <TableHead>Supervisor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <EmptyState
                message={personnel.length === 0 ? "No personnel registered yet." : "No records match the current filter."}
                icon="badge"
              />
            ) : (
              filtered.map((p) => (
                <TableRow key={p.PERSON_ID} className="hover:bg-surface-container-high transition-colors">
                  <TableCell className="font-data-mono text-data-mono text-primary">{p.PERSON_ID}</TableCell>
                  <TableCell className="font-medium text-on-surface">{p.NAME}</TableCell>
                  <TableCell>
                    <Badge variant={TYPE_BADGE[p.PERSONNEL_TYPE] ?? "default"}>{p.PERSONNEL_TYPE}</Badge>
                  </TableCell>
                  <TableCell className="text-on-surface-variant">
                    {p.MEDICAL_SPECIALIZATION
                      ? `Dr. ${p.MEDICAL_SPECIALIZATION}`
                      : p.VOLUNTEER_TEAM
                      ? `Team: ${p.VOLUNTEER_TEAM}`
                      : p.DESIGNATION || "—"}
                  </TableCell>
                  <TableCell className="font-data-mono text-data-mono text-on-surface-variant">{p.PHONE || "—"}</TableCell>
                  <TableCell className="text-on-surface-variant">{p.BASE_LOCATION || "—"}</TableCell>
                  <TableCell className="text-on-surface-variant text-sm">
                    {p.SUPERVISOR_NAME ? `${p.SUPERVISOR_NAME} (${p.SUPERVISOR_ID})` : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ─── Add Personnel Drawer ─── */}
      {/* Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-0 right-0 w-[440px] max-w-[90vw] bg-surface border-l border-outline-variant shadow-2xl z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] flex flex-col ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex justify-between items-center p-4 border-b border-outline-variant bg-surface-container-low shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="p-1.5 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
              onClick={() => setIsDrawerOpen(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-headline-md font-headline-md text-on-surface font-semibold">
              Add Personnel
            </h3>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {submitSuccess && (
            <div className="bg-stable-emerald/10 border border-stable-emerald/40 rounded-lg p-4 flex items-center gap-3 text-stable-emerald">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-body-md font-body-md">Personnel added successfully!</span>
            </div>
          )}
          {submitError && (
            <div className="bg-emergency-red/10 border border-emergency-red/30 rounded-lg p-3 text-emergency-red text-body-md font-body-md">
              {submitError}
            </div>
          )}

          {/* Type selector */}
          <div>
            <label className="block text-label-caps font-label-caps text-on-surface-variant mb-2">
              Personnel Type *
            </label>
            <div className="flex gap-2">
              {(["base", "volunteer", "medical"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setField("type", t)}
                  className={`flex-1 py-2 rounded-lg text-label-caps font-label-caps border transition-all ${
                    form.type === t
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface-container border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {t === "base" ? "Personnel" : t === "volunteer" ? "Volunteer" : "Medical"}
                </button>
              ))}
            </div>
          </div>

          {/* Common fields */}
          {[
            { key: "person_id", label: "Person ID *", placeholder: "e.g., P-006" },
            { key: "name", label: "Full Name *", placeholder: "Full name" },
            { key: "phone", label: "Phone", placeholder: "01711000001" },
            { key: "designation", label: "Designation", placeholder: "e.g., Field Supervisor" },
            { key: "base_location", label: "Base Location", placeholder: "e.g., Dhaka" },
            { key: "supervisor_id", label: "Supervisor ID", placeholder: "e.g., P-001 (optional)" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">{label}</label>
              <input
                type="text"
                placeholder={placeholder}
                value={(form as any)[key]}
                onChange={(e) => setField(key, e.target.value)}
                className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors"
              />
            </div>
          ))}

          {/* Volunteer-specific */}
          {form.type === "volunteer" && (
            <div>
              <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">Team</label>
              <input
                type="text"
                placeholder="e.g., Search and Rescue"
                value={form.team}
                onChange={(e) => setField("team", e.target.value)}
                className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors"
              />
            </div>
          )}

          {/* Medical-specific */}
          {form.type === "medical" && (
            <>
              <div>
                <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">Specialization</label>
                <input
                  type="text"
                  placeholder="e.g., Emergency Medicine"
                  value={form.specialization}
                  onChange={(e) => setField("specialization", e.target.value)}
                  className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-label-caps font-label-caps text-on-surface-variant mb-1">Since Date</label>
                <input
                  type="date"
                  value={form.since_date}
                  onChange={(e) => setField("since_date", e.target.value)}
                  className="w-full bg-surface-dim border border-outline-variant focus:border-primary rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface outline-none transition-colors"
                />
              </div>
            </>
          )}
        </div>

        {/* Submit */}
        <div className="p-4 border-t border-outline-variant shrink-0">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full justify-center"
          >
            {submitting ? "Saving..." : "Add Personnel"}
          </Button>
        </div>
      </div>
    </div>
  );
}

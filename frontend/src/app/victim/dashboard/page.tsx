"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type User = { user_id: string; email: string; name: string; role: string; victim_id?: string };
type VictimData = {
  VICTIM_ID: string;
  HOUSEHOLD_HEAD_NAME: string;
  GENDER: string;
  MISSING_PERSON: string;
  SPECIAL_NEEDS: string;
  LAST_KNOWN_LOCATION: string;
  DISASTER_NAME: string;
  phones: string[];
  family_members: Array<{ MEMBER_SEQ_NO: number; NAME: string }>;
};
type ShelterStay = {
  SHELTER_NAME: string;
  SHELTER_ID: string;
  CHECKIN_DATE: string;
  CHECKOUT_DATE: string | null;
  CURRENT_STATUS: string;
  ADDRESS_LINE: string;
  CONTACT_PERSON_PHONE: string;
};

export default function VictimDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [victim, setVictim] = useState<VictimData | null>(null);
  const [stays, setStays] = useState<ShelterStay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("dms_user");
    if (!stored) { router.push("/victim/login"); return; }
    const u = JSON.parse(stored) as User;
    if (u.role !== "victim") { router.push("/"); return; }
    setUser(u);

    // Fetch victim details if linked
    if (u.victim_id) {
      Promise.all([
        fetch(`${API}/victims/${u.victim_id}`).then((r) => r.json()),
        fetch(`${API}/shelters/stays/${u.victim_id}`).then((r) => r.json()).catch(() => ({ data: [] })),
      ]).then(([vData, stayData]) => {
        if (vData.data) setVictim(vData.data);
        if (stayData.data) setStays(stayData.data);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("dms_token");
    localStorage.removeItem("dms_user");
    fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-[40px] animate-pulse text-warning-amber">personal_injury</span>
          <span className="text-label-caps font-label-caps">Loading your portal...</span>
        </div>
      </div>
    );
  }

  const currentStay = stays.find((s) => !s.CHECKOUT_DATE);

  return (
    <div className="min-h-screen bg-navy-bg">
      {/* Header */}
      <header className="border-b border-outline-variant bg-surface px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-warning-amber text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>personal_injury</span>
          <div>
            <div className="text-body-md font-body-md font-bold text-on-surface">Victim Portal</div>
            <div className="text-label-caps font-label-caps text-on-surface-variant">Disaster Management System</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-body-md font-body-md text-on-surface">{user?.name}</div>
            <div className="text-label-caps font-label-caps text-on-surface-variant">{user?.email}</div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-label-caps font-label-caps text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Welcome, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            {victim ? "Your victim record is linked to this account." : "Your account is not yet linked to a victim record."}
          </p>
        </div>

        {/* Current Shelter Assignment */}
        {currentStay ? (
          <div className="bg-stable-emerald/10 border border-stable-emerald/40 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-stable-emerald text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>night_shelter</span>
              <h2 className="text-headline-md font-headline-md text-stable-emerald">Currently at a Shelter</h2>
            </div>
            <div className="bg-surface-container rounded-xl p-4 flex flex-col gap-3">
              <div>
                <div className="text-headline-md font-headline-md text-on-surface">{currentStay.SHELTER_NAME}</div>
                <div className="text-label-caps font-label-caps text-on-surface-variant mt-0.5">{currentStay.SHELTER_ID}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container-low p-3 rounded-lg">
                  <div className="text-label-caps font-label-caps text-on-surface-variant mb-1">Check-in Date</div>
                  <div className="font-medium text-on-surface">
                    {new Date(currentStay.CHECKIN_DATE).toLocaleDateString("en-BD", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric" })}
                  </div>
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg">
                  <div className="text-label-caps font-label-caps text-on-surface-variant mb-1">Status</div>
                  <div className="font-medium text-stable-emerald">{currentStay.CURRENT_STATUS}</div>
                </div>
                {currentStay.ADDRESS_LINE && (
                  <div className="col-span-2 bg-surface-container-low p-3 rounded-lg">
                    <div className="text-label-caps font-label-caps text-on-surface-variant mb-1">Address</div>
                    <div className="text-on-surface">{currentStay.ADDRESS_LINE}</div>
                  </div>
                )}
                {currentStay.CONTACT_PERSON_PHONE && (
                  <div className="col-span-2 bg-surface-container-low p-3 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-command-blue">phone</span>
                    <div>
                      <div className="text-label-caps font-label-caps text-on-surface-variant">Emergency Contact</div>
                      <div className="font-data-mono text-data-mono text-on-surface">{currentStay.CONTACT_PERSON_PHONE}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface border border-outline-variant rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-on-surface-variant text-[22px]">night_shelter</span>
              <h2 className="text-headline-md font-headline-md text-on-surface">Shelter Assignment</h2>
            </div>
            <p className="text-body-md font-body-md text-on-surface-variant">
              You are not currently assigned to any shelter. Contact your local relief coordinator for assistance.
            </p>
          </div>
        )}

        {/* Victim profile summary */}
        {victim && (
          <div className="bg-surface border border-outline-variant rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-warning-amber text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>id_card</span>
              <h2 className="text-headline-md font-headline-md text-on-surface">Your Victim Record</h2>
              <span className="ml-auto text-label-caps font-label-caps font-data-mono text-primary">{victim.VICTIM_ID}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Status", value: victim.MISSING_PERSON === "Y" ? "⚠ Missing" : "✓ Located", color: victim.MISSING_PERSON === "Y" ? "text-emergency-red" : "text-stable-emerald" },
                { label: "Disaster", value: victim.DISASTER_NAME },
                { label: "Last Location", value: victim.LAST_KNOWN_LOCATION || "—" },
                { label: "Special Needs", value: victim.SPECIAL_NEEDS || "None" },
              ].map((item) => (
                <div key={item.label} className="bg-surface-container-low p-3 rounded-lg">
                  <div className="text-label-caps font-label-caps text-on-surface-variant mb-1">{item.label}</div>
                  <div className={`font-medium text-on-surface ${(item as any).color || ""}`}>{item.value}</div>
                </div>
              ))}
            </div>

            {victim.phones?.length > 0 && (
              <div className="mt-3 bg-surface-container-low rounded-lg p-3">
                <div className="text-label-caps font-label-caps text-on-surface-variant mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">phone</span> Registered Phones
                </div>
                <div className="flex flex-wrap gap-2">
                  {victim.phones.map((ph, i) => (
                    <span key={i} className="font-data-mono text-data-mono text-on-surface bg-surface-container px-3 py-1 rounded-full text-sm">
                      {ph}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {victim.family_members?.length > 0 && (
              <div className="mt-3 bg-surface-container-low rounded-lg p-3">
                <div className="text-label-caps font-label-caps text-on-surface-variant mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">group</span> Family Members
                </div>
                <div className="flex flex-col gap-1">
                  {victim.family_members.map((fm) => (
                    <div key={fm.MEMBER_SEQ_NO} className="text-on-surface flex items-center gap-2">
                      <span className="text-on-surface-variant text-[11px] w-5">#{fm.MEMBER_SEQ_NO}</span>
                      <span>{fm.NAME}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No victim record */}
        {!victim && (
          <div className="bg-surface border border-outline-variant rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-warning-amber text-[22px]">id_card</span>
              <h2 className="text-headline-md font-headline-md text-on-surface">No Linked Victim Record</h2>
            </div>
            <p className="text-body-md font-body-md text-on-surface-variant">
              Your account is not yet linked to a victim record in the system. An administrator can link your NID number to your account.
            </p>
          </div>
        )}

        {/* Quick links */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-5">
          <h2 className="text-headline-md font-headline-md text-on-surface mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/view/dashboard"
              className="flex items-center gap-3 p-4 bg-surface-container hover:bg-surface-container-high rounded-xl transition-colors">
              <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
              <div>
                <div className="text-body-md font-body-md text-on-surface font-medium">Public Dashboard</div>
                <div className="text-label-caps font-label-caps text-on-surface-variant">Live updates</div>
              </div>
            </Link>
            <Link href="/view/map"
              className="flex items-center gap-3 p-4 bg-surface-container hover:bg-surface-container-high rounded-xl transition-colors">
              <span className="material-symbols-outlined text-stable-emerald text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
              <div>
                <div className="text-body-md font-body-md text-on-surface font-medium">Shelter Map</div>
                <div className="text-label-caps font-label-caps text-on-surface-variant">Find nearby</div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

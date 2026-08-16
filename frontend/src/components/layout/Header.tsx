"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/map", label: "Live Map" },
  { href: "/victims", label: "Registry" },
  { href: "/shelters", label: "Shelters" },
];

type SearchResult = {
  type: "disaster" | "victim" | "shelter";
  label: string;
  sub: string;
  href: string;
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const [disRes, vicRes] = await Promise.all([
          fetch(`${API}/disasters?search=${encodeURIComponent(search)}`).then((r) => r.json()),
          fetch(`${API}/victims?search=${encodeURIComponent(search)}`).then((r) => r.json()),
        ]);
        const disasterResults: SearchResult[] = (disRes.data ?? []).slice(0, 4).map((d: any) => ({
          type: "disaster",
          label: d.DISASTER_NAME,
          sub: `${d.DISASTER_TYPE} · ${d.DIVISION}${d.DISTRICT ? `, ${d.DISTRICT}` : ""}`,
          href: `/disasters`,
        }));
        const victimResults: SearchResult[] = (vicRes.data ?? []).slice(0, 3).map((v: any) => ({
          type: "victim",
          label: v.HOUSEHOLD_HEAD_NAME,
          sub: `${v.VICTIM_ID} · ${v.DISASTER_NAME ?? "—"}`,
          href: `/victims`,
        }));
        setResults([...disasterResults, ...victimResults]);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [search]);

  function handleSelect(href: string) {
    setSearch("");
    setShowDropdown(false);
    router.push(href);
  }

  const ICON_MAP = {
    disaster: { icon: "crisis_alert", color: "text-emergency-red" },
    victim: { icon: "personal_injury", color: "text-warning-amber" },
    shelter: { icon: "night_shelter", color: "text-stable-emerald" },
  };

  return (
    <header className="flex justify-between items-center w-full px-6 h-[48px] bg-surface-container-high border-b border-outline-variant shadow-sm sticky top-0 z-50">
      {/* Left: Brand + Search + Nav */}
      <div className="flex items-center gap-5">
        <Link href="/dashboard" className="text-headline-md font-headline-md font-black text-on-surface hover:text-primary transition-colors">
          Disaster Ops CC
        </Link>

        {/* Global Search — real API */}
        <div className="relative hidden md:block group" ref={searchRef}>
          <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] transition-colors group-focus-within:text-primary">
            {searching ? "progress_activity" : "search"}
          </span>
          <input
            className="bg-surface-dim border-2 border-transparent focus:border-primary rounded-DEFAULT pl-8 pr-3 py-1 text-body-md font-body-md text-on-surface w-52 focus:w-72 transition-all duration-300 placeholder-on-surface-variant focus:outline-none"
            placeholder="Search disasters, victims..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
          />
          {search && (
            <button onClick={() => { setSearch(""); setShowDropdown(false); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 mt-1 w-80 bg-surface border border-outline-variant rounded-xl shadow-2xl overflow-hidden z-50">
              {results.length === 0 ? (
                <div className="px-4 py-3 text-on-surface-variant text-body-md font-body-md">No results found</div>
              ) : (
                <>
                  {results.map((r, i) => {
                    const { icon, color } = ICON_MAP[r.type];
                    return (
                      <button key={i} onClick={() => handleSelect(r.href)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors text-left border-b border-outline-variant last:border-0">
                        <span className={`material-symbols-outlined text-[18px] ${color} shrink-0`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                        <div className="min-w-0">
                          <div className="text-on-surface text-body-md font-body-md truncate">{r.label}</div>
                          <div className="text-on-surface-variant text-label-caps font-label-caps truncate">{r.sub}</div>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>

        {/* Quick Nav */}
        <nav className="hidden lg:flex gap-1 items-center h-full">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link key={link.href} href={link.href}
                className={`h-full flex items-center px-3 py-1 text-body-md font-body-md transition-all border-b-2 ${
                  active
                    ? "text-primary border-primary"
                    : "text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline"
                }`}>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Link href="/disasters/new"
          className="bg-emergency-red/10 border border-emergency-red/30 text-emergency-red hover:bg-emergency-red hover:text-on-primary transition-all active:scale-95 px-3 py-1 rounded text-label-caps font-label-caps flex items-center gap-1.5 duration-200">
          <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          New Incident
        </Link>
        <div className="flex items-center gap-1 text-on-surface-variant">
          <Link href="/view/dashboard" title="Public View"
            className="hover:text-primary hover:bg-surface-container-high transition-colors p-1.5 rounded">
            <span className="material-symbols-outlined text-[20px]">public</span>
          </Link>
          <Link href="/query-builder" title="SQL Query Builder"
            className="hover:text-primary hover:bg-surface-container-high transition-colors p-1.5 rounded">
            <span className="material-symbols-outlined text-[20px]">manage_search</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

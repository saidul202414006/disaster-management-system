"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getSystemStatus } from "@/services/api";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    title: "",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
      { href: "/map", label: "Live Map", icon: "map" },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/disasters", label: "Disasters", icon: "crisis_alert" },
      { href: "/disasters/new", label: "New Incident", icon: "add_alert" },
      { href: "/victims", label: "Victim Registry", icon: "list_alt" },
      { href: "/shelters", label: "Shelters", icon: "house" },
    ],
  },
  {
    title: "Logistics",
    items: [
      { href: "/warehouse", label: "Warehouses", icon: "warehouse" },
      { href: "/relief", label: "Relief Dist.", icon: "local_shipping" },
      { href: "/vehicles", label: "Fleet", icon: "directions_car" },
      { href: "/donations", label: "Donations", icon: "volunteer_activism" },
    ],
  },
  {
    title: "People",
    items: [
      { href: "/personnel", label: "Personnel", icon: "badge" },
      { href: "/volunteers", label: "Volunteers", icon: "groups" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/query-builder", label: "SQL Queries", icon: "manage_search" },
    ],
  },
];

type DBStatus = "checking" | "connected" | "disconnected";

export default function Sidebar() {
  const pathname = usePathname();
  const [dbStatus, setDbStatus] = useState<DBStatus>("checking");

  useEffect(() => {
    const checkStatus = () => {
      getSystemStatus()
        .then((s) => setDbStatus(s.database ? "connected" : "disconnected"))
        .catch(() => setDbStatus("disconnected"));
    };
    checkStatus();
    // Re-check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (href: string) => {
    if (href === "/disasters/new") return pathname === href;
    if (href === "/disasters") return pathname === "/disasters" || (pathname.startsWith("/disasters/") && pathname !== "/disasters/new");
    return pathname === href || pathname.startsWith(href + "/");
  };

  const statusDot =
    dbStatus === "connected"
      ? "bg-stable-emerald"
      : dbStatus === "checking"
      ? "bg-warning-amber animate-pulse"
      : "bg-emergency-red";

  const statusText =
    dbStatus === "connected"
      ? "Oracle DB: Connected"
      : dbStatus === "checking"
      ? "Oracle DB: Checking..."
      : "Oracle DB: Disconnected";

  return (
    <aside className="w-[260px] h-full flex flex-col border-r border-outline-variant bg-surface hidden md:flex shrink-0">
      {/* Logo / Branding */}
      <div className="p-6 bg-surface-container-low flex flex-col gap-1 border-b border-outline-variant">
        <span className="text-headline-md font-headline-md font-bold text-primary">
          Mission Control
        </span>
        <span className="text-body-md font-body-md text-on-surface-variant">
          Disaster Management System
        </span>
      </div>

      {/* New Incident CTA */}
      <div className="p-4">
        <Link
          href="/disasters/new"
          className="w-full bg-surface-container-highest hover:bg-command-blue border border-outline-variant hover:border-transparent text-primary hover:text-on-primary transition-all duration-200 active:scale-95 py-2 rounded-DEFAULT text-label-caps font-label-caps flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Incident
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1 custom-scrollbar">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title || "main"}>
            {section.title && (
              <div className="text-label-caps font-label-caps text-on-surface-variant px-3 mt-4 mb-2">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 ${
                    active
                      ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-[10px]"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px] transition-all"
                    style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span className="text-body-md font-body-md">{item.label}</span>
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer — DB Status indicator (dynamic) */}
      <div className="p-3 border-t border-outline-variant shrink-0">
        <div className="px-3 py-2 rounded-lg bg-surface-container flex items-center gap-2 text-label-caps font-label-caps text-on-surface-variant">
          <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot}`} />
          <span className="truncate">{statusText}</span>
        </div>
      </div>
    </aside>
  );
}

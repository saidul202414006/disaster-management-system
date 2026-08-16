"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";

// Routes where we do NOT show the admin Header + Sidebar
// Landing page, auth pages, and public viewer pages use their own layouts
const NO_SHELL_PREFIXES = ["/admin", "/victim", "/view"];
const NO_SHELL_EXACT = ["/"];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideShell =
    NO_SHELL_EXACT.includes(pathname) ||
    NO_SHELL_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (hideShell) {
    // Full-screen layout — no sidebar or header
    return <>{children}</>;
  }

  // Admin shell layout — Header + Sidebar
  return (
    <>
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-navy-bg relative">
          {children}
        </main>
      </div>
    </>
  );
}

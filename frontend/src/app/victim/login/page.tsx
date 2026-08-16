"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TacticalAuthLayout from "@/components/layout/TacticalAuthLayout";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function VictimLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Please enter your email and password."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/auth/victim/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      if (data.data?.token) {
        localStorage.setItem("dms_token", data.data.token);
        localStorage.setItem("dms_user", JSON.stringify(data.data));
      }
      router.push("/victim/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <TacticalAuthLayout
      title="Victim Portal"
      subtitle="Sign in to view your shelter assignment and relief status"
      backHref="/"
      illustrationType="victim"
    >
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-gray-400 text-xs font-medium mb-2">Registered Email Address</label>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="w-full bg-[#111827]/70 border border-gray-700 focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/70 rounded-lg px-4 py-3 text-sm text-gray-100 outline-none transition-all placeholder:text-gray-600"
          />
        </div>
        <div>
          <label className="block text-gray-400 text-xs font-medium mb-2">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            className="w-full bg-[#111827]/70 border border-gray-700 focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/70 rounded-lg px-4 py-3 text-sm text-gray-100 outline-none transition-all placeholder:text-gray-600 tracking-widest"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-70 disabled:cursor-not-allowed text-gray-900 font-bold py-3.5 rounded-lg transition-all duration-200 active:scale-[0.98] mt-4 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          {loading ? (
            <><span className="material-symbols-outlined text-[20px] animate-spin">refresh</span> Accessing...</>
          ) : (
            <>Secure Login <span className="material-symbols-outlined text-[20px]">login</span></>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-400">
        Not registered?{" "}
        <Link href="/victim/register" className="text-emerald-400 hover:text-emerald-300 transition-colors">
          Create an account
        </Link>
      </div>
    </TacticalAuthLayout>
  );
}

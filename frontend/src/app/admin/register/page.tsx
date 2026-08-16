"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TacticalAuthLayout from "@/components/layout/TacticalAuthLayout";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"register" | "verify">("register");
  const [regEmail, setRegEmail] = useState("");

  // Step 1 form
  const [form, setForm] = useState({ full_name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2 (OTP)
  const [otp, setOtp] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.password) {
      setError("Name, email, and password are required.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/auth/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");
      setRegEmail(form.email);
      setStep("verify");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setVerifyError("Please enter the 6-digit OTP.");
      return;
    }
    setVerifyLoading(true);
    setVerifyError(null);
    try {
      const res = await fetch(`${API}/auth/admin/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed.");
      setVerified(true);
      setTimeout(() => router.push("/admin/login"), 2000);
    } catch (err: any) {
      setVerifyError(err.message);
    } finally {
      setVerifyLoading(false);
    }
  }

  return (
    <TacticalAuthLayout
      title={step === "register" ? "Secure Registration" : "Identity Verification"}
      subtitle={step === "register" ? "Request access to the tactical mission control dashboard" : `Enter the 6-digit verification code sent to ${regEmail}`}
      backHref="/"
      illustrationType="admin"
    >
      {/* Registration Step */}
      {step === "register" && (
        <>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-2">Full Name / Operator ID</label>
              <input
                type="text"
                placeholder="John Doe"
                value={form.full_name}
                onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                className="w-full bg-[#111827]/70 border border-gray-700 focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/70 rounded-lg px-4 py-2.5 text-sm text-gray-100 outline-none transition-all placeholder:text-gray-600"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-2">Secure Email Address</label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full bg-[#111827]/70 border border-gray-700 focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/70 rounded-lg px-4 py-2.5 text-sm text-gray-100 outline-none transition-all placeholder:text-gray-600"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-2">Phone Number (Optional)</label>
              <input
                type="tel"
                placeholder="+880 1XXXXXXXXX"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full bg-[#111827]/70 border border-gray-700 focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/70 rounded-lg px-4 py-2.5 text-sm text-gray-100 outline-none transition-all placeholder:text-gray-600"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full bg-[#111827]/70 border border-gray-700 focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/70 rounded-lg px-4 py-2.5 text-sm text-gray-100 outline-none transition-all placeholder:text-gray-600 tracking-widest"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 disabled:opacity-70 disabled:cursor-not-allowed text-gray-900 font-bold py-3 rounded-lg transition-all duration-200 active:scale-[0.98] mt-2 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
            >
              {loading ? (
                <><span className="material-symbols-outlined text-[18px] animate-spin">refresh</span> Requesting Access...</>
              ) : (
                <>Request Access <span className="material-symbols-outlined text-[18px]">how_to_reg</span></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have clearance?{" "}
            <Link href="/admin/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Sign in here
            </Link>
          </div>
        </>
      )}

      {/* Verification Step */}
      {step === "verify" && (
        <>
          {verified ? (
             <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-4 text-emerald-400 text-sm mb-6 flex flex-col items-center justify-center gap-2 text-center">
               <span className="material-symbols-outlined text-[40px] mb-2">verified_user</span>
               <strong>Identity Verified</strong>
               <p className="text-xs">Uplink established. Redirecting to login...</p>
             </div>
          ) : (
            <>
              {verifyError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {verifyError}
                </div>
              )}

              <form onSubmit={handleVerify} className="flex flex-col gap-5">
                <div>
                  <label className="block text-cyan-400 text-xs font-bold mb-3 tracking-widest text-center">AUTH_CODE</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="------"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.toUpperCase())}
                    className="w-full bg-[#111827]/70 border border-cyan-500/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg px-4 py-4 text-3xl font-mono text-center text-white outline-none transition-all placeholder:text-gray-700 tracking-[0.5em]"
                  />
                  <p className="text-xs text-gray-500 mt-3 text-center">Code expires in 10 minutes</p>
                </div>
                
                <button
                  type="submit"
                  disabled={verifyLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 disabled:opacity-70 disabled:cursor-not-allowed text-gray-900 font-bold py-3.5 rounded-lg transition-all duration-200 active:scale-[0.98] mt-2 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                >
                  {verifyLoading ? (
                    <><span className="material-symbols-outlined text-[20px] animate-spin">refresh</span> Verifying...</>
                  ) : (
                    <>Confirm Identity <span className="material-symbols-outlined text-[20px]">fingerprint</span></>
                  )}
                </button>
              </form>
            </>
          )}
        </>
      )}
    </TacticalAuthLayout>
  );
}
